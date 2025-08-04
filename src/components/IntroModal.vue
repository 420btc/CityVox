<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const videoRef = ref(null)
const isPlaying = ref(false)
const showControls = ref(true)

function closeModal() {
  // Pausar el video cuando se cierre el modal
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    isPlaying.value = false
  }
  emit('close')
}

// Prevenir que el modal se cierre al hacer clic en el contenido del video
function handleContentClick(e) {
  e.stopPropagation()
}

// Reproducir/pausar el video
function togglePlay() {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
      isPlaying.value = false
    } else {
      videoRef.value.play()
      isPlaying.value = true
    }
  }
}

// Reproducir el video automáticamente cuando se abra el modal
function onVideoLoad() {
  if (videoRef.value && props.show) {
    videoRef.value.play().catch(error => {
      console.log('Autoplay prevented:', error)
    })
    isPlaying.value = true
  }
}

// Mostrar/ocultar controles
function toggleControls() {
  showControls.value = !showControls.value
}

// Escuchar cambios en el estado del video
watch(() => props.show, (newVal) => {
  if (newVal && videoRef.value) {
    setTimeout(() => {
      onVideoLoad()
    }, 100)
  }
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black z-[99999] flex items-center justify-center"
    style="pointer-events: auto; isolation: isolate;"
    @click="closeModal"
  >
    <!-- Botón de cerrar en la esquina superior derecha -->
    <button
      class="absolute top-4 right-4 z-[100000] text-white hover:text-gray-300 transition-colors text-3xl bg-black/70 rounded-full w-12 h-12 flex items-center justify-center"
      style="pointer-events: auto;"
      @click="closeModal"
    >
      ✕
    </button>

    <!-- Contenedor del video personalizado -->
    <div class="relative w-full h-full flex items-center justify-center" @click="handleContentClick">
      <!-- Video sin controles nativos -->
      <video
        ref="videoRef"
        class="w-full h-full object-contain video-custom"
        preload="metadata"
        @loadeddata="onVideoLoad"
        @click="togglePlay"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      >
        <source src="/videos/introvideo.mp4" type="video/mp4">
      </video>
      
      <!-- Controles personalizados -->
       <div v-if="showControls" class="absolute bottom-4 right-4 flex items-center space-x-4 bg-black/70 rounded-lg px-4 py-2">
         <button 
           @click="togglePlay" 
           class="text-white hover:text-gray-300 text-2xl transition-colors"
         >
           {{ isPlaying ? '⏸️' : '▶️' }}
         </button>
         <span class="text-white text-sm">{{ t('introModal.title') }}</span>
       </div>
      
      <!-- Mensaje de error si no se soporta video -->
      <div v-if="!videoRef" class="text-white text-center">
        {{ t('introModal.videoNotSupported') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.fixed {
  position: fixed !important;
  z-index: 99999 !important;
  isolation: isolate;
}

.video-custom {
  background: black;
  cursor: pointer;
}

.video-custom:hover {
  /* Eliminar cualquier efecto hover */
  filter: none !important;
  opacity: 1 !important;
  background: black !important;
}

/* Eliminar controles nativos completamente */
.video-custom::-webkit-media-controls {
  display: none !important;
}

.video-custom::-webkit-media-controls-panel {
  display: none !important;
}

.video-custom::-webkit-media-controls-play-button {
  display: none !important;
}

.video-custom::-webkit-media-controls-start-playback-button {
  display: none !important;
}
</style>