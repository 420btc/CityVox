<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameState } from '@/stores/useGameState.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const gameState = useGameState()

// Definir los logros disponibles
const achievements = computed(() => [
  // Logros Básicos
  {
    id: 'firstFactory',
    name: t('dashboardFooter.firstFactory'),
    description: 'Construye tu primera fábrica',
    icon: '🏭',
    unlocked: hasFactoryBuilding.value,
    progress: hasFactoryBuilding.value ? 100 : 0,
    category: 'industrial'
  },
  {
    id: 'industrialTycoon',
    name: t('dashboardFooter.industrialTycoon'),
    description: 'Construye 5 edificios industriales',
    icon: '🏆',
    unlocked: industrialBuildingCount.value >= 5,
    progress: Math.min((industrialBuildingCount.value / 5) * 100, 100),
    category: 'industrial'
  },
  {
    id: 'cityBuilder',
    name: 'Constructor de Ciudad',
    description: 'Construye 10 edificios en total',
    icon: '🏗️',
    unlocked: gameState.buildingCount >= 10,
    progress: Math.min((gameState.buildingCount / 10) * 100, 100),
    category: 'general'
  },
  {
    id: 'richMayor',
    name: 'Alcalde Rico',
    description: 'Acumula 50,000 créditos',
    icon: '💰',
    unlocked: gameState.credits >= 50000,
    progress: Math.min((gameState.credits / 50000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'greenCity',
    name: 'Ciudad Verde',
    description: 'Construye 3 parques',
    icon: '🌳',
    unlocked: parkCount.value >= 3,
    progress: Math.min((parkCount.value / 3) * 100, 100),
    category: 'environmental'
  },
  {
    id: 'megaCity',
    name: 'Mega Ciudad',
    description: 'Alcanza una población de 100 habitantes',
    icon: '🏙️',
    unlocked: gameState.population >= 100,
    progress: Math.min((gameState.population / 100) * 100, 100),
    category: 'general'
  },
  
  // Logros Económicos
  {
    id: 'millionaire',
    name: 'Millonario',
    description: 'Acumula 100,000 créditos',
    icon: '💎',
    unlocked: gameState.credits >= 100000,
    progress: Math.min((gameState.credits / 100000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'dailyEarner',
    name: 'Ganador Diario',
    description: 'Genera 1,000 créditos por día',
    icon: '📈',
    unlocked: gameState.dailyIncome >= 1000,
    progress: Math.min((gameState.dailyIncome / 1000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'economicGiant',
    name: 'Gigante Económico',
    description: 'Genera 5,000 créditos por día',
    icon: '🏦',
    unlocked: gameState.dailyIncome >= 5000,
    progress: Math.min((gameState.dailyIncome / 5000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'commercialKing',
    name: 'Rey Comercial',
    description: 'Construye 10 edificios comerciales',
    icon: '🛍️',
    unlocked: commercialBuildingCount.value >= 10,
    progress: Math.min((commercialBuildingCount.value / 10) * 100, 100),
    category: 'economic'
  },
  
  // Logros Industriales
  {
    id: 'factoryMaster',
    name: 'Maestro de Fábricas',
    description: 'Construye 10 fábricas',
    icon: '⚙️',
    unlocked: factoryCount.value >= 10,
    progress: Math.min((factoryCount.value / 10) * 100, 100),
    category: 'industrial'
  },
  {
    id: 'nuclearPioneer',
    name: 'Pionero Nuclear',
    description: 'Construye tu primera planta nuclear',
    icon: '☢️',
    unlocked: hasNuclearPlant.value,
    progress: hasNuclearPlant.value ? 100 : 0,
    category: 'industrial'
  },
  {
    id: 'chemicalExpert',
    name: 'Experto Químico',
    description: 'Construye 3 fábricas químicas',
    icon: '🧪',
    unlocked: chemicalFactoryCount.value >= 3,
    progress: Math.min((chemicalFactoryCount.value / 3) * 100, 100),
    category: 'industrial'
  },
  {
    id: 'powerSupplier',
    name: 'Proveedor de Energía',
    description: 'Genera 100 unidades de energía',
    icon: '⚡',
    unlocked: gameState.maxPower >= 100,
    progress: Math.min((gameState.maxPower / 100) * 100, 100),
    category: 'industrial'
  },
  
  // Logros Ambientales
  {
    id: 'ecoWarrior',
    name: 'Guerrero Ecológico',
    description: 'Construye 10 parques',
    icon: '🌲',
    unlocked: parkCount.value >= 10,
    progress: Math.min((parkCount.value / 10) * 100, 100),
    category: 'environmental'
  },
  {
    id: 'solarAdvocate',
    name: 'Defensor Solar',
    description: 'Construye 5 paneles solares',
    icon: '☀️',
    unlocked: solarPanelCount.value >= 5,
    progress: Math.min((solarPanelCount.value / 5) * 100, 100),
    category: 'environmental'
  },
  {
    id: 'windFarmer',
    name: 'Granjero Eólico',
    description: 'Construye 5 torres eólicas',
    icon: '🌬️',
    unlocked: windTowerCount.value >= 5,
    progress: Math.min((windTowerCount.value / 5) * 100, 100),
    category: 'environmental'
  },
  {
    id: 'cleanCity',
    name: 'Ciudad Limpia',
    description: 'Mantén la contaminación por debajo de 50',
    icon: '✨',
    unlocked: gameState.pollution < 50,
    progress: gameState.pollution < 50 ? 100 : Math.max(0, 100 - gameState.pollution),
    category: 'environmental'
  },
  {
    id: 'wasteManager',
    name: 'Gestor de Residuos',
    description: 'Construye 3 estaciones de basura',
    icon: '🗑️',
    unlocked: garbageStationCount.value >= 3,
    progress: Math.min((garbageStationCount.value / 3) * 100, 100),
    category: 'environmental'
  },
  
  // Logros Residenciales
  {
    id: 'housingDeveloper',
    name: 'Desarrollador Inmobiliario',
    description: 'Construye 15 edificios residenciales',
    icon: '🏘️',
    unlocked: residentialBuildingCount.value >= 15,
    progress: Math.min((residentialBuildingCount.value / 15) * 100, 100),
    category: 'residential'
  },
  {
    id: 'populationBoom',
    name: 'Boom Poblacional',
    description: 'Alcanza 500 habitantes',
    icon: '👥',
    unlocked: gameState.population >= 500,
    progress: Math.min((gameState.population / 500) * 100, 100),
    category: 'residential'
  },
  {
    id: 'metropolis',
    name: 'Metrópolis',
    description: 'Alcanza 1,000 habitantes',
    icon: '🌆',
    unlocked: gameState.population >= 1000,
    progress: Math.min((gameState.population / 1000) * 100, 100),
    category: 'residential'
  },
  {
    id: 'luxuryLiving',
    name: 'Vida de Lujo',
    description: 'Construye 5 mansiones',
    icon: '🏰',
    unlocked: mansionCount.value >= 5,
    progress: Math.min((mansionCount.value / 5) * 100, 100),
    category: 'residential'
  },
  
  // Logros de Servicios
  {
    id: 'healthcareProvider',
    name: 'Proveedor de Salud',
    description: 'Construye 3 hospitales',
    icon: '🏥',
    unlocked: gameState.hospitalCount >= 3,
    progress: Math.min((gameState.hospitalCount / 3) * 100, 100),
    category: 'services'
  },
  {
    id: 'lawEnforcer',
    name: 'Aplicador de la Ley',
    description: 'Construye 3 estaciones de policía',
    icon: '👮',
    unlocked: gameState.policeStationCount >= 3,
    progress: Math.min((gameState.policeStationCount / 3) * 100, 100),
    category: 'services'
  },
  {
    id: 'fireChief',
    name: 'Jefe de Bomberos',
    description: 'Construye 3 estaciones de bomberos',
    icon: '🚒',
    unlocked: gameState.fireStationCount >= 3,
    progress: Math.min((gameState.fireStationCount / 3) * 100, 100),
    category: 'services'
  },
  {
    id: 'waterSupplier',
    name: 'Proveedor de Agua',
    description: 'Construye 5 torres de agua',
    icon: '🚰',
    unlocked: waterTowerCount.value >= 5,
    progress: Math.min((waterTowerCount.value / 5) * 100, 100),
    category: 'services'
  },
  
  // Logros de Infraestructura
  {
    id: 'roadBuilder',
    name: 'Constructor de Carreteras',
    description: 'Construye 20 segmentos de carretera',
    icon: '🛣️',
    unlocked: roadCount.value >= 20,
    progress: Math.min((roadCount.value / 20) * 100, 100),
    category: 'infrastructure'
  },
  {
    id: 'networkMaster',
    name: 'Maestro de Redes',
    description: 'Construye 50 segmentos de carretera',
    icon: '🗺️',
    unlocked: roadCount.value >= 50,
    progress: Math.min((roadCount.value / 50) * 100, 100),
    category: 'infrastructure'
  },
  
  // Logros de Tiempo y Progreso
  {
    id: 'weekSurvivor',
    name: 'Superviviente de la Semana',
    description: 'Sobrevive 7 días',
    icon: '📅',
    unlocked: gameState.gameDay >= 7,
    progress: Math.min((gameState.gameDay / 7) * 100, 100),
    category: 'time'
  },
  {
    id: 'monthMaster',
    name: 'Maestro del Mes',
    description: 'Sobrevive 30 días',
    icon: '🗓️',
    unlocked: gameState.gameDay >= 30,
    progress: Math.min((gameState.gameDay / 30) * 100, 100),
    category: 'time'
  },
  {
    id: 'yearVeteran',
    name: 'Veterano del Año',
    description: 'Sobrevive 365 días',
    icon: '🎂',
    unlocked: gameState.gameDay >= 365,
    progress: Math.min((gameState.gameDay / 365) * 100, 100),
    category: 'time'
  },
  
  // Logros de Estabilidad
  {
    id: 'stableLeader',
    name: 'Líder Estable',
    description: 'Mantén la estabilidad al 100%',
    icon: '⚖️',
    unlocked: gameState.stability >= 100,
    progress: gameState.stability,
    category: 'stability'
  },
  {
    id: 'crisisManager',
    name: 'Gestor de Crisis',
    description: 'Recupera la estabilidad después de caer por debajo del 50%',
    icon: '🆘',
    unlocked: gameState.stability >= 80 && hasLowStability.value,
    progress: hasLowStability.value ? Math.min(gameState.stability, 100) : 0,
    category: 'stability'
  },
  
  // Logros Especiales
  {
    id: 'perfectBalance',
    name: 'Equilibrio Perfecto',
    description: 'Mantén todos los recursos en niveles óptimos',
    icon: '⚖️',
    unlocked: isPerfectBalance.value,
    progress: isPerfectBalance.value ? 100 : 0,
    category: 'special'
  },
  {
    id: 'architect',
    name: 'Arquitecto Maestro',
    description: 'Construye al menos un edificio de cada tipo',
    icon: '📐',
    unlocked: hasAllBuildingTypes.value,
    progress: (uniqueBuildingTypes.value / totalBuildingTypes.value) * 100,
    category: 'special'
  },
  {
    id: 'cityPlanner',
    name: 'Planificador Urbano',
    description: 'Construye 100 edificios en total',
    icon: '📋',
    unlocked: gameState.buildingCount >= 100,
    progress: Math.min((gameState.buildingCount / 100) * 100, 100),
    category: 'special'
  }
])

// Computed para contar edificios específicos
const hasFactoryBuilding = computed(() => {
  return gameState.metadata.some(row => 
    row.some(tile => tile.building === 'factory' || tile.building === 'chemical_factory')
  )
})

const industrialBuildingCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && ['factory', 'chemical_factory', 'nuclear_plant'].includes(tile.building)) {
        count++
      }
    })
  })
  return count
})

const parkCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'park') {
        count++
      }
    })
  })
  return count
})

