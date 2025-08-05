import { ref, computed } from 'vue'
import { useGameState } from '@/stores/useGameState.js'
import { BUILDING_DATA } from '@/constants/constants.js'
import OpenAI from 'openai'

const isEnabled = ref(false)
const isPlaying = ref(false)
const actionCallbacks = ref([])
let openai = null
let gameInterval = null
let lastGameState = null

// Sistema de memoria de la IA
const lastAIAction = ref(null)
const stepCounter = ref(0)
const timeUntilNextStep = ref(25)
const aiMemory = ref({
  lastAction: null,
  lastActionTime: null,
  totalSteps: 0,
  currentPhase: 'initial', // initial, roads, buildings, expansion
  builtRoads: [],
  builtBuildings: [],
  failedAttempts: [], // Registro de intentos fallidos para evitar repetir errores
  nextGoal: 'Construir carreteras básicas para conectar la ciudad'
})

export function useAIPlayer() {
  const gameState = useGameState()

  const initializeAI = () => {
    const primaryKey = localStorage.getItem('openai_api_key_primary')
    const secondaryKey = localStorage.getItem('openai_api_key_secondary')
    
    // Usar la clave principal si existe, sino la secundaria
    const apiKey = primaryKey || secondaryKey
    
    if (apiKey) {
      openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      })
      
      // Marcar si estamos usando fallback
      if (!primaryKey && secondaryKey) {
        console.log('Using secondary API key as fallback')
      }
    }
  }

  const startAI = () => {
    if (!openai) {
      initializeAI()
    }
    
    if (!openai) {
      throw new Error('API key de OpenAI no configurada')
    }

    isEnabled.value = true
    isPlaying.value = true
    
    // Comenzar el ciclo de juego de la IA
    startGameLoop()
    
    // Enviar mensaje inicial a la IA
    sendInitialPrompt()
  }

  const stopAI = () => {
    isEnabled.value = false
    isPlaying.value = false
    
    if (gameInterval) {
      clearInterval(gameInterval)
      gameInterval = null
    }
  }

  const startGameLoop = () => {
    // Reiniciar contador
    timeUntilNextStep.value = 25
    
    // Contador que se actualiza cada segundo
    const countdownInterval = setInterval(() => {
      if (isPlaying.value) {
        timeUntilNextStep.value--
        if (timeUntilNextStep.value <= 0) {
          timeUntilNextStep.value = 25 // Reiniciar para el próximo ciclo
        }
      } else {
        clearInterval(countdownInterval)
      }
    }, 1000)
    
    // La IA toma decisiones cada 25 segundos
    gameInterval = setInterval(async () => {
      if (isPlaying.value) {
        stepCounter.value++
        await makeAIDecision()
        timeUntilNextStep.value = 25 // Reiniciar contador después de cada decisión
      }
    }, 25000)
  }

  const sendInitialPrompt = async () => {
    const gameInfo = getGameStateInfo()
    const occupiedTiles = getOccupiedTilesInfo()
    const prompt = `
Eres una IA que juega a un juego de construcción de ciudades similar a SimCity. Tu objetivo es construir y gestionar una ciudad próspera.

Reglas del juego:
1. Tienes un mapa de 17x17 casillas (coordenadas de 0 a 16)
2. Cada casilla puede contener: grass (césped), road (carretera), o un edificio
3. TODAS las casas y edificios DEBEN estar conectados por carreteras
4. Las casas NECESITAN electricidad para funcionar
5. Los paneles solares (sun_power) y energía eólica (wind_power) generan electricidad SOLO si están conectados por carreteras
6. La industria (factory, chemistry, nuke_factory) DEBE estar alejada del núcleo urbano residencial
7. Tienes créditos limitados para construir
8. Los edificios generan ingresos, consumen energía y pueden producir contaminación
9. Necesitas equilibrar residencial, comercial, industrial e infraestructura

IMPORTANTE - CASILLAS OCUPADAS:
${occupiedTiles}

Prioridades de construcción:
1. Construir red de carreteras primero
2. Colocar generadores de energía (sun_power, wind_power) conectados por carreteras
3. Construir casas cerca del centro, todas conectadas por carreteras
4. Colocar industria en los bordes del mapa, lejos de las casas
5. Agregar servicios (hospital, police, fire_station) distribuidos

Tipos de edificios disponibles:
${getBuildingTypesInfo()}

Estado actual del juego:
${gameInfo}

ANTES DE CONSTRUIR: Siempre verifica que la casilla esté libre consultando la lista de casillas ocupadas arriba. NO intentes construir en casillas que ya tienen edificios o carreteras.

Responde SOLO con acciones en formato JSON:
{
  "action": "build",
  "type": "road", 
  "x": 8,
  "y": 8,
  "reasoning": "Construyo una carretera en el centro para comenzar la infraestructura"
}

Acciones disponibles:
- build: construir edificio/carretera
- upgrade: mejorar edificio existente
- demolish: demoler edificio
- wait: esperar sin hacer nada

Comienza ahora:`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })

      const aiResponse = response.choices[0].message.content
      await processAIResponse(aiResponse)
    } catch (error) {
      console.error('Error en prompt inicial:', error)
      emitAction({
        description: `Error al inicializar IA: ${error.message}`,
        important: true
      })
    }
  }

  const makeAIDecision = async () => {
    if (!openai || !isPlaying.value) return

    const gameInfo = getGameStateInfo()
    const memoryInfo = getMemoryInfo()
    const occupiedTiles = getOccupiedTilesInfo()
    
    const powerBalance = getPowerBalance()
    const prompt = `
Estado actual del juego:
${gameInfo}

Memoria de la IA:
${memoryInfo}

CASILLAS OCUPADAS ACTUALES:
${occupiedTiles}

BALANCE ENERGÉTICO:
${powerBalance}

Analiza la situación y decide tu próxima acción. REGLAS CRÍTICAS:
1. TODAS las casas y edificios DEBEN estar conectados por carreteras
2. Las casas NECESITAN electricidad: construye sun_power o wind_power conectados por carreteras
3. La industria (factory, chemistry, nuke_factory) DEBE estar en los bordes, lejos de casas
4. Revisa tu último paso y continúa con la estrategia
5. Si solo has construido carreteras, DEBES empezar a construir edificios
6. Prioriza: carreteras básicas → generadores de energía → casas → comercios → industria en bordes → servicios
7. GESTIÓN ENERGÉTICA INTELIGENTE:
   - Solo construye generadores de energía si la energía actual < energía máxima - 20
   - NO construyas más de 2 generadores seguidos sin construir edificios que consuman energía
   - Prioriza casas y comercios antes que más generadores si ya tienes energía suficiente
8. Mantén equilibrio entre residencial, comercial e industrial
9. Construye infraestructura cuando sea necesario
10. CRÍTICO: NO construyas en casillas ocupadas. Verifica la lista de casillas ocupadas antes de elegir coordenadas.

Responde SOLO con una acción en formato JSON:
{
  "action": "build|upgrade|demolish|wait",
  "type": "tipo_edificio",
  "x": coordenada_x,
  "y": coordenada_y,
  "reasoning": "explicación de la decisión basada en tu memoria y casillas disponibles"
}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      })

      const aiResponse = response.choices[0].message.content
      await processAIResponse(aiResponse)
    } catch (error) {
      console.error('Error en decisión de IA:', error)
      emitAction({
        description: `Error en decisión: ${error.message}`,
        important: false
      })
    }
  }

  const processAIResponse = async (response) => {
    try {
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[^}]*\}/)
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta')
      }

      const action = JSON.parse(jsonMatch[0])
      
      // Validar acción
      if (!action.action || !['build', 'upgrade', 'demolish', 'wait'].includes(action.action)) {
        throw new Error('Acción no válida')
      }

      // Actualizar memoria antes de ejecutar
      updateAIMemory(action)
      
      // Ejecutar acción
      await executeAction(action)
      
    } catch (error) {
      console.error('Error procesando respuesta de IA:', error)
      emitAction({
        description: `Error procesando respuesta: ${error.message}`,
        important: false
      })
    }
  }

  const executeAction = async (action) => {
    const { action: actionType, type, x, y, reasoning } = action

    switch (actionType) {
      case 'build':
        await executeBuildAction(type, x, y, reasoning)
        break
      case 'upgrade':
        await executeUpgradeAction(x, y, reasoning)
        break
      case 'demolish':
        await executeDemolishAction(x, y, reasoning)
        break
      case 'wait':
        emitAction({
          description: `IA decide esperar: ${reasoning}`,
          important: false
        })
        break
    }
  }

  const executeBuildAction = async (buildingType, x, y, reasoning) => {
    // Validar coordenadas
    if (x < 0 || x >= 17 || y < 0 || y >= 17) {
      emitAction({
        description: `Coordenadas inválidas: (${x}, ${y})`,
        coordinates: { x, y },
        important: false
      })
      return
    }

    const tile = gameState.getTile(x, y)
    if (!tile) {
      emitAction({
        description: `No se puede acceder a la casilla (${x}, ${y})`,
        coordinates: { x, y },
        important: false
      })
      return
    }

    // Verificar si la casilla está vacía
    if (tile.building) {
      const nearbyFree = findNearbyFreeTiles(x, y, 3)
      const suggestion = nearbyFree.length > 0 ? 
        ` Casillas libres cercanas: ${nearbyFree.slice(0, 3).map(pos => `(${pos.x},${pos.y})`).join(', ')}` : 
        ' No hay casillas libres cercanas.'
      
      // Registrar intento fallido en memoria
      aiMemory.value.failedAttempts.push({
        x,
        y,
        reason: `Casilla ocupada con ${tile.building}`,
        time: new Date().toLocaleTimeString()
      })
      
      // Mantener solo los últimos 10 intentos fallidos
      if (aiMemory.value.failedAttempts.length > 10) {
        aiMemory.value.failedAttempts = aiMemory.value.failedAttempts.slice(-10)
      }
      
      emitAction({
        description: `❌ Casilla ocupada en (${x}, ${y}) con ${tile.building}.${suggestion}`,
        coordinates: { x, y },
        important: true
      })
      return
    }

    let cost = 0
    let buildingData = null

    if (buildingType === 'road') {
      cost = 50 // Costo de carretera
    } else {
      buildingData = BUILDING_DATA[buildingType]
      if (!buildingData) {
        emitAction({
          description: `Tipo de edificio desconocido: ${buildingType}`,
          coordinates: { x, y },
          important: false
        })
        return
      }
      cost = buildingData.levels[1].cost
    }

    // Verificar si hay suficientes créditos
    if (gameState.credits < cost) {
      emitAction({
        description: `Créditos insuficientes para ${buildingType}. Necesario: ${cost}, Disponible: ${gameState.credits}`,
        coordinates: { x, y },
        important: true
      })
      return
    }

    // Construir
    try {
      console.log(`AI: Intentando construir ${buildingType} en (${x}, ${y})`)
      
      if (buildingType === 'road') {
        const tileData = {
          type: 'ground',
          building: 'road',
          direction: 0
        }
        console.log(`AI: Llamando setTile para carretera:`, tileData)
        gameState.setTile(x, y, tileData)
      } else {
        const tileData = {
          type: 'ground',
          building: buildingType,
          level: 1,
          detail: buildingData.levels[1],
          direction: 0
        }
        console.log(`AI: Llamando setTile para edificio:`, tileData)
        gameState.setTile(x, y, tileData)
      }

      gameState.updateCredits(-cost)
      console.log(`AI: Construcción completada en (${x}, ${y})`)
      
      // Verificar que el tile se actualizó
      const updatedTile = gameState.getTile(x, y)
      console.log(`AI: Tile después de construcción:`, updatedTile)

      emitAction({
        description: `Construido ${buildingType} en (${x}, ${y}). Costo: ${cost}. Razón: ${reasoning}`,
        coordinates: { x, y },
        details: { type: buildingType, cost, reasoning },
        important: true
      })
    } catch (error) {
      emitAction({
        description: `Error construyendo ${buildingType}: ${error.message}`,
        coordinates: { x, y },
        important: false
      })
    }
  }

  const executeUpgradeAction = async (x, y, reasoning) => {
    const tile = gameState.getTile(x, y)
    if (!tile || !tile.building || tile.building === 'road') {
      emitAction({
        description: `No hay edificio para mejorar en (${x}, ${y})`,
        coordinates: { x, y },
        important: false
      })
      return
    }

    const buildingData = BUILDING_DATA[tile.building]
    if (!buildingData) {
      emitAction({
        description: `Datos de edificio no encontrados para ${tile.building}`,
        coordinates: { x, y },
        important: false
      })
      return
    }

    const currentLevel = tile.level || 1
    const currentLevelData = buildingData.levels[currentLevel]
    
    if (!currentLevelData.upgradeCost || !currentLevelData.nextLevel) {
      emitAction({
        description: `${tile.building} en (${x}, ${y}) no se puede mejorar más`,
        coordinates: { x, y },
        important: false
      })
      return
    }

    if (gameState.credits < currentLevelData.upgradeCost) {
      emitAction({
        description: `Créditos insuficientes para mejorar. Necesario: ${currentLevelData.upgradeCost}, Disponible: ${gameState.credits}`,
        coordinates: { x, y },
        important: true
      })
      return
    }

    // Mejorar edificio
    const nextLevel = currentLevelData.nextLevel
    const nextLevelData = buildingData.levels[nextLevel]

    gameState.setTile(x, y, {
      ...tile,
      level: nextLevel,
      detail: nextLevelData
    })

    gameState.updateCredits(-currentLevelData.upgradeCost)

    emitAction({
      description: `Mejorado ${tile.building} a nivel ${nextLevel} en (${x}, ${y}). Costo: ${currentLevelData.upgradeCost}. Razón: ${reasoning}`,
      coordinates: { x, y },
      details: { type: tile.building, fromLevel: currentLevel, toLevel: nextLevel, cost: currentLevelData.upgradeCost, reasoning },
      important: true
    })
  }

  const executeDemolishAction = async (x, y, reasoning) => {
    const tile = gameState.getTile(x, y)
    if (!tile || !tile.building) {
      emitAction({
        description: `No hay edificio para demoler en (${x}, ${y})`,
        coordinates: { x, y },
        important: false
      })
      return
    }

    const buildingType = tile.building
    
    // Demoler (devolver 25% del costo)
    let refund = 0
    if (buildingType === 'road') {
      refund = Math.floor(50 * 0.25)
    } else {
      const buildingData = BUILDING_DATA[buildingType]
      if (buildingData && tile.detail) {
        refund = Math.floor(tile.detail.cost * 0.25)
      }
    }

    gameState.setTile(x, y, {
      type: 'grass',
      building: null,
      direction: 0
    })

    gameState.updateCredits(refund)

    emitAction({
      description: `Demolido ${buildingType} en (${x}, ${y}). Reembolso: ${refund}. Razón: ${reasoning}`,
      coordinates: { x, y },
      details: { type: buildingType, refund, reasoning },
      important: true
    })
  }

  const getGameStateInfo = () => {
    const stats = {
      credits: gameState.credits,
      day: gameState.gameDay,
      population: gameState.population,
      maxPopulation: gameState.maxPopulation,
      dailyIncome: gameState.dailyIncome,
      power: gameState.power,
      maxPower: gameState.maxPower,
      stability: gameState.stability,
      buildingCount: gameState.buildingCount
    }

    // Contar edificios por tipo
    const buildingCounts = {}
    let roadCount = 0
    let emptyTiles = 0

    gameState.metadata.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (tile.building === 'road') {
          roadCount++
        } else if (tile.building) {
          buildingCounts[tile.building] = (buildingCounts[tile.building] || 0) + 1
        } else {
          emptyTiles++
        }
      })
    })

    return `
Estadísticas:
- Créditos: ${stats.credits}
- Día: ${stats.day}
- Población: ${stats.population}/${stats.maxPopulation}
- Ingresos diarios: ${stats.dailyIncome}
- Energía: ${stats.power}/${stats.maxPower}
- Estabilidad: ${stats.stability}%
- Total edificios: ${stats.buildingCount}
- Carreteras: ${roadCount}
- Casillas vacías: ${emptyTiles}

Edificios por tipo:
${Object.entries(buildingCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Mapa actual (17x17, solo edificios):
${getMapVisualization()}`
  }

  const getMapVisualization = () => {
    const symbols = {
      'grass': '.',
      'road': 'R',
      'house': 'H',
      'house2': 'h',
      'shop': 'S',
      'office': 'O',
      'factory': 'F',
      'chemistry': 'C',
      'nuke_factory': 'N',
      'hospital': '+',
      'police': 'P',
      'fire_station': 'f',
      'garbage_station': 'G',
      'water_tower': 'W',
      'sun_power': 's',
      'wind_power': 'w',
      'tree': 'T',
      'hero_park': 'p'
    }

    let map = ''
    for (let y = 0; y < 17; y++) {
      for (let x = 0; x < 17; x++) {
        const tile = gameState.metadata[x][y]
        const symbol = tile.building ? (symbols[tile.building] || '?') : symbols[tile.type] || '.'
        map += symbol
      }
      map += '\n'
    }
    return map
  }

  const getOccupiedTilesInfo = () => {
    const occupiedTiles = []
    
    gameState.metadata.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (tile.building) {
          occupiedTiles.push({
            x,
            y,
            type: tile.building,
            level: tile.level || 1
          })
        }
      })
    })

    if (occupiedTiles.length === 0) {
      return "Todas las casillas están libres (mapa vacío)."
    }

    let info = `Casillas ocupadas (${occupiedTiles.length} total):\n`
    occupiedTiles.forEach(tile => {
      info += `- (${tile.x}, ${tile.y}): ${tile.type}${tile.level > 1 ? ` nivel ${tile.level}` : ''}\n`
    })
    
    info += "\nCasillas libres disponibles para construir: Cualquier coordenada (x,y) donde x,y van de 0 a 16 que NO esté en la lista anterior."
    
    return info
  }

  const getPowerBalance = () => {
    const currentPower = gameState.power
    const maxPower = gameState.maxPower
    const powerDeficit = currentPower - maxPower
    
    // Contar generadores de energía
    let solarPanels = 0
    let windTurbines = 0
    let recentPowerBuildings = 0
    
    gameState.metadata.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (tile.building === 'sun_power') solarPanels++
        if (tile.building === 'wind_power') windTurbines++
      })
    })
    
    // Verificar construcciones recientes de energía
    const recentBuildings = aiMemory.value.builtBuildings.slice(-5) // Últimos 5 edificios
    recentPowerBuildings = recentBuildings.filter(b => b.type === 'sun_power' || b.type === 'wind_power').length
    
    let recommendation = ''
    if (powerDeficit >= 0) {
      recommendation = '✅ Energía suficiente. Prioriza construcción de casas y comercios.'
    } else if (Math.abs(powerDeficit) <= 20) {
      recommendation = '⚠️ Energía justa. Considera construir 1 generador más.'
    } else {
      recommendation = '❌ Déficit energético crítico. Construye generadores de energía URGENTE.'
    }
    
    if (recentPowerBuildings >= 2) {
      recommendation += ' 🚫 ALTO: Has construido muchos generadores recientemente. Construye edificios que consuman energía.'
    }
    
    return `
Energía actual: ${currentPower}
Energía máxima: ${maxPower}
Balance: ${powerDeficit >= 0 ? '+' : ''}${powerDeficit}
Paneles solares: ${solarPanels}
Turbinas eólicas: ${windTurbines}
Generadores construidos recientemente: ${recentPowerBuildings}/5

Recomendación: ${recommendation}`
  }

  const findNearbyFreeTiles = (centerX, centerY, radius = 3) => {
    const freeTiles = []
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = centerX + dx
        const y = centerY + dy
        
        // Verificar que esté dentro del mapa
        if (x >= 0 && x < 17 && y >= 0 && y < 17) {
          const tile = gameState.getTile(x, y)
          if (tile && !tile.building) {
            const distance = Math.abs(dx) + Math.abs(dy) // Distancia Manhattan
            freeTiles.push({ x, y, distance })
          }
        }
      }
    }
    
    // Ordenar por distancia (más cercanas primero)
    return freeTiles.sort((a, b) => a.distance - b.distance)
  }

  const getBuildingTypesInfo = () => {
    return Object.entries(BUILDING_DATA).map(([key, data]) => {
      const level1 = data.levels[1]
      return `- ${key}: ${data.name.es} (${data.category}) - Costo: ${level1.cost}, Población: ${level1.maxPopulation || 0}, Energía: ${level1.powerUsage || 0}`
    }).join('\n')
  }

  const getMemoryInfo = () => {
    const memory = aiMemory.value
    let memoryText = `
Paso actual: ${stepCounter.value}
Última acción: ${memory.lastAction || 'Ninguna'}
Tiempo de última acción: ${memory.lastActionTime || 'N/A'}
Total de pasos: ${memory.totalSteps}
Fase actual: ${memory.currentPhase}
Carreteras construidas: ${memory.builtRoads.length}
Edificios construidos: ${memory.builtBuildings.length}
Próximo objetivo: ${memory.nextGoal}

Historial reciente:
${memory.builtRoads.slice(-3).map(road => `- Carretera en (${road.x}, ${road.y})`).join('\n')}
${memory.builtBuildings.slice(-3).map(building => `- ${building.type} en (${building.x}, ${building.y})`).join('\n')}`
    
    if (memory.failedAttempts.length > 0) {
      memoryText += `\n\nIntentos fallidos recientes (EVITAR estas coordenadas):
${memory.failedAttempts.slice(-5).map(attempt => `- (${attempt.x}, ${attempt.y}): ${attempt.reason}`).join('\n')}`
    }
    
    return memoryText
  }

  const updateAIMemory = (action) => {
    const memory = aiMemory.value
    const now = new Date().toLocaleTimeString()
    
    // Actualizar información básica
    memory.lastAction = `${action.action} ${action.type || ''} en (${action.x || 'N/A'}, ${action.y || 'N/A'})`
    memory.lastActionTime = now
    memory.totalSteps = stepCounter.value
    lastAIAction.value = memory.lastAction
    
    // Registrar construcciones
    if (action.action === 'build' && action.x !== undefined && action.y !== undefined) {
      if (action.type === 'road') {
        memory.builtRoads.push({ x: action.x, y: action.y, time: now })
      } else {
        memory.builtBuildings.push({ type: action.type, x: action.x, y: action.y, time: now })
      }
    }
    
    // Actualizar fase y objetivo
    updateAIPhase(memory)
  }

  const updateAIPhase = (memory) => {
    const roadCount = memory.builtRoads.length
    const buildingCount = memory.builtBuildings.length
    
    if (roadCount === 0) {
      memory.currentPhase = 'initial'
      memory.nextGoal = 'Construir carreteras básicas para conectar la ciudad'
    } else if (roadCount < 5) {
      memory.currentPhase = 'roads'
      memory.nextGoal = 'Completar red básica de carreteras'
    } else if (buildingCount === 0) {
      memory.currentPhase = 'start_buildings'
      memory.nextGoal = 'URGENTE: Empezar a construir casas para generar población'
    } else if (buildingCount < 3) {
      memory.currentPhase = 'basic_buildings'
      memory.nextGoal = 'Construir más casas y un comercio básico'
    } else {
      memory.currentPhase = 'expansion'
      memory.nextGoal = 'Expandir con industria y servicios'
    }
  }

  const sendMessage = async (message) => {
    if (!openai) {
      throw new Error('IA no inicializada')
    }

    const gameInfo = getGameStateInfo()
    const fullPrompt = `
Mensaje del usuario: ${message}

Estado actual del juego:
${gameInfo}

Responde al usuario y si es necesario, proporciona una acción en formato JSON.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: fullPrompt }],
        max_tokens: 500,
        temperature: 0.7
      })

      const aiResponse = response.choices[0].message.content
      
      // Si la respuesta contiene una acción, ejecutarla
      const jsonMatch = aiResponse.match(/\{[^}]*\}/)
      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[0])
          await executeAction(action)
        } catch (error) {
          console.error('Error ejecutando acción del chat:', error)
        }
      }

      return aiResponse
    } catch (error) {
      // Si falla la API key principal, intentar con la secundaria
      const primaryKey = localStorage.getItem('openai_api_key_primary')
      const secondaryKey = localStorage.getItem('openai_api_key_secondary')
      
      if (primaryKey && secondaryKey && openai.apiKey === primaryKey) {
        console.log('Primary API key failed, trying secondary...')
        
        // Cambiar a la API key secundaria
        openai = new OpenAI({
          apiKey: secondaryKey,
          dangerouslyAllowBrowser: true
        })
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: fullPrompt }],
            max_tokens: 500,
            temperature: 0.7
          })

          const aiResponse = response.choices[0].message.content
          
          // Si la respuesta contiene una acción, ejecutarla
          const jsonMatch = aiResponse.match(/\{[^}]*\}/)
          if (jsonMatch) {
            try {
              const action = JSON.parse(jsonMatch[0])
              await executeAction(action)
            } catch (error) {
              console.error('Error ejecutando acción del chat:', error)
            }
          }

          return aiResponse
        } catch (secondaryError) {
          throw new Error(`Ambas API keys fallaron. Principal: ${error.message}, Secundaria: ${secondaryError.message}`)
        }
      } else {
        throw error
      }
    }
  }

  const emitAction = (action) => {
    actionCallbacks.value.forEach(callback => callback(action))
  }

  const onAction = (callback) => {
    actionCallbacks.value.push(callback)
    
    // Retornar función para desuscribirse
    return () => {
      const index = actionCallbacks.value.indexOf(callback)
      if (index > -1) {
        actionCallbacks.value.splice(index, 1)
      }
    }
  }

  // Inicializar si ya hay API key (compatibilidad con versión anterior o nuevas claves)
  if (localStorage.getItem('openai_api_key') || localStorage.getItem('openai_api_key_primary') || localStorage.getItem('openai_api_key_secondary')) {
    // Migrar clave antigua si existe
    const oldKey = localStorage.getItem('openai_api_key')
    if (oldKey && !localStorage.getItem('openai_api_key_primary')) {
      localStorage.setItem('openai_api_key_primary', oldKey)
      localStorage.removeItem('openai_api_key')
    }
    initializeAI()
  }

  return {
    isEnabled: computed(() => isEnabled.value),
    isPlaying: computed(() => isPlaying.value),
    lastAIAction: computed(() => lastAIAction.value),
    stepCounter: computed(() => stepCounter.value),
    timeUntilNextStep: computed(() => timeUntilNextStep.value),
    aiMemory: computed(() => aiMemory.value),
    initializeAI,
    startAI,
    stopAI,
    sendMessage,
    onAction
  }
}

// Singleton para mantener estado global
let aiPlayerInstance = null

export function getAIPlayerInstance() {
  if (!aiPlayerInstance) {
    aiPlayerInstance = useAIPlayer()
  }
  return aiPlayerInstance
}