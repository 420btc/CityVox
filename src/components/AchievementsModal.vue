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
  },
  
  // Logros Económicos Adicionales
  {
    id: 'economicEmpire',
    name: 'Imperio Económico',
    description: 'Acumula 500,000 créditos',
    icon: '👑',
    unlocked: gameState.credits >= 500000,
    progress: Math.min((gameState.credits / 500000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'taxCollector',
    name: 'Recaudador de Impuestos',
    description: 'Genera 10,000 créditos por día',
    icon: '💸',
    unlocked: gameState.dailyIncome >= 10000,
    progress: Math.min((gameState.dailyIncome / 10000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'retailMagnate',
    name: 'Magnate del Comercio',
    description: 'Construye 20 tiendas',
    icon: '🏪',
    unlocked: shopCount.value >= 20,
    progress: Math.min((shopCount.value / 20) * 100, 100),
    category: 'economic'
  },
  {
    id: 'businessTycoon',
    name: 'Magnate de Negocios',
    description: 'Construye 15 oficinas',
    icon: '🏢',
    unlocked: officeCount.value >= 15,
    progress: Math.min((officeCount.value / 15) * 100, 100),
    category: 'economic'
  },
  {
    id: 'wealthAccumulator',
    name: 'Acumulador de Riqueza',
    description: 'Mantén más de 100,000 créditos por 10 días',
    icon: '💰',
    unlocked: gameState.wealthyDays >= 10,
    progress: Math.min((gameState.wealthyDays / 10) * 100, 100),
    category: 'economic'
  },
  {
    id: 'profitMaster',
    name: 'Maestro de Ganancias',
    description: 'Alcanza un ingreso diario de 20,000 créditos',
    icon: '📊',
    unlocked: gameState.dailyIncome >= 20000,
    progress: Math.min((gameState.dailyIncome / 20000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'marketDominator',
    name: 'Dominador del Mercado',
    description: 'Construye 5 centros comerciales',
    icon: '🛒',
    unlocked: mallCount.value >= 5,
    progress: Math.min((mallCount.value / 5) * 100, 100),
    category: 'economic'
  },
  {
    id: 'financialGuru',
    name: 'Gurú Financiero',
    description: 'Genera 1,000,000 créditos en total',
    icon: '🎯',
    unlocked: gameState.totalEarnings >= 1000000,
    progress: Math.min((gameState.totalEarnings / 1000000) * 100, 100),
    category: 'economic'
  },
  
  // Logros de Servicios Adicionales
  {
    id: 'emergencyNetwork',
    name: 'Red de Emergencias',
    description: 'Construye 5 hospitales, 5 estaciones de policía y 5 de bomberos',
    icon: '🚨',
    unlocked: gameState.hospitalCount >= 5 && gameState.policeStationCount >= 5 && gameState.fireStationCount >= 5,
    progress: Math.min(((gameState.hospitalCount + gameState.policeStationCount + gameState.fireStationCount) / 15) * 100, 100),
    category: 'services'
  },
  {
    id: 'medicalCenter',
    name: 'Centro Médico',
    description: 'Construye 10 hospitales',
    icon: '🏥',
    unlocked: gameState.hospitalCount >= 10,
    progress: Math.min((gameState.hospitalCount / 10) * 100, 100),
    category: 'services'
  },
  {
    id: 'safetyFirst',
    name: 'Seguridad Primero',
    description: 'Construye 10 estaciones de policía',
    icon: '🚔',
    unlocked: gameState.policeStationCount >= 10,
    progress: Math.min((gameState.policeStationCount / 10) * 100, 100),
    category: 'services'
  },
  {
    id: 'fireProtection',
    name: 'Protección contra Incendios',
    description: 'Construye 10 estaciones de bomberos',
    icon: '🔥',
    unlocked: gameState.fireStationCount >= 10,
    progress: Math.min((gameState.fireStationCount / 10) * 100, 100),
    category: 'services'
  },
  {
    id: 'waterNetwork',
    name: 'Red de Agua',
    description: 'Construye 15 torres de agua',
    icon: '💧',
    unlocked: waterTowerCount.value >= 15,
    progress: Math.min((waterTowerCount.value / 15) * 100, 100),
    category: 'services'
  },
  {
    id: 'educationAdvocate',
    name: 'Defensor de la Educación',
    description: 'Construye 5 escuelas',
    icon: '🎓',
    unlocked: schoolCount.value >= 5,
    progress: Math.min((schoolCount.value / 5) * 100, 100),
    category: 'services'
  },
  {
    id: 'publicTransport',
    name: 'Transporte Público',
    description: 'Construye 3 estaciones de metro',
    icon: '🚇',
    unlocked: metroStationCount.value >= 3,
    progress: Math.min((metroStationCount.value / 3) * 100, 100),
    category: 'services'
  },
  {
    id: 'recreationMaster',
    name: 'Maestro de Recreación',
    description: 'Construye 5 gimnasios y 5 bibliotecas',
    icon: '🏋️',
    unlocked: gymCount.value >= 5 && libraryCount.value >= 5,
    progress: Math.min(((gymCount.value + libraryCount.value) / 10) * 100, 100),
    category: 'services'
  },
  {
    id: 'utilityMaster',
    name: 'Maestro de Servicios',
    description: 'Construye 20 edificios de servicios públicos',
    icon: '⚙️',
    unlocked: publicServiceCount.value >= 20,
    progress: Math.min((publicServiceCount.value / 20) * 100, 100),
    category: 'services'
  },
  {
    id: 'communicationHub',
    name: 'Centro de Comunicaciones',
    description: 'Construye 3 torres de telecomunicaciones',
    icon: '📡',
    unlocked: telecomTowerCount.value >= 3,
    progress: Math.min((telecomTowerCount.value / 3) * 100, 100),
    category: 'services'
  },
  {
    id: 'culturalPatron',
    name: 'Mecenas Cultural',
    description: 'Construye 3 museos y 3 teatros',
    icon: '🎭',
    unlocked: museumCount.value >= 3 && theaterCount.value >= 3,
    progress: Math.min(((museumCount.value + theaterCount.value) / 6) * 100, 100),
    category: 'services'
  },
  {
    id: 'serviceNetwork',
    name: 'Red de Servicios',
    description: 'Construye al menos un edificio de cada tipo de servicio',
    icon: '🌐',
    unlocked: hasAllServiceTypes.value,
    progress: (uniqueServiceTypes.value / totalServiceTypes.value) * 100,
    category: 'services'
  },
  
  // Logros de Construcción Masiva
  {
    id: 'megaBuilder',
    name: 'Mega Constructor',
    description: 'Construye 200 edificios en total',
    icon: '🏗️',
    unlocked: gameState.buildingCount >= 200,
    progress: Math.min((gameState.buildingCount / 200) * 100, 100),
    category: 'construction'
  },
  {
    id: 'ultraBuilder',
    name: 'Ultra Constructor',
    description: 'Construye 500 edificios en total',
    icon: '🏙️',
    unlocked: gameState.buildingCount >= 500,
    progress: Math.min((gameState.buildingCount / 500) * 100, 100),
    category: 'construction'
  },
  {
    id: 'godBuilder',
    name: 'Constructor Divino',
    description: 'Construye 1000 edificios en total',
    icon: '⛩️',
    unlocked: gameState.buildingCount >= 1000,
    progress: Math.min((gameState.buildingCount / 1000) * 100, 100),
    category: 'construction'
  },
  {
    id: 'housingEmpire',
    name: 'Imperio Habitacional',
    description: 'Construye 50 edificios residenciales',
    icon: '🏘️',
    unlocked: residentialBuildingCount.value >= 50,
    progress: Math.min((residentialBuildingCount.value / 50) * 100, 100),
    category: 'construction'
  },
  {
    id: 'industrialComplex',
    name: 'Complejo Industrial',
    description: 'Construye 30 edificios industriales',
    icon: '🏭',
    unlocked: industrialBuildingCount.value >= 30,
    progress: Math.min((industrialBuildingCount.value / 30) * 100, 100),
    category: 'construction'
  },
  
  // Logros de Población
  {
    id: 'populationGiant',
    name: 'Gigante Poblacional',
    description: 'Alcanza 2,000 habitantes',
    icon: '👥',
    unlocked: gameState.population >= 2000,
    progress: Math.min((gameState.population / 2000) * 100, 100),
    category: 'population'
  },
  {
    id: 'populationKing',
    name: 'Rey de la Población',
    description: 'Alcanza 5,000 habitantes',
    icon: '👑',
    unlocked: gameState.population >= 5000,
    progress: Math.min((gameState.population / 5000) * 100, 100),
    category: 'population'
  },
  {
    id: 'populationGod',
    name: 'Dios de la Población',
    description: 'Alcanza 10,000 habitantes',
    icon: '⚡',
    unlocked: gameState.population >= 10000,
    progress: Math.min((gameState.population / 10000) * 100, 100),
    category: 'population'
  },
  
  // Logros de Tiempo Específicos
  {
    id: 'centuryMaster',
    name: 'Maestro del Siglo',
    description: 'Sobrevive 100 días',
    icon: '💯',
    unlocked: gameState.gameDay >= 100,
    progress: Math.min((gameState.gameDay / 100) * 100, 100),
    category: 'time'
  },
  {
    id: 'millenniumLord',
    name: 'Señor del Milenio',
    description: 'Sobrevive 1000 días',
    icon: '🌟',
    unlocked: gameState.gameDay >= 1000,
    progress: Math.min((gameState.gameDay / 1000) * 100, 100),
    category: 'time'
  },
  {
    id: 'speedBuilder',
    name: 'Constructor Veloz',
    description: 'Construye 10 edificios en el primer día',
    icon: '⚡',
    unlocked: gameState.firstDayBuildings >= 10,
    progress: Math.min((gameState.firstDayBuildings / 10) * 100, 100),
    category: 'time'
  },
  
  // Logros Económicos Avanzados
  {
    id: 'billionaire',
    name: 'Billonario',
    description: 'Acumula 1,000,000 créditos',
    icon: '💎',
    unlocked: gameState.credits >= 1000000,
    progress: Math.min((gameState.credits / 1000000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'economicGod',
    name: 'Dios Económico',
    description: 'Genera 50,000 créditos por día',
    icon: '👑',
    unlocked: gameState.dailyIncome >= 50000,
    progress: Math.min((gameState.dailyIncome / 50000) * 100, 100),
    category: 'economic'
  },
  {
    id: 'commercialEmpire',
    name: 'Imperio Comercial',
    description: 'Construye 50 edificios comerciales',
    icon: '🏪',
    unlocked: commercialBuildingCount.value >= 50,
    progress: Math.min((commercialBuildingCount.value / 50) * 100, 100),
    category: 'economic'
  },
  
  // Logros Ambientales Avanzados
  {
    id: 'ecoGod',
    name: 'Dios Ecológico',
    description: 'Construye 50 parques',
    icon: '🌲',
    unlocked: parkCount.value >= 50,
    progress: Math.min((parkCount.value / 50) * 100, 100),
    category: 'environmental'
  },
  {
    id: 'renewableKing',
    name: 'Rey de las Renovables',
    description: 'Construye 20 paneles solares y 20 torres eólicas',
    icon: '♻️',
    unlocked: solarPanelCount.value >= 20 && windTowerCount.value >= 20,
    progress: Math.min(((solarPanelCount.value + windTowerCount.value) / 40) * 100, 100),
    category: 'environmental'
  },
  {
    id: 'zeroPollution',
    name: 'Contaminación Cero',
    description: 'Mantén la contaminación en 0 por 10 días',
    icon: '✨',
    unlocked: gameState.zeroPollutionDays >= 10,
    progress: Math.min((gameState.zeroPollutionDays / 10) * 100, 100),
    category: 'environmental'
  },
  
  // Logros de Servicios Avanzados
  {
    id: 'healthcareEmpire',
    name: 'Imperio de Salud',
    description: 'Construye 20 hospitales',
    icon: '🏥',
    unlocked: gameState.hospitalCount >= 20,
    progress: Math.min((gameState.hospitalCount / 20) * 100, 100),
    category: 'services'
  },
  {
    id: 'educationMaster',
    name: 'Maestro de la Educación',
    description: 'Construye 15 escuelas',
    icon: '🎓',
    unlocked: schoolCount.value >= 15,
    progress: Math.min((schoolCount.value / 15) * 100, 100),
    category: 'services'
  },
  {
    id: 'safetyEmpire',
    name: 'Imperio de Seguridad',
    description: 'Construye 25 estaciones de policía y bomberos combinadas',
    icon: '🚨',
    unlocked: (gameState.policeStationCount + gameState.fireStationCount) >= 25,
    progress: Math.min(((gameState.policeStationCount + gameState.fireStationCount) / 25) * 100, 100),
    category: 'services'
  },
  
  // Logros de Infraestructura
  {
    id: 'roadMaster',
    name: 'Maestro de Carreteras',
    description: 'Construye 100 segmentos de carretera',
    icon: '🛣️',
    unlocked: roadCount.value >= 100,
    progress: Math.min((roadCount.value / 100) * 100, 100),
    category: 'infrastructure'
  },
  {
    id: 'roadGod',
    name: 'Dios de las Carreteras',
    description: 'Construye 500 segmentos de carretera',
    icon: '🗺️',
    unlocked: roadCount.value >= 500,
    progress: Math.min((roadCount.value / 500) * 100, 100),
    category: 'infrastructure'
  },
  {
    id: 'utilityNetwork',
    name: 'Red de Servicios Públicos',
    description: 'Construye 50 torres de agua',
    icon: '💧',
    unlocked: waterTowerCount.value >= 50,
    progress: Math.min((waterTowerCount.value / 50) * 100, 100),
    category: 'infrastructure'
  },
  
  // Logros de Combinaciones Especiales
  {
    id: 'balancedCity',
    name: 'Ciudad Equilibrada',
    description: 'Construye 10 de cada tipo básico de edificio',
    icon: '⚖️',
    unlocked: isBalancedCity.value,
    progress: balancedCityProgress.value,
    category: 'special'
  },
  {
    id: 'diverseEconomy',
    name: 'Economía Diversa',
    description: 'Construye 5 fábricas, 5 tiendas y 5 oficinas',
    icon: '🔄',
    unlocked: factoryCount.value >= 5 && shopCount.value >= 5 && officeCount.value >= 5,
    progress: Math.min(((factoryCount.value + shopCount.value + officeCount.value) / 15) * 100, 100),
    category: 'special'
  },
  {
    id: 'greenIndustrial',
    name: 'Industrial Verde',
    description: 'Construye 10 fábricas y 20 parques',
    icon: '🏭🌳',
    unlocked: factoryCount.value >= 10 && parkCount.value >= 20,
    progress: Math.min(((factoryCount.value / 10 + parkCount.value / 20) / 2) * 100, 100),
    category: 'special'
  },
  
  // Logros de Desafíos
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Alcanza 100 habitantes con menos de 20 edificios',
    icon: '🎯',
    unlocked: gameState.population >= 100 && gameState.buildingCount < 20,
    progress: gameState.population >= 100 && gameState.buildingCount < 20 ? 100 : 0,
    category: 'challenge'
  },
  {
    id: 'efficiency',
    name: 'Eficiencia Máxima',
    description: 'Genera 1000 créditos/día con menos de 50 edificios',
    icon: '⚡',
    unlocked: gameState.dailyIncome >= 1000 && gameState.buildingCount < 50,
    progress: gameState.dailyIncome >= 1000 && gameState.buildingCount < 50 ? 100 : 0,
    category: 'challenge'
  },
  {
    id: 'noRoads',
    name: 'Sin Carreteras',
    description: 'Alcanza 50 habitantes sin construir carreteras',
    icon: '🚫',
    unlocked: gameState.population >= 50 && roadCount.value === 0,
    progress: gameState.population >= 50 && roadCount.value === 0 ? 100 : 0,
    category: 'challenge'
  },
  
  // Logros de Prestigio
  {
    id: 'legendary',
    name: 'Legendario',
    description: 'Desbloquea 50 logros',
    icon: '🏆',
    unlocked: unlockedCount.value >= 50,
    progress: Math.min((unlockedCount.value / 50) * 100, 100),
    category: 'prestige'
  },
  {
    id: 'mythical',
    name: 'Mítico',
    description: 'Desbloquea 75 logros',
    icon: '🌟',
    unlocked: unlockedCount.value >= 75,
    progress: Math.min((unlockedCount.value / 75) * 100, 100),
    category: 'prestige'
  },
  {
    id: 'godlike',
    name: 'Divino',
    description: 'Desbloquea 90 logros',
    icon: '⚡',
    unlocked: unlockedCount.value >= 90,
    progress: Math.min((unlockedCount.value / 90) * 100, 100),
    category: 'prestige'
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Desbloquea todos los logros',
    icon: '💎',
    unlocked: unlockedCount.value >= 99,
    progress: Math.min((unlockedCount.value / 99) * 100, 100),
    category: 'prestige'
  },
  
  // Logros de Eventos Especiales
  {
    id: 'nightOwl',
    name: 'Búho Nocturno',
    description: 'Juega durante 24 horas seguidas',
    icon: '🦉',
    unlocked: gameState.continuousPlayTime >= 1440,
    progress: Math.min((gameState.continuousPlayTime / 1440) * 100, 100),
    category: 'special'
  },
  {
    id: 'earlyBird',
    name: 'Madrugador',
    description: 'Construye 5 edificios antes del día 2',
    icon: '🐦',
    unlocked: gameState.earlyBuildings >= 5,
    progress: Math.min((gameState.earlyBuildings / 5) * 100, 100),
    category: 'special'
  },
  {
    id: 'comeback',
    name: 'Regreso Triunfal',
    description: 'Recupera la ciudad después de tener 0 créditos',
    icon: '🔄',
    unlocked: gameState.hasRecovered,
    progress: gameState.hasRecovered ? 100 : 0,
    category: 'special'
  },
  
  // Logros de Colecciones
  {
    id: 'collector',
    name: 'Coleccionista',
    description: 'Construye al menos 3 de cada tipo de edificio',
    icon: '📦',
    unlocked: isCollector.value,
    progress: collectorProgress.value,
    category: 'collection'
  },
  {
    id: 'hoarder',
    name: 'Acaparador',
    description: 'Construye al menos 10 de cada tipo de edificio',
    icon: '📚',
    unlocked: isHoarder.value,
    progress: hoarderProgress.value,
    category: 'collection'
  },
  
  // Logros de Estabilidad Avanzados
  {
    id: 'stabilityMaster',
    name: 'Maestro de Estabilidad',
    description: 'Mantén la estabilidad al 100% por 30 días',
    icon: '⚖️',
    unlocked: gameState.perfectStabilityDays >= 30,
    progress: Math.min((gameState.perfectStabilityDays / 30) * 100, 100),
    category: 'stability'
  },
  {
    id: 'resilient',
    name: 'Resiliente',
    description: 'Sobrevive con estabilidad menor al 25% por 5 días',
    icon: '💪',
    unlocked: gameState.lowStabilityDays >= 5,
    progress: Math.min((gameState.lowStabilityDays / 5) * 100, 100),
    category: 'stability'
  },
  
  // Logros Únicos
  {
    id: 'lucky',
    name: 'Afortunado',
    description: 'Encuentra un evento especial aleatorio',
    icon: '🍀',
    unlocked: gameState.hasLuckyEvent,
    progress: gameState.hasLuckyEvent ? 100 : 0,
    category: 'unique'
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Construye en todas las esquinas del mapa',
    icon: '🗺️',
    unlocked: gameState.hasExploredAllCorners,
    progress: gameState.hasExploredAllCorners ? 100 : 0,
    category: 'unique'
  },
  {
    id: 'symmetrical',
    name: 'Simétrico',
    description: 'Crea una ciudad perfectamente simétrica',
    icon: '🔄',
    unlocked: gameState.isSymmetrical,
    progress: gameState.isSymmetrical ? 100 : 0,
    category: 'unique'
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

// Propiedades computadas para los nuevos logros económicos
const shopCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && ['shop', 'shop_level1', 'shop_level2', 'shop_level3'].includes(tile.building)) {
        count++
      }
    })
  })
  return count
})

const officeCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && ['office', 'office_level1', 'office_level2', 'office_level3'].includes(tile.building)) {
        count++
      }
    })
  })
  return count
})

const mallCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'mall') {
        count++
      }
    })
  })
  return count
})

// Propiedades computadas para los nuevos logros de servicios
const schoolCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'school') {
        count++
      }
    })
  })
  return count
})

const metroStationCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'metro_station') {
        count++
      }
    })
  })
  return count
})

const gymCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'gym') {
        count++
      }
    })
  })
  return count
})

const libraryCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'library') {
        count++
      }
    })
  })
  return count
})

const publicServiceCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && ['hospital', 'police_station', 'fire_station', 'water_tower', 'school', 'library', 'gym'].includes(tile.building)) {
        count++
      }
    })
  })
  return count
})

const telecomTowerCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'telecom_tower') {
        count++
      }
    })
  })
  return count
})

const museumCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'museum') {
        count++
      }
    })
  })
  return count
})

const theaterCount = computed(() => {
  let count = 0
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building === 'theater') {
        count++
      }
    })
  })
  return count
})

const hasAllServiceTypes = computed(() => {
  const requiredServiceTypes = ['hospital', 'police_station', 'fire_station', 'water_tower', 'school']
  const builtTypes = new Set()
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building) {
        builtTypes.add(tile.building)
      }
    })
  })
  return requiredServiceTypes.every(type => builtTypes.has(type))
})

const uniqueServiceTypes = computed(() => {
  const serviceTypes = ['hospital', 'police_station', 'fire_station', 'water_tower', 'school', 'library', 'gym', 'metro_station']
  const builtTypes = new Set()
  gameState.metadata.forEach(row => {
    row.forEach(tile => {
      if (tile.building && serviceTypes.includes(tile.building)) {
        builtTypes.add(tile.building)
      }
    })
  })
  return builtTypes.size
})

