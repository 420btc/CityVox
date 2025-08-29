# Configuración del Generador de Assets con Gemini

Este proyecto incluye un generador de assets personalizado que utiliza la API de Google Gemini 2.5 Flash Image para crear edificios únicos para tu ciudad.

## Configuración

### 1. Obtener una API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API Key
4. Copia la API Key generada

### 2. Configurar las Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y reemplaza `your_gemini_api_key_here` con tu API Key real:
   ```
   VITE_GEMINI_API_KEY=tu_api_key_aqui
   ```

### 3. Instalar Dependencias

Si aún no lo has hecho, instala las dependencias del proyecto:

```bash
npm install
```

## Uso del Generador de Assets

### Acceder al Generador

1. Inicia el juego con `npm run dev`
2. En la barra superior, haz clic en el botón **🎨 AI**
3. Se abrirá el modal del Generador de Assets

### Generar Assets desde Texto

1. En la pestaña **"Texto"**:
   - Escribe una descripción del edificio que quieres crear
   - Ejemplo: "una torre de oficinas moderna", "una casa victoriana", "una fábrica steampunk"
   - Haz clic en **"Generar"**

### Generar Assets desde Imagen

1. En la pestaña **"Imagen"**:
   - Arrastra una imagen o haz clic para subir una
   - Escribe cómo quieres transformar la imagen
   - Ejemplo: "convertir en estilo pixel art", "hacer más futurista"
   - Haz clic en **"Generar"**

### Usar Assets Generados

1. Una vez generado el asset:
   - Aparecerá en la sección **"Assets Generados"**
   - Haz clic en **"Colocar en Mapa"** para añadirlo a tu ciudad
   - O haz clic en **"Descargar"** para guardar la imagen

### Remix de Assets

1. Selecciona un asset generado
2. En la sección **"Sugerencias de Remix"**:
   - Verás sugerencias automáticas generadas por IA
   - Haz clic en cualquier sugerencia para crear una variación
   - Ejemplo: "Hacer más alto", "Añadir ventanas", "Cambiar color"

## Características Técnicas

### Procesamiento Automático

- **Remoción de Fondo**: Los assets generados automáticamente tienen el fondo blanco removido
- **Estilo Isométrico**: Los prompts están optimizados para generar edificios en perspectiva isométrica 8-bit
- **Integración Perfecta**: Los assets se procesan para integrarse perfectamente en el estilo visual del juego

### Prompts Optimizados

- **Para Texto**: `"Create 3D isometric pixel art building of [tu descripción] in 8-bit style on a white background. No drop shadow. Perfect for a city simulation game."`
- **Para Imagen**: `"[tu descripción]. Keep it as 3D isometric pixel art on white background. No drop shadow."`
- **Para Remix**: Sugerencias contextuales basadas en el asset original

## Solución de Problemas

### Error: "API_KEY environment variable not set"

- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que la variable se llama exactamente `VITE_GEMINI_API_KEY`
- Reinicia el servidor de desarrollo después de crear/modificar el `.env`

### Error: "Unsupported engine"

- Este es solo un warning, la funcionalidad debería funcionar correctamente
- Se debe a que algunas dependencias requieren versiones más nuevas de Node.js

### Assets no se generan

- Verifica tu conexión a internet
- Asegúrate de que tu API Key de Gemini es válida
- Revisa la consola del navegador para errores específicos

### Assets no se colocan en el mapa

- Esta funcionalidad requiere integración adicional con el sistema de construcción del juego
- Por ahora, puedes descargar los assets y usarlos manualmente

## Limitaciones

- **Cuota de API**: Google Gemini tiene límites de uso gratuito
- **Tiempo de Generación**: Cada asset puede tomar 10-30 segundos en generarse
- **Calidad Variable**: Los resultados pueden variar dependiendo de la descripción
- **Idioma**: Los mejores resultados se obtienen con descripciones en inglés

## Consejos para Mejores Resultados

1. **Sé específico**: "Torre de oficinas de cristal de 20 pisos" vs "edificio"
2. **Menciona el estilo**: "estilo cyberpunk", "arquitectura gótica", "diseño minimalista"
3. **Incluye detalles**: "con ventanas iluminadas", "con antenas en el techo", "con jardín en la azotea"
4. **Experimenta con remix**: Usa las sugerencias automáticas para crear variaciones

## Soporte

Si encuentras problemas:

1. Revisa este documento
2. Verifica la configuración de tu API Key
3. Consulta la consola del navegador para errores
4. Asegúrate de tener la última versión del proyecto

¡Disfruta creando edificios únicos para tu ciudad con IA!