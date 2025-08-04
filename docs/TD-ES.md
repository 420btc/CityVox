# Simcity versión threejs

> por: hexianWeb

# Estructura de Infraestructura del Juego Threejs

| Elemento     | Función              | Analogía en la Realidad                |
| ------------ | -------------------- | -------------------------------------- |
| **Scene**    | Entorno 3D del juego | Como el terreno de un parque de diversiones |
| **Game UI**  | Interfaz de usuario y capa de interacción | Equivalente a los letreros y taquillas del parque |
| **Metadata** | Datos y lógica del juego | Similar a las reglas operativas y datos de visitantes del parque |

# Diseño de Metadata

## Explicación de la Estructura de Datos BUILDING_DATA

`BUILDING_DATA` es un objeto constante que contiene todos los tipos de edificios y sus propiedades, definido en `src/constants/constants.js`. Su estructura es la siguiente:

```js
export const BUILDING_DATA = {
  [buildingType]: {
    name: { zh: '中文名', en: 'English Name' }, // Nombre del edificio (multiidioma)
    type: 'buildingType',                      // Identificador único del tipo de edificio
    icon: '🏠',                                // Icono (emoji o string)
    buildingType: { zh: '建筑类型', en: 'Type' }, // Categoría principal del edificio (multiidioma)
    category: 'residential' | 'industrial' | 'commercial' | 'environment' | 'governance' | 'social' | 'infrastructure', // Clasificación
    levels: {
      [level]: {
        displayName: { zh: '中文名', en: 'English Name' }, // Nombre de visualización del nivel
        cost: number,                // Costo en monedas para construcción
        maxPopulation?: number,      // Población máxima (tipo residencial)
        powerUsage?: number,         // Consumo de energía
        powerOutput?: number,        // Producción de energía (edificios generadores)
        pollution: number,           // Valor de contaminación (negativo para reducir contaminación)
        coinOutput?: number,         // Producción de monedas (comercial/industrial)
        population?: number,         // Proporciona empleo/población (comercial/industrial/instalaciones)
        upgradeCost?: number,        // Costo en monedas para mejora
        nextLevel?: number,          // Número del siguiente nivel (null si no hay)
        visible: boolean,            // Si es visible en la UI
      },
      // ...más niveles
    }
  },
  // ...más tipos de edificios
}
```

### Explicación de Campos

- **name**: Nombre multiidioma del edificio, `zh` para chino, `en` para inglés.
- **type**: Identificador único del tipo de edificio (como `house`, `factory`).
- **icon**: Icono del edificio, generalmente emoji.
- **buildingType**: Categoría principal del edificio (como "Edificio Residencial", "Edificio Industrial"), multiidioma.
- **category**: Clasificación a la que pertenece el edificio, usado para agrupación funcional (como `residential`, `industrial`).
- **levels**: Propiedades multinivel del edificio, key es el nivel (1, 2, 3...), value es el objeto de propiedades detalladas para ese nivel.

#### Propiedades bajo levels

- **displayName**: Nombre de visualización multiidioma para ese nivel.
- **cost**: Monedas requeridas para construir ese nivel de edificio.
- **maxPopulation**: Capacidad máxima de población, solo para tipo residencial.
- **powerUsage**: Consumo de energía, algunos edificios lo tienen.
- **powerOutput**: Producción de energía, solo edificios generadores lo tienen.
- **pollution**: Valor de contaminación, números negativos indican reducción de contaminación (como parques).
- **coinOutput**: Producción de monedas, edificios comerciales/industriales lo tienen.
- **population**: Proporciona empleo/población, algunos edificios lo tienen.
- **upgradeCost**: Monedas requeridas para mejorar al siguiente nivel.
- **nextLevel**: Número del siguiente nivel, null si no hay.
- **visible**: Si ese nivel es visible en la UI.

### Ejemplo

Tomando residencia (house) como ejemplo:

```js
house: {
  name: { zh: '住宅', en: 'Residential' },
  type: 'house',
  icon: '🏠',
  buildingType: { zh: '住宅建筑', en: 'Residential Building' },
  category: 'residential',
  levels: {
    1: {
      displayName: { zh: '普通住宅', en: 'Basic Residential' },
      cost: 300,
      maxPopulation: 50,
      powerUsage: 10,
      pollution: 2,
      upgradeCost: 600,
      nextLevel: 2,
      visible: true,
    },
    2: {
      displayName: { zh: '高级住宅', en: 'Advanced Residential' },
      cost: 600,
      maxPopulation: 100,
      powerUsage: 15,
      pollution: 3,
      upgradeCost: 1200,
      nextLevel: 3,
      visible: false,
    },
    3: {
      displayName: { zh: '豪华住宅', en: 'Luxury Residential' },
      cost: 1200,
      maxPopulation: 200,
      powerUsage: 20,
      pollution: 5,
      upgradeCost: null,
      nextLevel: null,
      visible: false,
    },
  },
}
```

---

### Principios de Diseño

