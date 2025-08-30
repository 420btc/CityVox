import Building from '../building.js'

// Casa azul - edificio residencial
export default class BlueHouse extends Building {
  constructor(type = 'bluehouse', level = 1, direction = 0, options = {}) {
    super(type, level, direction, options)

    // Usar la nueva configuración del sistema, la mayoría de efectos de estado ya están definidos en el archivo de configuración
    this.statusConfig = [
      // Heredar la configuración de estado básica (incluyendo verificación de carreteras y todos los efectos en el archivo de configuración)
      ...super.getDefaultStatusConfig(),

      // === Estados especiales (lógica compleja que no se puede configurar) ===

      // Falta de energía (verificación de estado global)
      {
        statusType: 'MISSING_POWER',
        condition: (building, gs) => gs.power > gs.maxPower,
        effect: { type: 'missPower', offsetY: 0.8 },
      },

      // Sobrepoblación (verificación de estado global)
      {
        statusType: 'OVER_POPULATION',
        condition: (building, gs) => gs.population > gs.maxPopulation,
        effect: { type: 'overPopulation', offsetY: 0.8 },
      },

      // Estado actualizable (depende de lógica de actualización compleja)
      {
        statusType: 'UPGRADE',
        condition: (building, gs) => {
          const buildingData = building.options.buildingData
          const currentLevel = building.level
          const nextLevel = currentLevel + 1
          const hasNextLevel = buildingData?.levels?.[nextLevel]
          const canAfford = gs.credits >= (buildingData?.levels?.[nextLevel]?.cost || 0)
          return hasNextLevel && canAfford
        },
        effect: { type: 'upgrade', offsetY: 0.8 },
      },
    ]
  }

  getCost() {
    return this.options.buildingData?.cost || 0
  }

  getPopulation() {
    return this.options.levelData?.maxPopulation || 0
  }

  // Sobrescribir el método update para llamar al nuevo sistema de rotación
  update() {
    // Llamar a la nueva lógica de rotación de la clase padre
    super.update()
  }
}