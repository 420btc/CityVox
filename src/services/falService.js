import { fal } from "@fal-ai/client";

/**
 * Servicio para integración con fal.ai API
 * Convierte imágenes 2D en modelos 3D GLB usando Hunyuan3D v2 Turbo
 */

// Configurar la API key
fal.config({
  credentials: import.meta.env.VITE_FAL_API_KEY
});

/**
 * Convierte una imagen en un modelo 3D usando fal.ai Hunyuan3D v2 Turbo
 * @param {string} imageUrl - URL de la imagen a convertir
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<{glbFile: Blob, fileName: string}>} - Archivo GLB generado
 */
export async function convertImageTo3D(imageUrl, options = {}) {
  try {
    console.log('fal.ai: Iniciando conversión de imagen a 3D...', imageUrl);
    
    // Configuración optimizada para edificios
    const config = {
      input_image_url: imageUrl,
      num_inference_steps: options.steps || 30,
      guidance_scale: options.guidance_scale || 7.5,
      octree_resolution: options.octree_resolution || 256,
      textured_mesh: options.textured_mesh !== false, // true por defecto para mejor calidad
      seed: options.seed || Math.floor(Math.random() * 10000),
      ...options
    };

    console.log('fal.ai: Configuración:', config);
    
    // Llamar a la API de fal.ai
    const result = await fal.subscribe("fal-ai/hunyuan3d/v2/turbo", {
      input: config,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('fal.ai: Progreso:', update.status);
          if (update.logs) {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        }
      },
    });

    console.log('fal.ai: Modelo 3D generado:', result.data);

    if (!result.data || !result.data.model_mesh) {
      throw new Error('No se pudo generar el modelo 3D');
    }

    // Descargar el archivo GLB
    const glbUrl = result.data.model_mesh.url;
    const fileName = result.data.model_mesh.file_name || 'model_3d.glb';
    
    console.log('fal.ai: Descargando GLB desde:', glbUrl);
    
    const response = await fetch(glbUrl);
    if (!response.ok) {
      throw new Error(`Error descargando GLB: ${response.statusText}`);
    }
    
    const glbBlob = await response.blob();
    
    return {
      glbFile: glbBlob,
      fileName: fileName,
      fileSize: result.data.model_mesh.file_size,
      seed: result.data.seed,
      success: true
    };

  } catch (error) {
    console.error('Error en conversión fal.ai:', error);
    
    // Manejo específico de errores comunes
    if (error.message.includes('queue') || error.message.includes('busy')) {
      throw new Error('El servicio fal.ai está ocupado. Intenta nuevamente en unos minutos.');
    } else if (error.message.includes('credits') || error.message.includes('quota')) {
      throw new Error('Sin créditos suficientes en fal.ai. Verifica tu cuenta.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Error de conexión con fal.ai. Verifica tu conexión a internet.');
    } else {
      throw new Error(`Error al convertir imagen a 3D: ${error.message}`);
    }
  }
}

/**
 * Convierte una imagen a modelo 3D optimizado para el juego
 * @param {File|Blob|string} imageInput - Imagen a convertir (File, Blob o URL)
 * @param {string} buildingName - Nombre del edificio
 * @returns {Promise<{glbBlob: Blob, fileName: string}>} - Modelo GLB listo para el juego
 */
export async function convertImageToGameAsset(imageInput, buildingName = 'custom_building') {
  try {
    console.log('fal.ai: Convirtiendo imagen para juego...', buildingName);
    
    let imageUrl;
    
    // Si es un File o Blob, subirlo a fal.ai storage
    if (imageInput instanceof File || imageInput instanceof Blob) {
      console.log('fal.ai: Subiendo imagen...');
      imageUrl = await fal.storage.upload(imageInput);
      console.log('fal.ai: Imagen subida:', imageUrl);
    } else if (typeof imageInput === 'string') {
      imageUrl = imageInput;
    } else {
      throw new Error('Tipo de imagen no soportado');
    }

    // Configuración optimizada para edificios de juego
    const gameConfig = {
      steps: 25, // Balance entre calidad y velocidad
      guidance_scale: 7.5, // Buena calidad
      octree_resolution: 256, // Resolución estándar
      textured_mesh: true, // Siempre con textura para mejor apariencia
    };

    // Generar modelo 3D
    const result = await convertImageTo3D(imageUrl, gameConfig);
    
    if (!result.success || !result.glbFile) {
      throw new Error('No se pudo generar el modelo 3D');
    }

    return {
      glbBlob: result.glbFile,
      fileName: `${buildingName}_3d.glb`,
      fileSize: result.fileSize,
      seed: result.seed
    };

  } catch (error) {
    console.error('Error convirtiendo imagen para juego:', error);
    throw error;
  }
}

/**
 * Verifica si el servicio fal.ai está disponible
 * @returns {Promise<boolean>} - True si está disponible
 */
export async function checkFalAvailability() {
  try {
    // Verificar que la API key esté configurada
    const apiKey = import.meta.env.VITE_FAL_API_KEY;
    if (!apiKey) {
      console.error('fal.ai: API key no configurada');
      return false;
    }
    
    console.log('fal.ai: Servicio disponible');
    return true;
  } catch (error) {
    console.error('fal.ai no disponible:', error);
    return false;
  }
}

/**
 * Obtiene información sobre el uso de créditos (si está disponible en la API)
 * @returns {Promise<Object>} - Información de créditos
 */
export async function getCreditInfo() {
  try {
    // Nota: fal.ai no expone directamente info de créditos en el cliente
    // Esta función es para futuras implementaciones
    return {
      available: true,
      message: 'Créditos disponibles (verificar en dashboard de fal.ai)'
    };
  } catch (error) {
    console.error('Error obteniendo info de créditos:', error);
    return {
      available: false,
      message: 'No se pudo verificar créditos'
    };
  }
}