// Nuevas propiedades computadas para los logros adicionales
const commercialBuildingCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && ['shop', 'mall', 'market', 'restaurant'].includes(tile.building)) {
        count++
      }
    })
  })
  return count
})

const factoryCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'factory') {
        count++
      }
    })
  })
  return count
})

const hasNuclearPlant = computed(() => {
  return gameState.metadata.some(row => 
    row.some(tile => tile.building === 'nuclear_plant')
  )
})

const chemicalFactoryCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'chemical_factory') {
        count++
      }
    })
  })
  return count
})

const solarPanelCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'solar_panel') {
        count++
      }
    })
  })
  return count
})

const windTowerCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'wind_tower') {
        count++
      }
    })
  })
  return count
})

const garbageStationCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'garbage_station') {
        count++
      }
    })
  })
  return count
})

const residentialBuildingCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && ['house', 'apartment', 'mansion', 'condo'].includes(tile.building)) {
        count++
      }
    })
  })
  return count
})

const mansionCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'mansion') {
        count++
      }
    })
  })
  return count
})

const waterTowerCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'water_tower') {
        count++
      }
    })
  })
  return count
})

const roadCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'road') {
        count++
      }
    })
  })
  return count
})

const hasLowStability = computed(() => {
  // Simular que el jugador ha tenido baja estabilidad en algún momento
  return gameState.minStabilityReached < 50 || false
})

