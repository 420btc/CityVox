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

        <button @click.stop="toggleExpanded" class="expand-btn">
          <span :class="isExpanded ? 'rotate-180' : ''">▼</span>
        </button>
      </div>
    </div>



    <!-- Contenido del chat -->
    <div v-if="isExpanded" class="chat-content">
      <!-- Configuración de API Key -->
      <div v-if="!hasValidApiKey" class="api-config">
        <h4 class="text-md font-semibold mb-2">🔑 Configurar API Key</h4>
        
        <div class="mb-3">
          <label class="text-sm font-medium mb-1 block">API Key de OpenAI</label>
          <div class="flex gap-2">
            <input 
              v-model="apiKeyInput" 
              type="password" 
              placeholder="sk-..."
              class="api-input"
              @keyup.enter="saveApiKey"
              :disabled="isValidating"
            />
            <button 
              @click="saveApiKey" 
              :class="['save-btn', { 'error': apiKeyError }]"
              :disabled="!apiKeyInput.trim() || isValidating"
            >
              <span v-if="isValidating" class="spinner"></span>
              {{ isValidating ? 'Validando...' : (apiKeyError ? 'Error' : 'Guardar') }}
            </button>
          </div>
          <div v-if="apiKeyError" class="error-message">
            ❌ API Key inválida. Verifica que sea correcta.
          </div>
        </div>
        
        <div class="api-help-text">
          <p><strong>📝 Instrucciones:</strong></p>
          <ol>
            <li>Obtén tu API key desde <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></li>
            <li>Pega la API key arriba</li>
            <li>Haz clic en "Guardar" para validar y activar la IA</li>
          </ol>
          <p><em>🔒 Tu API key se guarda localmente y nunca se comparte.</em></p>
        </div>
      </div>

      <!-- Chat Messages -->
      <div v-else class="chat-messages" ref="messagesContainer">
        <!-- Header del chat con botón de configuración -->
        <div class="chat-header">
          <span class="chat-title">💬 Chat con IA</span>
          <button @click="clearApiKey" class="config-btn" title="Cambiar API Key">
            ⚙️
          </button>
        </div>
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

      <!-- Estado cuando IA está desactivada -->
      <div v-if="hasValidApiKey && !aiEnabled" class="ai-disabled-state">
        <div class="disabled-message">
          <span class="disabled-icon">🤖💤</span>
          <p class="disabled-text">IA desactivada</p>
          <p class="disabled-subtitle">Activa la IA para comenzar a chatear</p>
        </div>
        <div class="disabled-actions">
          <button @click="toggleAI" class="activate-btn">
            ▶️ Activar IA
          </button>
          <button @click="clearApiKey" class="change-key-btn">
            🔑 Cambiar API Key
          </button>
        </div>
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
    const apiKeyInput = ref('')
    const isValidating = ref(false)
    const apiKeyError = ref(false)
    const apiKeyStored = ref(localStorage.getItem('openai_api_key') || '')
    const userMessage = ref('')
    const isProcessing = ref(false)
    const messagesContainer = ref(null)
    const chatHistory = ref([])
    const aiActionHistory = ref([])
    
    const hasValidApiKey = computed(() => {
      return apiKeyStored.value && apiKeyStored.value.length > 0
    })
    
    const aiEnabled = computed(() => aiPlayer.isEnabled.value)
    const aiPlaying = computed(() => aiPlayer.isPlaying.value)
    
    // Variables de memoria de la IA
    const aiStepCounter = computed(() => aiPlayer.stepCounter.value)
    const aiTimeUntilNext = computed(() => aiPlayer.timeUntilNextStep.value)
    const aiLastAction = computed(() => aiPlayer.lastAIAction.value)
    const aiMemoryData = computed(() => aiPlayer.aiMemory.value)
    

    
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
    }
    

    
    const validateApiKey = async (apiKey) => {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        return response.ok
      } catch (error) {
        console.error('Error validating API key:', error)
        return false
      }
    }
    
    const saveApiKey = async () => {
      if (!apiKeyInput.value.trim()) return
      
      isValidating.value = true
      apiKeyError.value = false
      
      const isValid = await validateApiKey(apiKeyInput.value.trim())
      
      if (isValid) {
        const trimmedKey = apiKeyInput.value.trim()
        localStorage.setItem('openai_api_key', trimmedKey)
        apiKeyStored.value = trimmedKey
        apiKeyInput.value = ''
        // Activar automáticamente la IA si la key es válida
        if (!aiEnabled.value) {
          toggleAI()
        }
      } else {
        apiKeyError.value = true
        setTimeout(() => {
          apiKeyError.value = false
        }, 3000)
      }
      
      isValidating.value = false
    }

    const clearApiKey = () => {
      localStorage.removeItem('openai_api_key')
      apiKeyStored.value = ''
      apiKeyInput.value = ''
      apiKeyError.value = false
      // Desactivar la IA si estaba activada
      if (aiEnabled.value) {
        toggleAI()
      }
      console.log('🗑️ API Key eliminada')
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
      apiKeyInput,
      isValidating,
      apiKeyError,
      apiKeyStored,
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
      toggleExpanded,
      saveApiKey,
      clearApiKey,
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover {
  background: #22c55e;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn.error {
  background: #ef4444;
  border-color: #ef4444;
}

.save-btn.error:hover {
  background: #dc2626;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.api-help-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin-top: 12px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.api-help-text ol {
  margin: 8px 0;
  padding-left: 16px;
}

.api-help-text li {
  margin: 4px 0;
}

.api-help-text a {
  color: #60a5fa;
  text-decoration: underline;
}

.api-help-text a:hover {
  color: #93c5fd;
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

.chat-messages .chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

.chat-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.config-btn {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.config-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .ai-disabled-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    text-align: center;
  }
  
  .disabled-message {
    margin-bottom: 20px;
  }
  
  .disabled-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
  }
  
  .disabled-text {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px 0;
  }
  
  .disabled-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
  
  .disabled-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .activate-btn {
    padding: 8px 16px;
    background: #22c55e;
    border: 1px solid #16a34a;
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .activate-btn:hover {
    background: #16a34a;
    transform: translateY(-1px);
  }
  
  .change-key-btn {
    padding: 8px 16px;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.4);
    border-radius: 6px;
    color: #60a5fa;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .change-key-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
    color: #93c5fd;
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

.api-input {
  width: 100%;
  max-width: 260px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 13px;
  min-height: 40px;
  transition: all 0.3s ease;
}

.api-input:focus {
  outline: none;
  border-color: #4ade80;
  background: rgba(255, 255, 255, 0.15);
}

.api-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.save-btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid #4ade80;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-btn:hover {
  background: rgba(74, 222, 128, 0.3);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.save-btn.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.save-btn.error:hover {
  background: rgba(239, 68, 68, 0.3);
}





.help-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-top: 16px;
  text-align: center;
}

.help-text strong {
  color: #4ade80;
  font-weight: 600;
}

.help-text em {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-top: 2px solid #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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