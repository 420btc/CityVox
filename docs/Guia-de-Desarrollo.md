# Guía de Desarrollo para Principiantes de CubeCity 👨‍💻

¡Bienvenido al desarrollo de CubeCity! Esta guía te ayudará a configurar el entorno de desarrollo, entender la arquitectura del proyecto y comenzar a contribuir al desarrollo de este juego de simulación de ciudad 2.5D.

---
## 1. Resumen del Proyecto 🎮
CubeCity es un juego de simulación y gestión de ciudad 2.5D desarrollado con tecnologías web modernas. El proyecto se enfoca en proporcionar una experiencia de construcción de ciudad relajante y divertida con gráficos cartoon y mecánicas de juego intuitivas.
**Características Principales:**
🏗️ Sistema de construcción de ciudad 3D
🏠 Sistema de edificios multidimensional (RCI & ESG)
💾 Almacenamiento local de datos
🎨 UI responsiva y moderna
🌍 Soporte multiidioma
⚡ Rendimiento optimizado
---

## 2. Stack Tecnológico 🛠️

### 2.1 Tecnologías Principales

- **Frontend Framework**: Vue 3 (Composition API)
- **Motor 3D**: Three.js
- **Herramienta de Build**: Vite
- **Lenguaje**: JavaScript/TypeScript
- **Gestión de Estado**: Pinia
- **Estilado**: CSS3 + Variables CSS

### 2.2 Dependencias Clave

```json
{
  "vue": "^3.x",
  "three": "^0.x",
  "@vitejs/plugin-vue": "^4.x",
  "pinia": "^2.x"
}
```

### 2.3 Herramientas de Desarrollo

- **Editor Recomendado**: VS Code
- **Extensiones Útiles**:
  - Vue Language Features (Volar)
  - ES6 String HTML
  - Auto Rename Tag
  - Prettier
  - ESLint

---

## 3. Configuración del Entorno 🚀

### 3.1 Requisitos del Sistema

- **Node.js**: v16.0.0 o superior
- **npm**: v7.0.0 o superior (o yarn/pnpm)
- **Git**: Para control de versiones
- **Navegador Moderno**: Chrome, Firefox, Safari, Edge

### 3.2 Instalación Paso a Paso

#### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/CubeCity.git
cd CubeCity
```

#### Paso 2: Instalar Dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

#### Paso 3: Iniciar Servidor de Desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

#### Paso 4: Abrir en Navegador
Navega a `http://localhost:5173` (o el puerto mostrado en la terminal)