const isPerfectBalance = computed(() => {
  // Verificar si todos los recursos están en niveles óptimos
  return gameState.stability >= 90 && 
         gameState.pollution < 30 && 
         gameState.credits >= 10000 &&
         gameState.population >= 50
})

const hasAllBuildingTypes = computed(() => {
  const requiredTypes = ['house', 'factory', 'shop', 'park', 'hospital', 'police_station']
  const builtTypes = new Set()
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building) {
        builtTypes.add(tile.building)
      }
    })
  })
  return requiredTypes.every(type => builtTypes.has(type))
})

const uniqueBuildingTypes = computed(() => {
  const builtTypes = new Set()
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building) {
        builtTypes.add(tile.building)
      }
    })
  })
  return builtTypes.size
})

const totalBuildingTypes = computed(() => {
  return 20 // Número total de tipos de edificios disponibles en el juego
})

// Filtrar logros por categoría
const categories = [
  { id: 'all', name: 'Todos', icon: '🏆' },
  { id: 'general', name: 'General', icon: '🏗️' },
  { id: 'economic', name: 'Económico', icon: '💰' },
  { id: 'industrial', name: 'Industrial', icon: '🏭' },
  { id: 'environmental', name: 'Ambiental', icon: '🌳' },
  { id: 'residential', name: 'Residencial', icon: '🏘️' },
  { id: 'services', name: 'Servicios', icon: '🏥' },
  { id: 'infrastructure', name: 'Infraestructura', icon: '🛣️' },
  { id: 'time', name: 'Tiempo', icon: '📅' },
  { id: 'stability', name: 'Estabilidad', icon: '⚖️' },
  { id: 'special', name: 'Especiales', icon: '⭐' }
]

