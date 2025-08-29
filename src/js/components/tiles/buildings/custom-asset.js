import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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
    this.glbUrl = options.glbUrl || null
    this.is3D = options.is3D || false
    this.prompt = options.prompt || 'Custom Asset'
    
    // Configuración de estado básica
    this.statusConfig = [
      ...super.getDefaultStatusConfig(),
    ]
  }

  // Sobrescribir initModel para usar modelo 3D o imagen
  initModel() {
    if (this.is3D && this.glbUrl) {
      this.loadGLBModel(this.glbUrl)
    } else if (this.processedImage) {
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

  /**
   * Cargar modelo GLB 3D
   */
  loadGLBModel(glbUrl) {
    const loader = new GLTFLoader()
    
    loader.load(
      glbUrl,
      (gltf) => {
        console.log('CustomAsset: Modelo GLB cargado exitosamente')
        
        const model = gltf.scene
        
        // Escalar el modelo para que se ajuste al tamaño del tile
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const maxDimension = Math.max(size.x, size.y, size.z)
        
        // Escalar para que el modelo tenga un tamaño apropiado (0.8 unidades máximo)
        const scale = 0.8 / maxDimension
        model.scale.setScalar(scale)
        
        // Centrar el modelo
        const center = box.getCenter(new THREE.Vector3())
        model.position.set(-center.x * scale, 0, -center.z * scale)
        
        // Aplicar rotación según la dirección
        const angle = (this.direction % 4) * 90
        model.rotation.y = THREE.MathUtils.degToRad(angle)
        
        // Prohibir que el modelo sea seleccionado directamente
        model.traverse((child) => {
          if (child.isMesh) {
            child.raycast = () => {}
            // Asegurar que las texturas se vean correctamente
            if (child.material) {
              child.material.needsUpdate = true
            }
          }
        })
        
        this.setMesh(model)
      },
      (progress) => {
        console.log('CustomAsset: Cargando GLB...', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('Error cargando modelo GLB:', error)
        // Fallback a imagen si el GLB falla
        if (this.processedImage) {
          this.createMeshFromImage(this.processedImage)
        } else if (this.imageUrl) {
          this.createMeshFromImageUrl(this.imageUrl)
        } else {
          this.createFallbackMesh()
        }
      }
    )
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