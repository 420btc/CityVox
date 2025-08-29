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
              <img :src="asset.imageUrl" :alt="asset.prompt" class="asset-image" />
              <div class="asset-info">
                <p class="asset-prompt">{{ asset.prompt }}</p>
                <div class="asset-actions">
                  <button @click.stop="placeAssetOnMap(asset)" class="place-btn">
                    {{ $t('assetGenerator.placeOnMap') }}
                  </button>
                  <button @click.stop="downloadAsset(asset)" class="download-btn">
                    {{ $t('assetGenerator.download') }}
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
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateImageWithPrompt, generateImageFromText, getRemixSuggestions } from '@/services/geminiService'
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
      try {
        const prompt = BUILDING_PROMPT_TEMPLATE(textInput.value.trim())
        const { imageUrl } = await generateImageFromText(prompt)
        
        if (imageUrl) {
          // Convertir la imagen a File para obtener sugerencias
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const file = new File([blob], 'generated-asset.png', { type: 'image/png' })
          
          const suggestions = await getRemixSuggestions(file, REMIX_SUGGESTION_PROMPT)
          
          const asset = {
            id: nextAssetId.value++,
            imageUrl,
            prompt: textInput.value.trim(),
            type: 'text-generated',
            suggestions,
            processedImage: null
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
      try {
        const prompt = `${imagePrompt.value.trim()}. Keep it as 3D isometric pixel art on white background. No drop shadow.`
        const { imageUrl } = await generateImageWithPrompt(selectedFile.value, prompt)
        
        if (imageUrl) {
          // Convertir la imagen a File para obtener sugerencias
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const file = new File([blob], 'generated-asset.png', { type: 'image/png' })
          
          const suggestions = await getRemixSuggestions(file, REMIX_SUGGESTION_PROMPT)
          
          const asset = {
            id: nextAssetId.value++,
            imageUrl,
            prompt: imagePrompt.value.trim(),
            type: 'image-generated',
            suggestions,
            processedImage: null
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
      try {
        // Convertir la imagen a File
        const response = await fetch(asset.imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'remix-source.png', { type: 'image/png' })
        
        const prompt = `${suggestion}. Keep it as 3D isometric pixel art on white background. No drop shadow.`
        const { imageUrl } = await generateImageWithPrompt(file, prompt)
        
        if (imageUrl) {
          const newAsset = {
            id: nextAssetId.value++,
            imageUrl,
            prompt: `${asset.prompt} - ${suggestion}`,
            type: 'remix',
            suggestions: asset.suggestions,
            processedImage: null
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
    
    return {
      activeTab,
      textInput,
      imagePrompt,
      selectedFile,
      filePreview,
      isGenerating,
      generatedAssets,
      selectedAsset,
      closeModal,
      handleFileUpload,
      handleDrop,
      generateFromText,
      generateFromImage,
      remixAsset,
      selectAsset,
      placeAssetOnMap,
      downloadAsset
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
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

.asset-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.asset-info {
  padding: 12px;
}

.asset-prompt {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.asset-actions {
  display: flex;
  gap: 8px;
}

.place-btn, .download-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #007bff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
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