### 3.3 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Vista previa de build de producción
npm run lint         # Ejecuta linter
npm run format       # Formatea código
```

---

## 4. Arquitectura del Proyecto 🏗️

### 4.1 Estructura de Directorios

```
CubeCity/
├── public/                 # Archivos estáticos
│   ├── models/            # Modelos 3D (.glb, .gltf)
│   ├── textures/          # Texturas e imágenes
│   └── sounds/            # Archivos de audio
├── src/
│   ├── components/        # Componentes Vue reutilizables
│   │   ├── UI/           # Componentes de interfaz
│   │   ├── Game/         # Componentes específicos del juego
│   │   └── Common/       # Componentes comunes
│   ├── stores/           # Gestión de estado (Pinia)
│   │   ├── useGameState.js
│   │   ├── useBuildingData.js
│   │   └── useUIState.js
│   ├── utils/            # Funciones utilitarias
│   │   ├── three/        # Utilidades de Three.js
│   │   ├── game/         # Lógica del juego
│   │   └── helpers/      # Funciones auxiliares
│   ├── data/             # Datos del juego
│   │   ├── buildings.js  # Datos de edificios
│   │   ├── i18n/         # Archivos de traducción
│   │   └── constants.js  # Constantes del juego
│   ├── styles/           # Estilos globales
│   ├── App.vue           # Componente raíz
│   └── main.js           # Punto de entrada
├── docs/                 # Documentación
├── tests/                # Pruebas
└── package.json          # Configuración del proyecto
```

### 4.2 Componentes Principales

#### 4.2.1 App.vue
- Componente raíz de la aplicación
- Maneja el estado global de la UI
- Coordina entre diferentes vistas del juego

#### 4.2.2 GameScene.vue
- Renderiza la escena 3D principal
- Maneja interacciones del mouse/teclado
- Gestiona la cámara y controles

#### 4.2.3 BuildingPanel.vue
- Panel de selección de edificios
- Muestra información de edificios
- Maneja modos de construcción

#### 4.2.4 InfoPanel.vue
- Muestra información detallada
- Estadísticas del juego
- Controles de edificios

### 4.3 Gestión de Estado

#### 4.3.1 useGameState.js
```javascript
// Estado principal del juego
export const useGameState = defineStore('gameState', {
  state: () => ({
    currentMode: 'select',
    selectedBuilding: null,
    gameGrid: [],
    resources: {
      coins: 10000,
      population: 0,
      power: 0,
      pollution: 0
    }
  }),
  
  actions: {
    setMode(mode) { /* ... */ },
    selectBuilding(building) { /* ... */ },
    placeBuilding(x, y, type) { /* ... */ }
  }
})
```

#### 4.3.2 useBuildingData.js
```javascript
// Datos y lógica de edificios
export const useBuildingData = defineStore('buildingData', {
  state: () => ({
    buildings: BUILDING_DATA,
    buildingInstances: new Map()
  }),
  
  getters: {
    getBuildingByType: (state) => (type) => {
      return state.buildings[type]
    }
  }
})
```

---

## 5. Características Principales 🎯

### 5.1 Sistema de Construcción 3D

#### Renderizado de Escena
- **Motor**: Three.js WebGL
- **Cámara**: Perspectiva con controles orbitales
- **Iluminación**: Luz ambiental + luz direccional
- **Materiales**: MeshLambertMaterial para rendimiento

#### Gestión de Modelos
```javascript
// Carga de modelos 3D
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
const loadModel = (path) => {
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject)
  })
}
```

### 5.2 Sistema de Edificios

#### Estructura de Datos
```javascript
const BUILDING_DATA = {
  residential_house: {
    name: {
      en: "House",
      es: "Casa",
      zh: "房屋"
    },
    type: "residential",
    category: "RCI",
    levels: {
      1: {
        cost: 1000,
        maxPopulation: 4,
        powerUsage: 2,
        coinOutput: 0
      }
    }
  }
}
```

#### Lógica de Interacciones
```javascript
// Cálculo de efectos de adyacencia
const calculateAdjacencyEffects = (building, neighbors) => {
  let effects = {
    populationBonus: 0,
    incomeBonus: 0,
    pollutionReduction: 0
  }
  
  neighbors.forEach(neighbor => {
    if (neighbor.type === 'park') {
      effects.populationBonus += 0.1 // +10%
    }
  })
  
  return effects
}
```

### 5.3 Sistema de UI Responsiva

#### Diseño Adaptativo
```css
/* Diseño responsivo */
.game-container {
  display: grid;
  grid-template-areas: 
    "sidebar main info"
    "sidebar main info";
  grid-template-columns: 300px 1fr 300px;
}

@media (max-width: 1024px) {
  .game-container {
    grid-template-areas: 
      "main"
      "sidebar"
      "info";
    grid-template-columns: 1fr;
  }
}
```

### 5.4 Sistema de Internacionalización

#### Estructura de Traducciones
```javascript
// src/data/i18n/es.js
export default {
  ui: {
    modes: {
      select: "Seleccionar",
      build: "Construir",
      move: "Mover",
      demolish: "Demoler"
    },
    buildings: {
      residential: "Residencial",
      commercial: "Comercial",
      industrial: "Industrial"
    }
  },
  buildings: {
    // Traducciones de edificios
  }
}
```

---

## 6. Objetivos de Desarrollo 🎯

### 6.1 Objetivos a Corto Plazo (1-2 meses)

- ✅ Sistema básico de construcción 3D
- ✅ Gestión de recursos fundamental
- ✅ UI responsiva básica
- 🔄 Sistema de guardado/carga
- 🔄 Efectos de sonido básicos
- 🔄 Tutorial interactivo

### 6.2 Objetivos a Medio Plazo (3-6 meses)

- 📋 Sistema de logros
- 📋 Modo multijugador básico
- 📋 Editor de mapas
- 📋 Más tipos de edificios
- 📋 Sistema de clima/tiempo
- 📋 Animaciones mejoradas

### 6.3 Objetivos a Largo Plazo (6+ meses)

- 📋 Modo campaña
- 📋 Marketplace de mods
- 📋 Versión móvil
- 📋 Integración con redes sociales
- 📋 Sistema de economía avanzado
- 📋 IA para NPCs

---

## 7. Guías de Contribución 🤝

### 7.1 Estándares de Código

#### Convenciones de Nomenclatura
```javascript
// Variables y funciones: camelCase
const buildingData = {}
function calculateIncome() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_POPULATION = 1000
const BUILDING_TYPES = ['residential', 'commercial']