- **Soporte Multiidioma**: Todos los campos relacionados con visualización tienen estructura `{ zh, en }`, conveniente para internacionalización.
- **Edificios Multinivel**: A través del campo `levels` se soporta mejora de edificios, cada nivel tiene propiedades independientes.
- **Extensión Flexible**: Se pueden agregar fácilmente nuevos tipos de edificios o extender propiedades.
- **Control de UI**: El campo `visible` controla la visualización de cada nivel en la UI.

---

Si necesitas refinar más el significado de los campos o expandir, por favor complementa debajo de esta explicación de estructura.

# Clase Base de Interacción SimObject

> Proporciona capacidades de interacción comunes como gestión de mesh, resaltado de selección, visualización de información HTML, etc.

- SimObject proporciona capacidades de interacción comunes como gestión de mesh, resaltado de selección, visualización de información HTML, etc.

- Cualquier objeto interactivo en la escena (como Tile, Building) debe heredar de SimObject.

# Componentes de Clase building

## 🧠 Análisis y Pensamiento de Diseño

1. Principio de Responsabilidad Única

- Polimorfismo y Extensibilidad

- Diferentes tipos de edificios heredan de Building, sobrescriben sus métodos funcionales respectivos (como getPopulation, getPower, getEconomy).

- Conveniente para expandir nuevos tipos de edificios o funcionalidades en el futuro.

3. Desacoplamiento y Colaboración

## Arquitectura del Sistema de Edificios

### Jerarquía de Clases

```
SimObject (Clase Base)
├── Building (Clase Base de Edificios)
│   ├── ResidentialBuilding (Edificios Residenciales)
│   ├── CommercialBuilding (Edificios Comerciales)
│   ├── IndustrialBuilding (Edificios Industriales)
│   ├── EnvironmentBuilding (Edificios Ambientales)
│   ├── SocialBuilding (Edificios Sociales)
│   └── GovernanceBuilding (Edificios de Gobernanza)
└── Tile (Baldosas del Terreno)
```

### Responsabilidades de Cada Clase

#### SimObject
- Gestión básica de mesh 3D
- Sistema de selección y resaltado
- Visualización de información HTML
- Eventos de interacción del mouse

#### Building (Clase Base)
- Propiedades comunes de edificios (tipo, nivel, costo, etc.)
- Lógica de mejora de edificios
- Sistema de producción de recursos
- Gestión de estado de edificios
- Interacciones entre edificios

#### Clases de Edificios Específicos
- **ResidentialBuilding**: Gestión de población, capacidad de vivienda
- **CommercialBuilding**: Producción de monedas, atracción de clientes
- **IndustrialBuilding**: Producción industrial, consumo de energía
- **EnvironmentBuilding**: Reducción de contaminación, mejora estética
- **SocialBuilding**: Servicios públicos, bienestar de residentes
- **GovernanceBuilding**: Gestión urbana, eficiencia administrativa

## Sistema de Interacciones entre Edificios

### Mecanismo de Efectos de Adyacencia

Los edificios pueden afectar a edificios adyacentes a través de varios mecanismos:

```js
// Ejemplo de configuración de interacciones
const BUILDING_INTERACTIONS = {
  // Residencial + Parque = +10% capacidad de población
  'house+park': {
    effect: 'population_boost',
    value: 0.1,
    description: 'Los parques cercanos aumentan la capacidad de población'
  },
  
  // Residencial + Fábrica = -15% capacidad de población
  'house+factory': {
    effect: 'population_penalty',
    value: -0.15,
    description: 'Las fábricas cercanas reducen la capacidad de población'
  },
  
  // Comercial + Torre de Agua = +25% ingresos
  'shop+water_tower': {
    effect: 'income_boost',
    value: 0.25,
    description: 'Las torres de agua aumentan los ingresos comerciales'
  }
};
```

### Tipos de Efectos

1. **Efectos de Población**
   - `population_boost`: Aumenta capacidad de población
   - `population_penalty`: Reduce capacidad de población

2. **Efectos Económicos**
   - `income_boost`: Aumenta producción de monedas
   - `income_penalty`: Reduce producción de monedas

3. **Efectos Ambientales**
   - `pollution_reduction`: Reduce contaminación
   - `pollution_increase`: Aumenta contaminación

4. **Efectos de Eficiencia**
   - `efficiency_boost`: Aumenta eficiencia general
   - `power_boost`: Aumenta producción de energía

## Sistema de Estados de Edificios

### Estados Principales

```js
const BUILDING_STATES = {
  NORMAL: 'normal',           // Funcionamiento normal
  UPGRADING: 'upgrading',     // En proceso de mejora
  NO_POWER: 'no_power',       // Sin energía
  NO_ROAD: 'no_road',         // Sin conexión de carretera
  OVERCROWDED: 'overcrowded', // Sobrepoblado
  VACANT: 'vacant',           // Vacante
  POLLUTED: 'polluted',       // Contaminado
  HAPPY: 'happy',             // Residentes felices
  UNHAPPY: 'unhappy'          // Residentes infelices
};
```

