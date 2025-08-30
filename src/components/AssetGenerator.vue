<template>
  <div class="asset-generator-modal" v-if="isVisible" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ $t('assetGenerator.title') }}</h2>
        <button @click="closeModal" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Input Section -->
        <div class="input-section">
          <div class="input-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'text' }]"
              @click="activeTab = 'text'"
            >
              {{ $t('assetGenerator.textTab') }}
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'image' }]"
              @click="activeTab = 'image'"
            >
              {{ $t('assetGenerator.imageTab') }}
            </button>
          </div>

          <!-- Text Input Tab -->
          <div v-if="activeTab === 'text'" class="tab-content">
            <div class="text-input-container">
              <input
                v-model="textInput"
                type="text"
                :placeholder="$t('assetGenerator.textPlaceholder')"
                class="text-input"
                @keydown.enter="generateFromText"
              />
              <button 
                @click="generateFromText" 
                :disabled="!textInput.trim() || isGenerating"
                class="generate-btn"
              >
                <span v-if="!isGenerating">{{ $t('assetGenerator.generate') }}</span>
                <span v-else>{{ $t('assetGenerator.generating') }}</span>
              </button>
            </div>
          </div>

          <!-- Image Input Tab -->
          <div v-if="activeTab === 'image'" class="tab-content">
            <div class="image-input-container">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="file-input"
              />
              <div 
                class="drop-zone"
                @dragover.prevent
                @drop.prevent="handleDrop"
                @click="$refs.fileInput.click()"
              >
                <div v-if="!selectedFile" class="drop-zone-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                  <p>{{ $t('assetGenerator.dropImage') }}</p>
                </div>
                <div v-else class="selected-file">
                  <img :src="filePreview" alt="Preview" class="file-preview" />
                  <p>{{ selectedFile.name }}</p>
                </div>
              </div>
              <input
                v-model="imagePrompt"
                type="text"
                :placeholder="$t('assetGenerator.imagePromptPlaceholder')"
                class="text-input"
                @keydown.enter="generateFromImage"
              />
              <button 
                @click="generateFromImage" 
                :disabled="!selectedFile || !imagePrompt.trim() || isGenerating"
                class="generate-btn"
              >
                <span v-if="!isGenerating">{{ $t('assetGenerator.generate') }}</span>
                <span v-else>{{ $t('assetGenerator.generating') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Generated Assets Section -->
        <div class="generated-assets" v-if="generatedAssets.length > 0">
          <h3>{{ $t('assetGenerator.generatedAssets') }}</h3>
          <div class="assets-grid">
            <div 
              v-for="asset in generatedAssets" 
              :key="asset.id"
              class="asset-item"
              :class="{ selected: selectedAsset?.id === asset.id }"
              @click="selectAsset(asset)"
            >
              <div class="asset-image-container">
                <img :src="asset.imageUrl" :alt="asset.prompt" class="asset-image" />
                <!-- Indicador 3D -->
                <div v-if="asset.is3D" class="badge-3d">3D</div>
                <!-- Indicador de tiempo de generación -->
                <div v-if="asset.generationTime" class="generation-time-badge">{{ asset.generationTime }}s</div>
              </div>
              <div class="asset-info">
                <p class="asset-prompt">{{ asset.prompt }}</p>
                <small v-if="asset.is3D" class="asset-3d-info">✨ Modelo 3D disponible</small>
                <div class="asset-actions">
                  <button @click.stop="placeAssetOnMap(asset)" class="place-btn">
                    {{ $t('assetGenerator.placeOnMap') }}
                  </button>
                  
                  <!-- Botón Convertir a 3D -->
                   <button
                     v-if="falAvailable && !asset.is3D"
                     @click.stop="convertTo3D(asset)"
                     :disabled="isConverting3D"
                     class="convert-3d-btn"
                     :title="isConverting3D ? 'Convirtiendo a 3D con fal.ai... Esto puede tomar 1-2 minutos' : 'Convertir imagen a modelo 3D GLB con fal.ai'"
                   >
                     {{ isConverting3D ? 'Convirtiendo... (1-2 min)' : 'Convertir a 3D' }}
                   </button>
                  
                  <!-- Botón Descargar GLB (solo si ya es 3D) -->
                  <button
                    v-if="asset.is3D && asset.glbUrl"
                    @click.stop="downloadGLB(asset)"
                    class="download-glb-btn"
                  >
                    Descargar GLB
                  </button>
                  
                  <button @click.stop="downloadAsset(asset)" class="download-btn">
                    {{ asset.is3D ? 'Descargar PNG' : $t('assetGenerator.download') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Remix Section -->
        <div class="remix-section" v-if="selectedAsset && selectedAsset.suggestions">
          <h3>{{ $t('assetGenerator.remixSuggestions') }}</h3>
          <div class="suggestions-grid">
            <button 
              v-for="suggestion in selectedAsset.suggestions" 
              :key="suggestion"
              @click="remixAsset(selectedAsset, suggestion)"
              class="suggestion-btn"
              :disabled="isGenerating"
            >
              💡 {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateImageWithPrompt, generateImageFromText, getRemixSuggestions } from '@/services/geminiService'
import { convertImageToGameAsset, checkFalAvailability } from '@/services/falService'
import { useGameState } from '@/stores/useGameState'

export default {
  name: 'AssetGenerator',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'asset-generated'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const gameState = useGameState()
    
    // Reactive data
    const activeTab = ref('text')
    const textInput = ref('')
    const imagePrompt = ref('')
    const selectedFile = ref(null)
    const filePreview = ref('')
    const isGenerating = ref(false)
    const generatedAssets = ref([])
    const selectedAsset = ref(null)
    const nextAssetId = ref(1)
    const isConverting3D = ref(false)
    const falAvailable = ref(false)
    
    // Prompts específicos para CubeCity
    const BUILDING_PROMPT_TEMPLATE = (input) => 
      `Create a 3D isometric pixel art building of ${input} in 8-bit style on a transparent background. No drop shadow. Perfect for a city simulation game. PNG format with transparency.`
    
    const IMAGE_REMIX_PROMPT = "Transform this building into a different style while keeping it as 3D isometric pixel art on transparent background. No drop shadow. PNG format with transparency."
    
    const REMIX_SUGGESTION_PROMPT = "Here is a 3D pixel art building. Come up with 5 brief prompts for ways to remix this building. e.g. 'Make it taller' or 'Add windows' or some other alteration. Do NOT suggest ways to alter the environment or background, that must stay transparent. Only give alterations of the building itself. Prompts should be under 8 words."
    
    // Methods
    const closeModal = () => {
      emit('close')
    }
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        selectedFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          filePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const handleDrop = (event) => {
      const files = event.dataTransfer.files
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        selectedFile.value = files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          filePreview.value = e.target.result
        }
        reader.readAsDataURL(files[0])
      }
    }
    
    const generateFromText = async () => {
      if (!textInput.value.trim() || isGenerating.value) return
      
      isGenerating.value = true
      const startTime = Date.now()
      try {
        const prompt = BUILDING_PROMPT_TEMPLATE(textInput.value.trim())
        const { imageUrl } = await generateImageFromText(prompt)
        
        if (imageUrl) {
          // Convertir la imagen a File para obtener sugerencias
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const file = new File([blob], 'generated-asset.png', { type: 'image/png' })
          
          const suggestions = await getRemixSuggestions(file, REMIX_SUGGESTION_PROMPT)
          const endTime = Date.now()
          const generationTime = Math.round((endTime - startTime) / 1000)
          
          const asset = {
            id: nextAssetId.value++,
            imageUrl,
            prompt: textInput.value.trim(),
            type: 'text-generated',
            suggestions,
            processedImage: null,
            generationTime: generationTime
          }
          
          generatedAssets.value.push(asset)
          processImageForTransparency(asset)
          textInput.value = ''
        }
      } catch (error) {
        console.error('Error generating asset from text:', error)
        // TODO: Show error toast
      } finally {
        isGenerating.value = false
      }
    }
    
    const generateFromImage = async () => {
      if (!selectedFile.value || !imagePrompt.value.trim() || isGenerating.value) return
      
      isGenerating.value = true
      const startTime = Date.now()
      try {
        const prompt = `${imagePrompt.value.trim()}. Keep it as 3D isometric pixel art on white background. No drop shadow.`
        const { imageUrl } = await generateImageWithPrompt(selectedFile.value, prompt)
        
        if (imageUrl) {
          // Convertir la imagen a File para obtener sugerencias
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const file = new File([blob], 'generated-asset.png', { type: 'image/png' })
          
          const suggestions = await getRemixSuggestions(file, REMIX_SUGGESTION_PROMPT)
          const endTime = Date.now()
          const generationTime = Math.round((endTime - startTime) / 1000)
          
          const asset = {
            id: nextAssetId.value++,
            imageUrl,
            prompt: imagePrompt.value.trim(),
            type: 'image-generated',
            suggestions,
            processedImage: null,
            generationTime: generationTime
          }
          
          generatedAssets.value.push(asset)
          processImageForTransparency(asset)
          imagePrompt.value = ''
        }
      } catch (error) {
        console.error('Error generating asset from image:', error)
        // TODO: Show error toast
      } finally {
        isGenerating.value = false
      }
    }
    
    const remixAsset = async (asset, suggestion) => {
      if (isGenerating.value) return
      
      isGenerating.value = true
      const startTime = Date.now()
      try {
        // Convertir la imagen a File
        const response = await fetch(asset.imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'remix-source.png', { type: 'image/png' })
        
        const prompt = `${suggestion}. Keep it as 3D isometric pixel art on white background. No drop shadow.`
        const { imageUrl } = await generateImageWithPrompt(file, prompt)
        
        if (imageUrl) {
          const endTime = Date.now()
          const generationTime = Math.round((endTime - startTime) / 1000)
          
          const newAsset = {
            id: nextAssetId.value++,
            imageUrl,
            prompt: `${asset.prompt} - ${suggestion}`,
            type: 'remix',
            suggestions: asset.suggestions,
            processedImage: null,
            generationTime: generationTime
          }
          
          generatedAssets.value.push(newAsset)
          processImageForTransparency(newAsset)
          selectedAsset.value = newAsset
        }
      } catch (error) {
        console.error('Error remixing asset:', error)
        // TODO: Show error toast
      } finally {
        isGenerating.value = false
      }
    }
    
    const processImageForTransparency = (asset) => {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(img, 0, 0)
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Get top-left pixel color as background
          const bgR = data[0]
          const bgG = data[1]
          const bgB = data[2]
          
          const colorDistanceThreshold = 20
          const colorDistanceThresholdSquared = colorDistanceThreshold * colorDistanceThreshold
          
          // Remove background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            
            const distanceSquared = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
            
            if (distanceSquared < colorDistanceThresholdSquared) {
              data[i + 3] = 0 // Set alpha to 0 (transparent)
            }
          }
          
          ctx.putImageData(imageData, 0, 0)
          
          const transparentImage = new Image()
          transparentImage.src = canvas.toDataURL()
          transparentImage.onload = () => {
            asset.processedImage = transparentImage
          }
        } catch (error) {
          console.error('Error processing image for transparency:', error)
        }
      }
      img.src = asset.imageUrl
    }
    
    const selectAsset = (asset) => {
      selectedAsset.value = asset
    }
    
    const placeAssetOnMap = (asset) => {
      emit('asset-generated', {
        imageUrl: asset.imageUrl,
        processedImage: asset.processedImage,
        prompt: asset.prompt,
        type: 'custom-asset'
      })
      closeModal()
    }
    
    const downloadAsset = (asset) => {
      const link = document.createElement('a')
      link.download = `cubecity-asset-${asset.id}.png`
      link.href = asset.imageUrl
      link.click()
    }
    
    // Convertir asset a modelo 3D
    const convertTo3D = async (asset) => {
      if (!falAvailable.value) {
        alert('Servicio fal.ai no disponible')
        return
      }

      isConverting3D.value = true
      
      try {
        // Convertir la imagen a blob
        const response = await fetch(asset.imageUrl)
        const imageBlob = await response.blob()
        
        // Crear archivo con nombre apropiado
        const imageFile = new File([imageBlob], 'asset.png', { type: 'image/png' })
        
        // Convertir a modelo 3D
        const result = await convertImageToGameAsset(imageFile, asset.prompt)
        
        // Crear URL para descarga del modelo GLB
        const glbUrl = URL.createObjectURL(result.glbBlob)
        
        // Actualizar el asset con el modelo 3D
        const updatedAsset = {
          ...asset,
          glbUrl: glbUrl,
          glbBlob: result.glbBlob, // Almacenar el blob directamente
          glbFileName: result.fileName,
          meshStats: result.meshStats,
          seed3D: result.seed,
          is3D: true
        }
        
        // Actualizar en la lista
        const index = generatedAssets.value.findIndex(a => a.id === asset.id)
        if (index !== -1) {
          generatedAssets.value[index] = updatedAsset
        }
        
        alert(`¡Modelo 3D generado exitosamente con fal.ai!\n\nArchivo: ${result.fileName}\n\nTamaño: ${(result.fileSize / 1024 / 1024).toFixed(2)} MB\n\nEl modelo GLB está listo para usar en el juego.`)
        
      } catch (error) {
        console.error('Error convirtiendo a 3D:', error)
        alert(`Error al convertir a 3D: ${error.message}`)
      } finally {
        isConverting3D.value = false
      }
    }

    // Descargar modelo GLB
    const downloadGLB = (asset) => {
      if (!asset.glbUrl) return
      
      const link = document.createElement('a')
      link.href = asset.glbUrl
      link.download = asset.glbFileName || `${asset.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_3d.glb`
      link.click()
    }
    
    // Verificar disponibilidad de fal.ai al montar
    onMounted(async () => {
      try {
        falAvailable.value = await checkFalAvailability()
        console.log('fal.ai disponible:', falAvailable.value)
      } catch (error) {
        console.error('Error verificando fal.ai:', error)
        falAvailable.value = false
      }
    })
    
    return {
      activeTab,
      textInput,
      imagePrompt,
      selectedFile,
      filePreview,
      isGenerating,
      generatedAssets,
      selectedAsset,
      isConverting3D,
      falAvailable,
      closeModal,
      handleFileUpload,
      handleDrop,
      generateFromText,
      generateFromImage,
      remixAsset,
      selectAsset,
      placeAssetOnMap,
      downloadAsset,
      convertTo3D,
      downloadGLB
    }
  }
}
</script>

