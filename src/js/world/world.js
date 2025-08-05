import { useGameState } from '@/stores/useGameState.js'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import City from '../components/tiles/city.js'
import Experience from '../experience.js'
import Interactor from '../tools/interactor.js'
import Environment from './environment.js'
import SceneMetadata from './scene-metadata.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.gameState = useGameState()
    
    // 新增：场景元数据管理器
    this.experience.sceneMetadata = new SceneMetadata()
    
    // Configurar watcher inmediatamente
    this.setupGameStateWatcher()
    
    // Configurar listener para eventos de tile inmediatos
    this.setupTileEventListener()
    
    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.environment = new Environment()
      // 实例化城市地皮
      this.city = new City()

      // 交互系统
      this.interactor = new Interactor(this.city.root)     
      // Forzar sincronización inicial después de que la ciudad esté lista
      this.forceSyncInitial()
    })
  } 
  /**
   * 设置gameState监听器，当metadata变化时同步更新3D场景
   */
  setupGameStateWatcher() {
    const { metadata } = storeToRefs(this.gameState)
    
    console.log('World: Configurando watcher para metadata')
    
    // 深度监听metadata变化
    watch(
      metadata,
      (newMetadata, oldMetadata) => {
        console.log('World: Metadata cambió, sincronizando escena 3D')
        this.syncSceneWithMetadata(newMetadata, oldMetadata)
      },
      { 
        deep: true,
        immediate: true, // Ejecutar inmediatamente con el valor actual
        flush: 'sync' // Ejecutar sincrónicamente para mayor inmediatez
      }
    )
  }
  
  /**
   * Configurar listener para eventos inmediatos de tile
   */
  setupTileEventListener() {
    console.log('World: Configurando listener de eventos de tile')
    
    if (typeof window !== 'undefined') {
      window.addEventListener('tileUpdated', (event) => {
        const { x, y, tileData } = event.detail
        console.log(`World: Evento de tile recibido (${x}, ${y}):`, tileData)
        
        // Solo actualizar si la ciudad está lista
        if (this.city && this.city.meshes) {
          this.updateTileInScene(x, y, tileData)
        } else {
          console.log('World: Ciudad no está lista, evento ignorado')
        }
      })
    }
  }
  
  /**
   * Forzar sincronización inicial cuando la ciudad esté lista
   */
  forceSyncInitial() {
    console.log('World: Forzando sincronización inicial')
    if (this.gameState.metadata && this.city) {
      this.syncSceneWithMetadata(this.gameState.metadata, null)
    }
  }
  
  /**
   * 同步3D场景与gameState metadata
   */
  syncSceneWithMetadata(newMetadata, oldMetadata) {
    if (!this.city || !this.city.meshes) {
      console.log('World: City no está listo para sincronización')
      return
    }
    
    console.log('World: Iniciando sincronización de metadata con escena 3D')
    let changesDetected = 0
    
    // 遍历所有tiles检查变化
    for (let x = 0; x < newMetadata.length; x++) {
      for (let y = 0; y < newMetadata[x].length; y++) {
        const newTile = newMetadata[x][y]
        const oldTile = oldMetadata?.[x]?.[y]
        
        // 检查是否有变化
        if (this.hasTileChanged(newTile, oldTile)) {
          console.log(`World: Cambio detectado en tile (${x}, ${y}):`, newTile)
          this.updateTileInScene(x, y, newTile)
          changesDetected++
        }
      }
    }
    
    console.log(`World: Sincronización completada. ${changesDetected} cambios aplicados`)
  }
  
  /**
   * 检查tile是否发生变化
   */
  hasTileChanged(newTile, oldTile) {
    if (!oldTile) return true
    
    return (
      newTile.type !== oldTile.type ||
      newTile.building !== oldTile.building ||
      newTile.direction !== oldTile.direction ||
      newTile.level !== oldTile.level
    )
  }
  
  /**
   * 更新场景中的特定tile
   */
  updateTileInScene(x, y, tileData) {
    console.log(`World: Actualizando tile en escena (${x}, ${y}) con datos:`, tileData)
    
    const tile = this.city.getTile(x, y)
    if (!tile) {
      console.log(`World: ERROR - No se encontró tile en (${x}, ${y})`)
      return
    }

    console.log(`World: Tile encontrado en (${x}, ${y}), aplicando cambios...`)

    // 更新tile类型
    if (tileData.type) {
      console.log(`World: Cambiando tipo de tile a: ${tileData.type}`)
      tile.setType(tileData.type)
    }

    // 更新建筑
    if (tileData.building) {
      console.log(`World: Construyendo ${tileData.building} nivel ${tileData.level || 1} dirección ${tileData.direction || 0}`)
      tile.setBuilding(
        tileData.building,
        tileData.level || 1,
        tileData.direction || 0
      )
      console.log(`World: Edificio ${tileData.building} construido exitosamente`)
    } else {
      // 如果没有建筑，移除现有建筑
      console.log(`World: Removiendo edificio existente`)
      tile.removeBuilding()
    }

    console.log(`World: Tile sincronizado: (${x}, ${y}) - ${tileData.building || 'vacío'}`)
    
    // Forzar renderizado inmediato
    if (this.experience && this.experience.renderer) {
      this.experience.renderer.render()
    }
  }

  update() {
    // 若 city 有 update 行为可调用
    if (this.city && this.city.update) {
      this.city.update()
    }
    if (this.interactor && this.interactor.update) {
      this.interactor.update()
    }
  }
}