### Indicadores Visuales

Cada estado tiene su indicador visual correspondiente:

- ⬆️ **Mejorable**: El edificio puede ser mejorado
- ⚡ **Sin Energía**: Falta suministro eléctrico
- 🛣️ **Sin Carretera**: Falta conexión de carretera
- 👥 **Sobrepoblado**: Exceso de población
- 🌫️ **Contaminado**: Nivel de contaminación alto
- 😊 **Feliz**: Residentes satisfechos
- 😢 **Infeliz**: Residentes insatisfechos

## Sistema de Gestión de Recursos

### Tipos de Recursos

```js
const RESOURCE_TYPES = {
  COINS: 'coins',           // Monedas
  POPULATION: 'population', // Población
  POWER: 'power',          // Energía
  POLLUTION: 'pollution',   // Contaminación
  HAPPINESS: 'happiness'    // Felicidad
};
```

### Cálculo de Producción

La producción de cada edificio se calcula considerando:

1. **Producción Base**: Definida en BUILDING_DATA
2. **Modificadores de Adyacencia**: Efectos de edificios cercanos
3. **Estado del Edificio**: Penalizaciones por estados negativos
4. **Nivel del Edificio**: Bonificaciones por mejoras

```js
// Ejemplo de cálculo de producción
function calculateProduction(building) {
  let baseProduction = building.getBaseProduction();
  let adjacencyModifier = building.getAdjacencyModifier();
  let stateModifier = building.getStateModifier();
  let levelModifier = building.getLevelModifier();
  
  return baseProduction * adjacencyModifier * stateModifier * levelModifier;
}
```

## Patrones de Diseño Utilizados

### 1. Patrón Strategy
Para diferentes tipos de edificios con comportamientos específicos:

```js
class Building {
  constructor(type, strategy) {
    this.type = type;
    this.strategy = strategy;
  }
  
  produce() {
    return this.strategy.produce(this);
  }
}
```

### 2. Patrón Observer
Para notificaciones de cambios de estado:

```js
class Building extends EventEmitter {
  setState(newState) {
    this.state = newState;
    this.emit('stateChanged', newState);
  }
}
```

### 3. Patrón Factory
Para creación de diferentes tipos de edificios:

```js
class BuildingFactory {
  static create(type, level = 1) {
    const data = BUILDING_DATA[type];
    switch(data.category) {
      case 'residential':
        return new ResidentialBuilding(type, level);
      case 'commercial':
        return new CommercialBuilding(type, level);
      // ... otros casos
    }
  }
}
```

## Optimizaciones de Rendimiento

### 1. Object Pooling
Reutilización de objetos para reducir garbage collection:

```js
class BuildingPool {
  constructor() {
    this.pool = [];
  }
  
  get(type) {
    return this.pool.pop() || new Building(type);
  }
  
  release(building) {
    building.reset();
    this.pool.push(building);
  }
}
```

### 2. Spatial Indexing
Índice espacial para búsquedas eficientes de edificios adyacentes:

```js
class SpatialIndex {
  constructor(gridSize) {
    this.grid = new Map();
    this.gridSize = gridSize;
  }
  
  add(building, x, y) {
    const key = `${Math.floor(x/this.gridSize)},${Math.floor(y/this.gridSize)}`;
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(building);
  }
  
  getNeighbors(x, y, radius = 1) {
    // Implementación de búsqueda de vecinos
  }
}
```

### 3. Update Batching
Actualización por lotes para mejorar rendimiento:

```js
class BuildingManager {
  constructor() {
    this.updateQueue = [];
    this.batchSize = 10;
  }
  
  update(deltaTime) {
    // Procesar solo un lote de edificios por frame
    const batch = this.updateQueue.splice(0, this.batchSize);
    batch.forEach(building => building.update(deltaTime));
  }
}
```

## Extensibilidad del Sistema

### Agregar Nuevos Tipos de Edificios

1. **Definir datos en constants.js**:
```js
new_building: {
  name: { zh: '新建筑', en: 'New Building' },
  type: 'new_building',
  category: 'special',
  // ... otras propiedades
}
```

2. **Crear clase específica**:
```js
class SpecialBuilding extends Building {
  constructor(type, level) {
    super(type, level);
  }
  
  // Implementar métodos específicos
  getSpecialEffect() {
    // Lógica específica
  }
}
```

3. **Registrar en factory**:
```js
// Agregar caso en BuildingFactory
case 'special':
  return new SpecialBuilding(type, level);
```

### Agregar Nuevas Interacciones

```js
// En building-interactions.js
'new_building+park': {
  effect: 'special_boost',
  value: 0.2,
  description: 'Efecto especial del nuevo edificio'
}
```

Esta arquitectura proporciona una base sólida y extensible para el sistema de edificios de CubeCity, permitiendo fácil adición de nuevas funcionalidades y tipos de edificios mientras mantiene el código organizado y eficiente.