// Componentes Vue: PascalCase
// BuildingPanel.vue, GameScene.vue

// Archivos: kebab-case
// building-data.js, game-state.js
```

#### Estructura de Componentes Vue
```vue
<template>
  <!-- Template limpio y semántico -->
</template>

<script>
// Imports
import { ref, computed, onMounted } from 'vue'
import { useGameState } from '@/stores/useGameState'

export default {
  name: 'ComponentName',
  props: {
    // Props con validación
  },
  emits: ['event-name'],
  setup(props, { emit }) {
    // Lógica del componente
    return {
      // Valores reactivos expuestos
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente */
</style>
```

### 7.2 Proceso de Desarrollo

#### Flujo de Git
```bash
# 1. Crear rama para nueva característica
git checkout -b feature/nueva-caracteristica

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva característica"

# 3. Push y crear Pull Request
git push origin feature/nueva-caracteristica
```

#### Convenciones de Commits
```
feat: nueva característica
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar pruebas
chore: tareas de mantenimiento
```

### 7.3 Testing

#### Estructura de Pruebas
```javascript
// tests/components/BuildingPanel.test.js
import { mount } from '@vue/test-utils'
import BuildingPanel from '@/components/BuildingPanel.vue'

describe('BuildingPanel', () => {
  test('renders building categories', () => {
    const wrapper = mount(BuildingPanel)
    expect(wrapper.find('.building-categories').exists()).toBe(true)
  })
  
  test('emits building selection', async () => {
    const wrapper = mount(BuildingPanel)
    await wrapper.find('.building-item').trigger('click')
    expect(wrapper.emitted('building-selected')).toBeTruthy()
  })
})
```

---

## 8. Optimización de Rendimiento ⚡

### 8.1 Optimizaciones de Three.js

#### Gestión de Geometría
```javascript
// Reutilizar geometrías
const geometryCache = new Map()

function getGeometry(type) {
  if (!geometryCache.has(type)) {
    geometryCache.set(type, createGeometry(type))
  }
  return geometryCache.get(type)
}

// Instanced rendering para edificios similares
const instancedMesh = new THREE.InstancedMesh(
  geometry, 
  material, 
  maxInstances
)
```

#### Optimización de Renderizado
```javascript
// Frustum culling
function updateVisibleBuildings(camera) {
  const frustum = new THREE.Frustum()
  frustum.setFromProjectionMatrix(
    camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse)
  )
  
  buildings.forEach(building => {
    building.visible = frustum.intersectsObject(building)
  })
}

// Level of Detail (LOD)
const lod = new THREE.LOD()
lod.addLevel(highDetailMesh, 0)
lod.addLevel(mediumDetailMesh, 50)
lod.addLevel(lowDetailMesh, 100)
```

### 8.2 Optimizaciones de Vue

#### Lazy Loading de Componentes
```javascript
// Router con lazy loading
const routes = [
  {
    path: '/game',
    component: () => import('@/views/GameView.vue')
  }
]

// Componentes dinámicos
const BuildingPanel = defineAsyncComponent(
  () => import('@/components/BuildingPanel.vue')
)
```

#### Optimización de Reactividad
```javascript
// Usar shallowRef para objetos grandes
const gameGrid = shallowRef([])

// Computed con cache
const expensiveCalculation = computed(() => {
  // Cálculo costoso que se cachea automáticamente
  return heavyComputation(gameState.value)
})

// Watchers optimizados
watch(
  () => gameState.buildings,
  (newBuildings) => {
    // Solo reaccionar a cambios específicos
  },
  { deep: false } // Evitar deep watching cuando no es necesario
)
```

---

## 9. Debugging y Herramientas 🔧

### 9.1 Herramientas de Desarrollo

#### Vue DevTools
- Inspección de componentes
- Análisis de rendimiento
- Debugging de Pinia stores

#### Three.js Inspector
```javascript
// Agregar helpers de debug
if (process.env.NODE_ENV === 'development') {
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)
  
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)
}
```

#### Console Debugging
```javascript
// Funciones de debug globales
window.debugGame = {
  getGameState: () => gameState,
  addCoins: (amount) => gameState.resources.coins += amount,
  listBuildings: () => console.table(gameState.buildings),
  exportSave: () => JSON.stringify(gameState)
}
```

### 9.2 Logging

```javascript
// Sistema de logging
const Logger = {
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data)
    }
  },
  
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error)
    // Enviar a servicio de logging en producción
  },
  
  performance: (label, fn) => {
    console.time(label)
    const result = fn()
    console.timeEnd(label)
    return result
  }
}
```

---

## 10. Deployment 🚀

### 10.1 Build de Producción

```bash
# Construir para producción
npm run build

