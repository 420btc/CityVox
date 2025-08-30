# Configuración de fal.ai para Generación 3D

Este documento explica cómo configurar y usar el servicio fal.ai para generar modelos 3D a partir de imágenes 2D en CubeCity.

## 🔧 Configuración Inicial

### 1. Obtener API Key de fal.ai

1. Visita [fal.ai](https://fal.ai/)
2. Crea una cuenta o inicia sesión
3. Ve a tu dashboard y obtén tu API key
4. La API key tiene el formato: `key_id:secret_key`

### 2. Configurar Variables de Entorno

Agrega tu API key al archivo `.env`:

```env
# fal.ai API Configuration
VITE_FAL_API_KEY=tu_key_id:tu_secret_key
```

### 3. Instalar Dependencias

El cliente de fal.ai ya está instalado:

```bash
npm install @fal-ai/client
```

## 🎮 Uso en el Juego

### Generar Modelos 3D

1. **Generar Asset 2D**: Usa el generador de Gemini para crear una imagen
2. **Convertir a 3D**: Haz clic en el botón "Convertir a 3D (fal.ai)"
3. **Esperar Procesamiento**: El proceso toma 1-3 minutos
4. **Descargar o Colocar**: Una vez listo, puedes descargar el GLB o colocarlo en el mapa

### Características del Servicio

- **Modelo**: Hunyuan3D v2 Turbo
- **Entrada**: Imágenes PNG/JPG
- **Salida**: Archivos GLB con texturas
- **Tiempo**: 1-3 minutos por modelo
- **Calidad**: Alta calidad con texturas automáticas

## ⚙️ Configuración Técnica

### Parámetros de Generación

```javascript
{
  input_image_url: "URL_de_imagen",
  num_inference_steps: 30,     // Pasos de inferencia (más = mejor calidad)
  guidance_scale: 7.5,         // Escala de guía (7.5 es óptimo)
  octree_resolution: 256,      // Resolución del octree
  textured_mesh: true,         // Generar con texturas
  seed: 12345                  // Semilla para reproducibilidad
}
```

### Optimizaciones para Juego

- **Texturas incluidas**: Siempre se generan con texturas para mejor apariencia
- **Resolución balanceada**: 256 octree resolution para buen rendimiento
- **Formato GLB**: Compatible directamente con Three.js
- **Escalado automático**: Los modelos se ajustan al tamaño del tile

## 💰 Costos y Límites

### Precios de fal.ai

- **Modelo básico**: ~$0.05 por generación
- **Modelo con texturas**: ~$0.15 por generación (3x el precio básico)
- **Créditos**: Se consumen por uso

### Gestión de Créditos

1. Verifica tu saldo en [fal.ai dashboard](https://fal.ai/dashboard)
2. Recarga créditos cuando sea necesario
3. El juego mostrará errores si no hay créditos suficientes

## 🔍 Solución de Problemas

### Errores Comunes

#### "Servicio fal.ai no disponible"
- Verifica que la API key esté configurada correctamente
- Asegúrate de que el formato sea `key_id:secret_key`
- Reinicia el servidor de desarrollo

#### "Sin créditos suficientes"
- Verifica tu saldo en el dashboard de fal.ai
- Recarga créditos en tu cuenta
- Contacta soporte de fal.ai si hay problemas

#### "Error de conexión"
- Verifica tu conexión a internet
- Comprueba que fal.ai no esté en mantenimiento
- Intenta nuevamente en unos minutos

#### "Imagen muy grande"
- Reduce el tamaño de la imagen a menos de 2MB
- Usa formatos PNG o JPG
- Asegúrate de que la imagen sea clara y bien definida

### Logs de Depuración

Para ver logs detallados, abre las herramientas de desarrollador:

```javascript
// Los logs aparecen con prefijo "fal.ai:"
console.log('fal.ai: Iniciando conversión...');
```

## 🚀 Características Avanzadas

### Subida Automática de Archivos

El servicio automáticamente:
- Sube imágenes locales a fal.ai storage
- Convierte File/Blob a URLs públicas
- Maneja la limpieza de archivos temporales

### Integración con Three.js

Los modelos GLB generados:
- Se cargan directamente con GLTFLoader
- Mantienen texturas y materiales
- Se escalan automáticamente al tamaño del tile
- Son compatibles con el sistema de iluminación del juego

### Metadatos del Modelo

Cada modelo incluye:
- Tamaño del archivo
- Semilla usada para generación
- Tiempo de procesamiento
- URL de descarga

## 📊 Comparación con Hunyuan3D

| Característica | fal.ai | Hunyuan3D (anterior) |
|----------------|--------|----------------------|
| **Velocidad** | 1-3 min | 3-5 min |
| **Calidad** | Alta | Media |
| **Texturas** | Incluidas | Básicas |
| **Estabilidad** | Alta | Media |
| **Costo** | Pago por uso | Gratuito (limitado) |
| **Límites** | Por créditos | Por tiempo GPU |

## 🔗 Enlaces Útiles

- [fal.ai Dashboard](https://fal.ai/dashboard)
- [Documentación de fal.ai](https://fal.ai/docs)
- [Hunyuan3D v2 Turbo](https://fal.ai/models/fal-ai/hunyuan3d/v2/turbo)
- [Precios de fal.ai](https://fal.ai/pricing)
- [Soporte de fal.ai](https://fal.ai/support)

---

**Nota**: Este servicio requiere una conexión a internet activa y créditos en tu cuenta de fal.ai para funcionar.