const selectedCategory = ref('all')

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(achievement => achievement.category === selectedCategory.value)
})

const unlockedCount = computed(() => {
  return achievements.value.filter(achievement => achievement.unlocked).length
})

function closeModal() {
  emit('close')
}

function handleContentClick(e) {
  e.stopPropagation()
}

function getCategoryColor(category) {
  const colors = {
    general: 'text-blue-400',
    industrial: 'text-orange-400',
    economic: 'text-yellow-400',
    environmental: 'text-green-400'
  }
  return colors[category] || 'text-gray-400'
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <div
      class="industrial-panel shadow-industrial max-w-4xl w-full max-h-[90vh] overflow-hidden"
      @click="handleContentClick"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🏆</span>
          <div>
            <h2 class="text-xl font-bold text-industrial-accent neon-text">
              {{ t('dashboardFooter.achievements') }}
            </h2>
            <p class="text-sm text-gray-400">
              {{ unlockedCount }} / {{ achievements.length }} logros desbloqueados
            </p>
          </div>
        </div>
        <button
          class="text-gray-400 hover:text-white transition-colors p-2"
          @click="closeModal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Category Filter -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category.id"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="[
              selectedCategory === category.id
                ? 'bg-industrial-accent text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
            @click="selectedCategory = category.id"
          >
            <span class="mr-1">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Achievements Grid -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            class="achievement-card p-4 rounded-lg border transition-all duration-200"
            :class="[
              achievement.unlocked
                ? 'bg-gray-800 border-industrial-accent shadow-lg'
                : 'bg-gray-900 border-gray-700'
            ]"
          >
            <div class="flex items-start space-x-3">
              <div
                class="text-3xl flex-shrink-0"
                :class="achievement.unlocked ? '' : 'grayscale opacity-50'"
              >
                {{ achievement.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <h3
                    class="font-bold text-sm"
                    :class="[
                      achievement.unlocked
                        ? 'text-industrial-accent'
                        : 'text-gray-400'
                    ]"
                  >
                    {{ achievement.name }}
                  </h3>
                  <span
                    v-if="achievement.unlocked"
                    class="text-xs bg-green-600 text-white px-2 py-1 rounded-full"
                  >
                    ✓ Desbloqueado
                  </span>
                </div>
                <p class="text-xs text-gray-400 mb-3">
                  {{ achievement.description }}
                </p>
                
                <!-- Progress Bar -->
                <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    :class="[
                      achievement.unlocked
                        ? 'bg-industrial-accent'
                        : 'bg-gray-600'
                    ]"
                    :style="{ width: `${achievement.progress}%` }"
                  />
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500">
                    {{ Math.round(achievement.progress) }}% completado
                  </span>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="getCategoryColor(achievement.category)"
                  >
                    {{ categories.find(c => c.id === achievement.category)?.name || achievement.category }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div
          v-if="filteredAchievements.length === 0"
          class="text-center py-12"
        >
          <div class="text-6xl mb-4 opacity-50">🏆</div>
          <p class="text-gray-400">
            No hay logros en esta categoría
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 bg-gray-900">
        <div class="flex items-center justify-between text-sm text-gray-400">
          <span>
            Progreso total: {{ Math.round((unlockedCount / achievements.length) * 100) }}%
          </span>
          <span>
            ¡Sigue construyendo para desbloquear más logros!
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievement-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
}

.neon-text {
  text-shadow: 0 0 10px currentColor;
}

.industrial-panel {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid #404040;
}

.industrial-accent {
  color: #00ff88;
}
</style>