# Vista previa local
npm run preview

# Análisis de bundle
npm run build -- --analyze
```

### 10.2 Configuración de Vite

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'three'],
          game: ['./src/stores', './src/utils/game']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['three']
  }
})
```

### 10.3 Hosting

#### Vercel (Recomendado)
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": "dist"
      }
    }
  ]
}
```

#### Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 11. Recursos Adicionales 📚

### 11.1 Documentación Oficial

- [Vue 3 Documentation](https://vuejs.org/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)

### 11.2 Tutoriales Recomendados

- **Vue 3**: Vue Mastery, Vue School
- **Three.js**: Three.js Journey, Bruno Simon
- **Game Development**: MDN Game Development

### 11.3 Herramientas Útiles

- **Modelado 3D**: Blender (gratuito)
- **Texturas**: Texture.com, Freepik
- **Iconos**: Heroicons, Feather Icons
- **Colores**: Coolors.co, Adobe Color

---

## 12. Solución de Problemas Comunes 🔧

### 12.1 Problemas de Instalación

**Error: Node version incompatible**
```bash
# Usar nvm para cambiar versión de Node
nvm install 18
nvm use 18
```

**Error: Permission denied**
```bash
# En macOS/Linux
sudo chown -R $(whoami) ~/.npm

# En Windows (ejecutar como administrador)
npm config set prefix %APPDATA%\npm
```

### 12.2 Problemas de Desarrollo

**Three.js no renderiza**
- Verificar que el canvas tenga dimensiones
- Comprobar que la cámara esté posicionada correctamente
- Asegurar que los objetos estén dentro del frustum

**Vue components no reactivos**
- Usar ref() o reactive() para datos reactivos
- Verificar que las mutaciones sean detectables
- Comprobar el scope de las variables

**Performance issues**
- Usar Vue DevTools para identificar re-renders
- Implementar v-memo para listas grandes
- Optimizar watchers y computed

### 12.3 Problemas de Build

**Bundle size too large**
```javascript
// Lazy load heavy dependencies
const HeavyComponent = defineAsyncComponent(
  () => import('./HeavyComponent.vue')
)

// Tree shaking
import { specificFunction } from 'library'
// En lugar de
import * as library from 'library'
```

**Asset loading issues**
```javascript
// Usar import.meta.url para assets
const modelUrl = new URL('./models/building.glb', import.meta.url).href

// O usar public folder
const textureUrl = '/textures/grass.jpg'
```

---

## 13. Conclusión 🎯

¡Felicidades por completar la guía de desarrollo de CubeCity! Ahora tienes todo el conocimiento necesario para:

- ✅ Configurar el entorno de desarrollo
- ✅ Entender la arquitectura del proyecto
- ✅ Contribuir con nuevas características
- ✅ Optimizar el rendimiento
- ✅ Debuggear problemas comunes
- ✅ Desplegar la aplicación

### Próximos Pasos

1. **Explora el código**: Familiarízate con la base de código existente
2. **Contribuye**: Elige una característica del roadmap y comienza a desarrollar
3. **Comparte**: Únete a la comunidad y comparte tus ideas
4. **Aprende**: Mantente actualizado con las últimas tecnologías

### Recursos de la Comunidad

- **GitHub Issues**: Para reportar bugs y solicitar características
- **Discussions**: Para preguntas y discusiones generales
- **Discord**: Para chat en tiempo real con otros desarrolladores

¡Esperamos tus contribuciones para hacer de CubeCity un juego aún mejor! 🚀✨

---

*Esta guía es un documento vivo que se actualiza regularmente. Si encuentras información desactualizada o tienes sugerencias de mejora, no dudes en contribuir.*