const totalServiceTypes = computed(() => {
  return 8 // Número total de tipos de servicios disponibles
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
  { id: 'special', name: 'Especiales', icon: '⭐' },
  { id: 'construction', name: 'Construcción', icon: '🏗️' },
  { id: 'population', name: 'Población', icon: '👥' },
  { id: 'challenge', name: 'Desafíos', icon: '🎯' },
  { id: 'prestige', name: 'Prestigio', icon: '🏆' },
  { id: 'collection', name: 'Colección', icon: '📦' },
  { id: 'unique', name: 'Únicos', icon: '🌟' }
]

// Propiedades computadas para nuevos logros
const isBalancedCity = computed(() => {
  return residentialBuildingCount.value >= 10 && 
         commercialBuildingCount.value >= 10 && 
         industrialBuildingCount.value >= 10
})

const balancedCityProgress = computed(() => {
  const minRequired = 10
  const residential = Math.min(residentialBuildingCount.value / minRequired, 1)
  const commercial = Math.min(commercialBuildingCount.value / minRequired, 1)
  const industrial = Math.min(industrialBuildingCount.value / minRequired, 1)
  return ((residential + commercial + industrial) / 3) * 100
})

const isCollector = computed(() => {
  return uniqueBuildingTypes.value >= 3
})

const collectorProgress = computed(() => {
  return Math.min((uniqueBuildingTypes.value / totalBuildingTypes.value) * 100, 100)
})

const isHoarder = computed(() => {
  return uniqueBuildingTypes.value >= 10
})

const hoarderProgress = computed(() => {
  const minRequired = 10
  const progress = Math.min(uniqueBuildingTypes.value / minRequired, 1)
  return progress * 100
})

const selectedCategory = ref('all')

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(achievement => achievement.category === selectedCategory.value)
})