<style scoped>
.asset-generator-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 20px;
}

.input-section {
  margin-bottom: 30px;
}

.input-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  padding: 20px 0;
}

.text-input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.text-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
}

.generate-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.generate-btn:hover:not(:disabled) {
  background: #0056b3;
}

.generate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.image-input-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-input {
  display: none;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.drop-zone:hover {
  border-color: #007bff;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.selected-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.file-preview {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.generated-assets {
  margin-bottom: 30px;
}

.generated-assets h3 {
  margin-bottom: 16px;
  color: #333;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.asset-item {
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.asset-item:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.asset-item.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.asset-image-container {
       position: relative;
       width: 100%;
       height: 260px;
       padding: 20px;
       display: flex;
       align-items: center;
       justify-content: center;
     }

.asset-image {
  width: 90%;
  height: 90%;
  object-fit: contain;
  border-radius: 4px;
  border: 2px solid transparent;
}

.badge-3d {
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(45deg, #9333ea, #4f46e5);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 1;
}

.generation-time-badge {
   position: absolute;
   top: 4px;
   right: 4px;
   background: rgba(0, 0, 0, 0.7);
   color: white;
   font-size: 10px;
   font-weight: bold;
   padding: 2px 6px;
   border-radius: 8px;
   box-shadow: 0 2px 4px rgba(0,0,0,0.3);
   z-index: 1;
 }

.asset-3d-info {
  color: #9333ea;
  font-weight: 500;
  display: block;
  margin-top: 4px;
}

.asset-info {
  padding: 16px;
}

.asset-prompt {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.asset-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
    min-height: 60px;
    align-content: flex-start;
  }

.place-btn, .download-btn {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #007bff;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 70px;
}

.place-btn {
  background: #007bff;
  color: white;
}

.place-btn:hover {
  background: #0056b3;
}

.download-btn {
  background: white;
  color: #007bff;
}

.download-btn:hover {
  background: #f8f9fa;
}

.convert-3d-btn {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #9333ea;
    border-radius: 3px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    background: #9333ea;
    color: white;
    min-width: 70px;
  }
  
  .convert-3d-btn:hover:not(:disabled) {
    background: #7c3aed;
  }
  
  .convert-3d-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .download-glb-btn {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #4f46e5;
    border-radius: 3px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    background: #4f46e5;
    color: white;
    min-width: 70px;
  }
  
  .download-glb-btn:hover {
    background: #4338ca;
  }

.remix-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.suggestion-btn {
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: all 0.2s;
}

.suggestion-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #007bff;
}

.suggestion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>