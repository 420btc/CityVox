<template>
  <div class="ai-chat-container" :class="{ 'expanded': isExpanded }">
    <!-- Header del chat -->
    <div class="chat-header" @click="toggleExpanded">
      <div class="flex items-center gap-2">
        <div class="ai-status-indicator" :class="{ 'active': aiEnabled, 'playing': aiPlaying }"></div>
        <h3 class="text-lg font-bold">{{ $t('ai.title') }}</h3>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click.stop="toggleAI" 
          :class="['ai-toggle-btn', { 'active': aiEnabled }]"
          :disabled="!hasValidApiKey"
        >
          {{ aiEnabled ? $t('ai.disable') : $t('ai.enable') }}
        </button>
        <button 
          @click.stop="toggleSettings" 
          class="settings-btn"
          :title="$t('ai.settings')"
        >
          ⚙️
        </button>
        <button @click.stop="toggleExpanded" class="expand-btn">
          <span :class="isExpanded ? 'rotate-180' : ''">▼</span>
        </button>
      </div>
    </div>

    <!-- Modal de configuración -->
    <div v-if="showSettings" class="settings-modal" @click="toggleSettings">
      <div class="settings-content" @click.stop>
        <div class="settings-header">
          <h4 class="text-lg font-semibold">{{ $t('ai.settings') }}</h4>
          <button @click="toggleSettings" class="close-btn">✕</button>
        </div>
        <div class="settings-body">
          <!-- API Key Principal -->
          <div class="setting-item">
            <label class="setting-label">{{ $t('ai.primaryApiKey') }}:</label>
            <div class="api-key-display">
              <span class="api-key-masked">{{ maskedPrimaryKey }}</span>
              <button @click="clearPrimaryKey" class="clear-btn">{{ $t('ai.clear') }}</button>
            </div>
          </div>
          <div class="setting-item">
            <div class="flex gap-2">
              <input 
                v-model="tempPrimaryKey" 
                type="password" 
                :placeholder="$t('ai.apiKeyPlaceholder')"
                class="api-input"
                @keyup.enter="savePrimaryKey"
              />
              <button @click="savePrimaryKey" class="save-btn">
                {{ $t('ai.save') }}
              </button>
            </div>
          </div>

          <!-- API Key Secundaria -->
          <div class="setting-item">
            <label class="setting-label">{{ $t('ai.secondaryApiKey') }}:</label>
            <div class="api-key-display">
              <span class="api-key-masked">{{ maskedSecondaryKey }}</span>
              <button @click="clearSecondaryKey" class="clear-btn">{{ $t('ai.clear') }}</button>
            </div>
          </div>
          <div class="setting-item">
            <div class="flex gap-2">
              <input 
                v-model="tempSecondaryKey" 
                type="password" 
                :placeholder="$t('ai.apiKeySecondaryPlaceholder')"
                class="api-input"
                @keyup.enter="saveSecondaryKey"
              />
              <button @click="saveSecondaryKey" class="save-btn">
                {{ $t('ai.save') }}
              </button>
            </div>
          </div>

          <!-- Estado y acciones -->
          <div class="setting-item">
            <label class="setting-label">{{ $t('ai.status') }}:</label>
            <span :class="['status-indicator', apiStatusClass]">
              {{ apiStatusText }}
            </span>
          </div>
          
          <div class="setting-item">
            <button @click="clearAllKeys" class="clear-all-btn">
              {{ $t('ai.clearAll') }}
            </button>
          </div>
          
          <div class="setting-item">
            <p class="api-help-text">
              <strong>💡 Instrucciones:</strong><br>
              1. Pega tu API key de OpenAI en el campo "API Key Principal"<br>
              2. Haz clic en "Guardar" para confirmar<br>
              3. La API key secundaria es opcional (solo para respaldo)<br>
              <br>
              <em>Las API keys se guardan localmente en tu navegador y nunca se envían a terceros.</em>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido del chat -->
    <div v-if="isExpanded" class="chat-content">
      <!-- Configuración de API Key -->
      <div v-if="!hasValidApiKey" class="api-config">
        <h4 class="text-md font-semibold mb-2">{{ $t('ai.apiConfig') }}</h4>
        
        <!-- API Key Principal -->
        <div class="mb-3">
          <label class="text-sm font-medium mb-1 block">{{ $t('ai.primaryApiKey') }}</label>
          <div class="flex gap-2">
            <input 
              v-model="tempPrimaryKey" 
              type="password" 
              :placeholder="$t('ai.apiKeyPlaceholder')"
              class="api-input"
              @keyup.enter="savePrimaryKey"
            />
            <button @click="savePrimaryKey" class="save-btn">
              {{ $t('ai.save') }}
            </button>
          </div>
        </div>
        
        <!-- API Key Secundaria -->
        <div class="mb-3">
          <label class="text-sm font-medium mb-1 block">{{ $t('ai.secondaryApiKey') }}</label>
          <div class="flex gap-2">
            <input 
              v-model="tempSecondaryKey" 
              type="password" 
              :placeholder="$t('ai.apiKeySecondaryPlaceholder')"
              class="api-input"
              @keyup.enter="saveSecondaryKey"
            />
            <button @click="saveSecondaryKey" class="save-btn">
              {{ $t('ai.save') }}
            </button>
          </div>
        </div>
        
        <p class="text-xs text-gray-500 mt-1">{{ $t('ai.apiKeyHelp') }}</p>
      </div>

      <!-- Chat Messages -->
      <div v-else class="chat-messages" ref="messagesContainer">
        <div 
          v-for="message in chatHistory" 
          :key="message.id"
          :class="['message', message.type]"
        >
          <div class="message-header">
            <span class="message-sender">{{ message.sender }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div v-if="message.actions" class="message-actions">
            <div v-for="action in message.actions" :key="action.id" class="action-item">
              <span class="action-type">{{ action.type }}</span>
              <span class="action-details">{{ action.details }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input del chat -->
      <div v-if="hasValidApiKey" class="chat-input">
        <input 
          v-model="userMessage" 
          type="text" 
          :placeholder="$t('ai.chatPlaceholder')"
          class="message-input"
          @keyup.enter="sendMessage"
          :disabled="isProcessing"
        />
        <button 
          @click="sendMessage" 
          :disabled="!userMessage.trim() || isProcessing"
          class="send-btn"
        >
          {{ isProcessing ? $t('ai.processing') : $t('ai.send') }}
        </button>
      </div>

      <!-- Memoria y estado de la IA -->
      <div v-if="hasValidApiKey && aiEnabled" class="ai-memory">
        <h4 class="text-sm font-semibold mb-2">Estado de la IA</h4>
        <div class="memory-info">
          <div class="memory-item">
            <span class="memory-label">Paso actual:</span>
            <span class="memory-value">{{ aiStepCounter }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Próximo paso en:</span>
            <span class="memory-value countdown">{{ aiTimeUntilNext }}s</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Última acción:</span>
            <span class="memory-value">{{ aiLastAction || 'Ninguna' }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Fase actual:</span>
            <span class="memory-value">{{ aiMemoryData?.currentPhase || 'inicial' }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Objetivo:</span>
            <span class="memory-value">{{ aiMemoryData?.nextGoal || 'Definiendo estrategia...' }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Construido:</span>
            <span class="memory-value">{{ aiMemoryData?.builtRoads?.length || 0 }} carreteras, {{ aiMemoryData?.builtBuildings?.length || 0 }} edificios</span>
          </div>
        </div>
      </div>

      <!-- Historial de acciones de la IA -->
      <div v-if="hasValidApiKey" class="ai-history">
        <h4 class="text-sm font-semibold mb-2">{{ $t('ai.actionHistory') }}</h4>
        <div class="history-list">
          <div 
            v-for="action in aiActionHistory" 
            :key="action.id"
            class="history-item"
          >
            <div class="history-time">{{ formatTime(action.timestamp) }}</div>
            <div class="history-action">{{ action.description }}</div>
            <div v-if="action.coordinates" class="history-coords">
              ({{ action.coordinates.x }}, {{ action.coordinates.y }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameState } from '@/stores/useGameState.js'
import { useAIPlayer } from '@/hooks/useAIPlayer.js'

export default {
  name: 'AIChat',
  setup() {
    const { t } = useI18n()
    const gameState = useGameState()
    const aiPlayer = useAIPlayer()
    
    const isExpanded = ref(false)
    const showSettings = ref(false)
    const tempPrimaryKey = ref('')
    const tempSecondaryKey = ref('')
    const userMessage = ref('')
    const isProcessing = ref(false)
    const messagesContainer = ref(null)
    
    const chatHistory = ref([])
    const aiActionHistory = ref([])
    
    const hasValidApiKey = computed(() => {
      return localStorage.getItem('openai_api_key_primary') !== null || localStorage.getItem('openai_api_key_secondary') !== null
    })
    
    const aiEnabled = computed(() => aiPlayer.isEnabled.value)
    const aiPlaying = computed(() => aiPlayer.isPlaying.value)
    
    // Variables de memoria de la IA
    const aiStepCounter = computed(() => aiPlayer.stepCounter.value)
    const aiTimeUntilNext = computed(() => aiPlayer.timeUntilNextStep.value)
    const aiLastAction = computed(() => aiPlayer.lastAIAction.value)
    const aiMemoryData = computed(() => aiPlayer.aiMemory.value)
    
    const maskedPrimaryKey = computed(() => {
      const apiKey = localStorage.getItem('openai_api_key_primary')
      if (!apiKey) return 'No configurada'
      return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4)
    })

    const maskedSecondaryKey = computed(() => {
      const apiKey = localStorage.getItem('openai_api_key_secondary')
      if (!apiKey) return 'No configurada'
      return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4)
    })

    const apiStatusClass = computed(() => {
      const primaryKey = localStorage.getItem('openai_api_key_primary')
      const secondaryKey = localStorage.getItem('openai_api_key_secondary')
      
      if (primaryKey && secondaryKey) return 'both-configured'
      if (primaryKey) return 'primary-configured'
      if (secondaryKey) return 'secondary-only'
      return 'not-configured'
    })

    const apiStatusText = computed(() => {
      const primaryKey = localStorage.getItem('openai_api_key_primary')
      const secondaryKey = localStorage.getItem('openai_api_key_secondary')
      
      if (primaryKey && secondaryKey) return t('ai.bothConfigured')
      if (primaryKey) return t('ai.primaryConfigured')
      if (secondaryKey) return t('ai.usingFallback')
      return t('ai.notConfigured')
    })
    
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
    }
    
    const toggleSettings = () => {
      showSettings.value = !showSettings.value
    }
    
    const clearPrimaryKey = () => {
      localStorage.removeItem('openai_api_key_primary')
      aiPlayer.stopAI()
      aiPlayer.initializeAI()
      addSystemMessage('API key principal eliminada')
    }

    const clearSecondaryKey = () => {
      localStorage.removeItem('openai_api_key_secondary')
      aiPlayer.initializeAI()
      addSystemMessage('API key secundaria eliminada')
    }

    const clearAllKeys = () => {
      localStorage.removeItem('openai_api_key_primary')
      localStorage.removeItem('openai_api_key_secondary')
      aiPlayer.stopAI()
      addSystemMessage('Todas las API keys eliminadas')
      showSettings.value = false
    }
    
    const savePrimaryKey = () => {
      const apiKey = tempPrimaryKey.value.trim()
      if (apiKey) {
        // Validar formato básico de API key de OpenAI
        if (apiKey.startsWith('sk-') && apiKey.length > 20) {
          localStorage.setItem('openai_api_key_primary', apiKey)
          tempPrimaryKey.value = ''
          aiPlayer.initializeAI()
          addSystemMessage('✅ API key principal guardada correctamente')
          
          // Cerrar el modal después de guardar exitosamente
          setTimeout(() => {
            showSettings.value = false
          }, 1500)
        } else {
          addSystemMessage('❌ Error: La API key debe comenzar con "sk-" y tener más de 20 caracteres')
        }
      } else {
        addSystemMessage('❌ Error: Por favor ingresa una API key válida')
      }
    }

    const saveSecondaryKey = () => {
      const apiKey = tempSecondaryKey.value.trim()
      if (apiKey) {
        // Validar formato básico de API key de OpenAI
        if (apiKey.startsWith('sk-') && apiKey.length > 20) {
          localStorage.setItem('openai_api_key_secondary', apiKey)
          tempSecondaryKey.value = ''
          aiPlayer.initializeAI()
          addSystemMessage('✅ API key secundaria guardada correctamente')
        } else {
          addSystemMessage('❌ Error: La API key debe comenzar con "sk-" y tener más de 20 caracteres')
        }
      } else {
        addSystemMessage('❌ Error: Por favor ingresa una API key válida')
      }
    }
    
    const toggleAI = () => {
      if (aiEnabled.value) {
        aiPlayer.stopAI()
        addSystemMessage('IA desactivada')
      } else {
        aiPlayer.startAI()
        addSystemMessage('IA activada - comenzando a jugar')
      }
    }
    
    const sendMessage = async () => {
      if (!userMessage.value.trim() || isProcessing.value) return
      
      const message = userMessage.value.trim()
      userMessage.value = ''
      
      // Agregar mensaje del usuario
      addMessage('Usuario', message, 'user')
      
      isProcessing.value = true
      
      try {
        const response = await aiPlayer.sendMessage(message)
        addMessage('IA', response, 'ai')
      } catch (error) {
        addMessage('Sistema', `Error: ${error.message}`, 'error')
      } finally {
        isProcessing.value = false
      }
    }
    
    const addMessage = (sender, content, type = 'system') => {
      const message = {
        id: Date.now() + Math.random(),
        sender,
        content,
        type,
        timestamp: new Date()
      }
      
      chatHistory.value.push(message)
      
      // Scroll to bottom
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    const addSystemMessage = (content) => {
      addMessage('Sistema', content, 'system')
    }
    
    const addAIAction = (description, coordinates = null, details = null) => {
      const action = {
        id: Date.now() + Math.random(),
        description,
        coordinates,
        details,
        timestamp: new Date()
      }
      
      aiActionHistory.value.unshift(action)
      
      // Mantener solo las últimas 50 acciones
      if (aiActionHistory.value.length > 50) {
        aiActionHistory.value = aiActionHistory.value.slice(0, 50)
      }
    }
    
    const formatTime = (timestamp) => {
      return timestamp.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    
    // Escuchar acciones de la IA
    onMounted(() => {
      aiPlayer.onAction((action) => {
        addAIAction(action.description, action.coordinates, action.details)
        
        // También agregar al chat si es una acción importante
        if (action.important) {
          addMessage('IA', action.description, 'ai-action')
        }
      })
    })
    
    return {
      isExpanded,
      showSettings,
      tempPrimaryKey,
      tempSecondaryKey,
      userMessage,
      isProcessing,
      messagesContainer,
      chatHistory,
      aiActionHistory,
      hasValidApiKey,
      aiEnabled,
      aiPlaying,
      aiStepCounter,
      aiTimeUntilNext,
      aiLastAction,
      aiMemoryData,
      maskedPrimaryKey,
      maskedSecondaryKey,
      apiStatusClass,
      apiStatusText,
      toggleExpanded,
      toggleSettings,
      clearPrimaryKey,
      clearSecondaryKey,
      clearAllKeys,
      savePrimaryKey,
      saveSecondaryKey,
      toggleAI,
      sendMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  z-index: 1000;
  transition: all 0.3s ease;
}

.ai-chat-container.expanded {
  width: 320px;
  height: 85vh;
  max-height: 900px;
}

.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  transition: all 0.3s ease;
}

.ai-status-indicator.active {
  background: #4ade80;
}

.ai-status-indicator.playing {
  background: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ai-toggle-btn {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.ai-toggle-btn.active {
  background: #4ade80;
  border-color: #4ade80;
}

.ai-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-btn {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.expand-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.chat-content {
  padding: 12px;
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 600px;
}

.api-config {
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.api-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 13px;
  transition: all 0.3s ease;
}

.api-input:focus {
  outline: none;
  border-color: #4ade80;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
}

.api-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.save-btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  background: #4ade80;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
}

.save-btn:hover {
  background: #22c55e;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 300px;
  max-height: 500px;
}

.message {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.message.user {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-left: 20px;
}

.message.ai {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  margin-right: 20px;
}

.message.system {
  background: rgba(156, 163, 175, 0.2);
  border: 1px solid rgba(156, 163, 175, 0.3);
  font-style: italic;
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.message.ai-action {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.message-sender {
  font-weight: bold;
}

.message-time {
  font-size: 11px;
}

.chat-input {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 13px;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.send-btn {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #4ade80;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.3s ease;
  min-width: 60px;
}

.send-btn:hover:not(:disabled) {
  background: #22c55e;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-history {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 12px;
}

.history-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.history-action {
  margin: 2px 0;
}

.history-coords {
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
  font-size: 11px;
}

/* Modal de configuración */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
}

.settings-content {
  background: rgba(20, 20, 20, 0.95);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  width: 320px;
  max-width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.settings-header {
  padding: 20px 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(40, 40, 40, 0.9);
  border-radius: 12px 12px 0 0;
}

.settings-header h4 {
  margin: 0;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.close-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: bold;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.05);
}

.settings-body {
  padding: 20px;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 0 0 12px 12px;
}

.setting-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

.api-key-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-height: 40px;
  width: 100%;
  max-width: 260px;
}

.api-key-masked {
  flex: 1;
  font-family: monospace;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.clear-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.7);
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status-indicator.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-indicator:not(.active) {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-indicator.both-configured {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-indicator.primary-configured {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-indicator.secondary-only {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-indicator.not-configured {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.clear-all-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.7);
}

.api-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;
  min-height: 40px;
}

.api-input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.api-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.save-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn:hover {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.2);
}

.flex {
  display: flex;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
}

.gap-2 {
  gap: 8px;
}

.api-help-text {
  font-size: 13px;
  color: #ffffff;
  line-height: 1.6;
  margin: 0;
  background: rgba(59, 130, 246, 0.15);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.api-help-text strong {
  color: #60a5fa;
  font-size: 14px;
}

.api-help-text em {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

/* Estilos para la memoria de la IA */
.ai-memory {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.memory-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.memory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.memory-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.memory-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
}

.memory-value.countdown {
  color: #22c55e;
  font-weight: 700;
  background: rgba(34, 197, 94, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
</style>