// Estadísticas generales para la barra de progreso
const unlockedCount = computed(() => {
  return achievements.value.filter(achievement => achievement.unlocked).length
})

const totalAchievements = computed(() => {
  return achievements.value.length
})

const completionPercentage = computed(() => {
  return (unlockedCount.value / totalAchievements.value) * 100
})

const achievementPoints = computed(() => {
  return unlockedCount.value * 10 // 10 puntos por logro desbloqueado
})

const currentStreak = computed(() => {
  // Calcular racha actual basada en logros recientes
  let streak = 0
  const recentAchievements = achievements.value.slice().reverse()
  for (const achievement of recentAchievements) {
    if (achievement.unlocked) {
      streak++
    } else {
      break
    }
  }
  return streak
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

      <!-- Barra de Estadísticas Generales -->
      <div class="p-6 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Logros Desbloqueados -->
          <div class="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-600">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Logros Desbloqueados</p>
                <p class="text-2xl font-bold text-industrial-accent">{{ unlockedCount }}</p>
              </div>
              <div class="text-industrial-accent">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <div class="bg-gray-700 rounded-full h-2">
                 <div class="bg-industrial-accent h-2 rounded-full transition-all duration-300" :style="{ width: completionPercentage + '%' }"></div>
               </div>
               <p class="text-xs text-gray-500 mt-1">{{ completionPercentage.toFixed(1) }}% completado</p>
            </div>
          </div>
          
          <!-- Total de Logros -->
          <div class="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-600">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Total de Logros</p>
                <p class="text-2xl font-bold text-blue-400">{{ totalAchievements }}</p>
              </div>
              <div class="text-blue-400">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Puntos de Logros -->
          <div class="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-600">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Puntos de Logros</p>
                <p class="text-2xl font-bold text-purple-400">{{ achievementPoints }}</p>
              </div>
              <div class="text-purple-400">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Progreso General -->
          <div class="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-600">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Progreso General</p>
                <p class="text-2xl font-bold text-orange-400">{{ completionPercentage.toFixed(1) }}%</p>
              </div>
              <div class="text-orange-400">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
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