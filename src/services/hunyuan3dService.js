import { Client } from "@gradio/client";

/**
 * Servicio para integración con Hunyuan3D-2.1 API
 * Convierte imágenes 2D en modelos 3D GLB
 */

/**
 * Convierte una imagen en un modelo 3D usando Hunyuan3D-2.1
 * @param {File|Blob} imageFile - Archivo de imagen a convertir
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<{glbFile: Blob, texturedFile: Blob}>} - Archivos GLB generados
 */
export async function convertImageTo3D(imageFile, options = {}) {
  try {
    console.log('Hunyuan3D: Iniciando conversión de imagen a 3D...');
    
    // Configuración por defecto optimizada para edificios (reducida para evitar timeout)
    const config = {
      steps: options.steps || 15, // Reducido de 30 a 15
      guidance_scale: options.guidance_scale || 3, // Reducido de 5 a 3
      seed: options.seed || Math.floor(Math.random() * 10000),
      octree_resolution: options.octree_resolution || 128, // Reducido de 256 a 128
      check_box_rembg: options.remove_background !== false, // true por defecto
      num_chunks: options.num_chunks || 4000, // Reducido de 8000 a 4000
      randomize_seed: options.randomize_seed !== false, // true por defecto
      ...options
    };

    // Conectar al cliente de Hunyuan3D
    const client = await Client.connect("tencent/Hunyuan3D-2.1");
    
    console.log('Hunyuan3D: Cliente conectado, enviando imagen...');
    
    // Generar modelo 3D completo (shape + texture)
    const result = await client.predict("/generation_all", {
      image: imageFile,
      mv_image_front: imageFile, // Usar la misma imagen para todas las vistas
      mv_image_back: imageFile,
      mv_image_left: imageFile,
      mv_image_right: imageFile,
      steps: config.steps,
      guidance_scale: config.guidance_scale,
      seed: config.seed,
      octree_resolution: config.octree_resolution,
      check_box_rembg: config.check_box_rembg,
      num_chunks: config.num_chunks,
      randomize_seed: config.randomize_seed
    });

    console.log('Hunyuan3D: Modelo 3D generado:', result.data);

    // Extraer archivos del resultado
    // result.data[0] = archivo GLB sin textura
    // result.data[1] = archivo GLB con textura
    // result.data[2] = HTML output
    // result.data[3] = mesh stats
    // result.data[4] = seed usado
    
    const glbFile = result.data[0]; // Archivo GLB básico
    const texturedFile = result.data[1]; // Archivo GLB con textura
    const meshStats = result.data[3];
    const usedSeed = result.data[4];

    console.log('Hunyuan3D: Archivos extraídos:', {
      glbFile: glbFile ? 'Disponible' : 'No disponible',
      texturedFile: texturedFile ? 'Disponible' : 'No disponible',
      meshStats,
      usedSeed
    });

    return {
      glbFile,
      texturedFile,
      meshStats,
      usedSeed,
      success: true
    };

  } catch (error) {
    console.error('Error en conversión Hunyuan3D:', error);
    
    // Manejo específico de errores comunes
    if (error.message.includes('GPU duration') || error.message.includes('maximum allowed')) {
      throw new Error('Tiempo de procesamiento excedido. El servicio está ocupado, intenta con una imagen más simple o espera unos minutos.');
    } else if (error.message.includes('queue') || error.message.includes('busy')) {
      throw new Error('El servicio Hunyuan3D está ocupado. Intenta nuevamente en unos minutos.');
    } else if (error.message.includes('connection') || error.message.includes('network')) {
      throw new Error('Error de conexión con Hunyuan3D. Verifica tu conexión a internet.');
    } else {
      throw new Error(`Error al convertir imagen a 3D: ${error.message}`);
    }
  }
}

/**
 * Exporta un modelo 3D en formato específico
 * @param {Blob} glbFile - Archivo GLB base
 * @param {Blob} texturedFile - Archivo GLB con textura
 * @param {Object} exportOptions - Opciones de exportación
 * @returns {Promise<Blob>} - Archivo exportado
 */
export async function exportModel(glbFile, texturedFile, exportOptions = {}) {
  try {
    console.log('Hunyuan3D: Exportando modelo...');
    
    const config = {
      file_type: exportOptions.format || "glb",
      reduce_face: exportOptions.simplify || false,
      export_texture: exportOptions.includeTexture !== false, // true por defecto
      target_face_num: exportOptions.targetFaces || 10000,
      ...exportOptions
    };

    const client = await Client.connect("tencent/Hunyuan3D-2.1");
    
    const result = await client.predict("/on_export_click", {
      file_out: glbFile,
      file_out2: texturedFile,
      file_type: config.file_type,
      reduce_face: config.reduce_face,
      export_texture: config.export_texture,
      target_face_num: config.target_face_num
    });

    console.log('Hunyuan3D: Modelo exportado:', result.data);
    
    // result.data[0] = HTML output
    // result.data[1] = archivo descargable
    
    return {
      downloadFile: result.data[1],
      output: result.data[0],
      success: true
    };

  } catch (error) {
    console.error('Error en exportación Hunyuan3D:', error);
    throw new Error(`Error al exportar modelo 3D: ${error.message}`);
  }
}

/**
 * Convierte una imagen a modelo 3D optimizado para el juego
 * @param {File|Blob} imageFile - Imagen a convertir
 * @param {string} buildingName - Nombre del edificio
 * @returns {Promise<{glbBlob: Blob, fileName: string}>} - Modelo GLB listo para el juego
 */
export async function convertImageToGameAsset(imageFile, buildingName = 'custom_building') {
  try {
    console.log('Hunyuan3D: Convirtiendo imagen para juego...');
    
    // Configuración optimizada para edificios de juego (reducida para evitar timeout)
    const gameConfig = {
      steps: 10, // Muy rápido para evitar timeout
      guidance_scale: 3, // Mínimo para velocidad
      octree_resolution: 64, // Resolución baja para velocidad
      num_chunks: 2000, // Mínimo chunks para velocidad
      remove_background: true // Siempre remover fondo
    };

    // Generar modelo 3D
    const result = await convertImageTo3D(imageFile, gameConfig);
    
    if (!result.success || !result.texturedFile) {
      throw new Error('No se pudo generar el modelo 3D');
    }

    // Exportar en formato optimizado para el juego
    const exportResult = await exportModel(result.glbFile, result.texturedFile, {
      format: "glb",
      simplify: true, // Simplificar para mejor rendimiento
      includeTexture: true,
      targetFaces: 5000 // Límite de caras para rendimiento
    });

    if (!exportResult.success || !exportResult.downloadFile) {
      // Si falla la exportación, usar el archivo con textura directamente
      console.warn('Exportación falló, usando archivo con textura directamente');
      return {
        glbBlob: result.texturedFile,
        fileName: `${buildingName}_3d.glb`,
        meshStats: result.meshStats,
        seed: result.usedSeed
      };
    }

    return {
      glbBlob: exportResult.downloadFile,
      fileName: `${buildingName}_3d_optimized.glb`,
      meshStats: result.meshStats,
      seed: result.usedSeed
    };

  } catch (error) {
    console.error('Error convirtiendo imagen para juego:', error);
    throw error;
  }
}

/**
 * Verifica si el servicio Hunyuan3D está disponible
 * @returns {Promise<boolean>} - True si está disponible
 */
export async function checkHunyuan3DAvailability() {
  try {
    const client = await Client.connect("tencent/Hunyuan3D-2.1");
    return true;
  } catch (error) {
    console.error('Hunyuan3D no disponible:', error);
    return false;
  }
}