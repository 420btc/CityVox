import * as THREE from 'three'
import Building from '../building.js'

/**
 * Clase para edificios personalizados generados con IA
 */
export default class CustomAsset extends Building {
  constructor(type = 'custom_asset', level = 1, direction = 0, options = {}) {
    super(type, level, direction, options)
    
    // Datos específicos del asset personalizado
    this.assetData = options.assetData || null
    this.imageUrl = options.imageUrl || null
    this.processedImage = options.processedImage || null
    this.prompt = options.prompt || 'Custom Asset'
    
    // Configuración de estado básica
    this.statusConfig = [
      ...super.getDefaultStatusConfig(),
    ]
  }

  // Sobrescribir initModel para usar la imagen generada
  initModel() {
    if (this.processedImage) {
      this.createMeshFromImage(this.processedImage)
    } else if (this.imageUrl) {
      this.createMeshFromImageUrl(this.imageUrl)
    } else {
      // Fallback a un cubo básico
      this.createFallbackMesh()
    }
  }

  /**
   * Crear mesh 3D desde una imagen procesada
   */
  createMeshFromImage(imageElement) {
    // Crear canvas para obtener las dimensiones de la imagen
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = imageElement.naturalWidth || imageElement.width
    canvas.height = imageElement.naturalHeight || imageElement.height
    ctx.drawImage(imageElement, 0, 0)
    
    // Crear textura desde la imagen
    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter // Para mantener el estilo pixel art
    texture.minFilter = THREE.NearestFilter
    
    // Calcular dimensiones del mesh basado en la imagen
    const aspectRatio = canvas.width / canvas.height
    const baseSize = 0.8 // Tamaño base similar a otros edificios
    
    let width, height
    if (aspectRatio > 1) {
      // Imagen más ancha que alta
      width = baseSize
      height = baseSize / aspectRatio
    } else {
      // Imagen más alta que ancha
      width = baseSize * aspectRatio
      height = baseSize
    }
    
    // Crear geometría plana con la imagen como textura
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      alphaTest: 0.1, // Para eliminar píxeles casi transparentes
      side: THREE.DoubleSide
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    
    // Posicionar el mesh
    mesh.position.set(0, height / 2, 0)
    mesh.rotation.x = 0 // Mantener vertical
    
    // Aplicar rotación según la dirección
    const angle = (this.direction % 4) * 90
    mesh.rotation.y = THREE.MathUtils.degToRad(angle)
    
    // Prohibir que el building sea seleccionado directamente
    mesh.raycast = () => {}
    
    this.setMesh(mesh)
  }

  /**
   * Crear mesh 3D desde una URL de imagen
   */
  createMeshFromImageUrl(imageUrl) {
    const loader = new THREE.TextureLoader()
    loader.load(
      imageUrl,
      (texture) => {
        texture.magFilter = THREE.NearestFilter
        texture.minFilter = THREE.NearestFilter
        
        // Crear geometría y material
        const aspectRatio = texture.image.width / texture.image.height
        const baseSize = 0.8
        
        let width, height
        if (aspectRatio > 1) {
          width = baseSize
          height = baseSize / aspectRatio
        } else {
          width = baseSize * aspectRatio
          height = baseSize
        }
        
        const geometry = new THREE.PlaneGeometry(width, height)
        const material = new THREE.MeshBasicMaterial({ 
          map: texture, 
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, height / 2, 0)
        
        const angle = (this.direction % 4) * 90
        mesh.rotation.y = THREE.MathUtils.degToRad(angle)
        mesh.raycast = () => {}
        
        this.setMesh(mesh)
      },
      undefined,
      (error) => {
        console.error('Error loading custom asset texture:', error)
        this.createFallbackMesh()
      }
    )
  }

  /**
   * Crear mesh de respaldo si no se puede cargar la imagen
   */
  createFallbackMesh() {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
    const material = new THREE.MeshStandardMaterial({ 
      color: '#ff6b6b',
      transparent: true,
      opacity: 0.8
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0.4, 0)
    
    const angle = (this.direction % 4) * 90
    mesh.rotation.y = THREE.MathUtils.degToRad(angle)
    mesh.raycast = () => {}
    
    this.setMesh(mesh)
  }

  // Métodos de funcionalidad del edificio
  getCost() {
    return 100 // Costo base para assets personalizados
  }

  getPopulation() {
    return 0 // Los assets personalizados no generan población por defecto
  }

  getPower() {
    return 0 // No consumen energía por defecto
  }

  getEconomy() {
    return 0 // No generan economía por defecto
  }

  // Información para mostrar en la UI
  getDisplayInfo() {
    return {
      name: this.prompt || 'Custom Asset',
      description: 'Edificio personalizado generado con IA',
      type: this.type,
      level: this.level
    }
  }

  update() {
    super.update()
    // Aquí se pueden agregar animaciones o efectos específicos
  }
}