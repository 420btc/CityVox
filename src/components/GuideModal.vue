<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const _props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'showGuide'])

const { t } = useI18n()

// 内容切换状态
const showQuickReference = ref(false)

// localStorage 相关常量
const FIRST_VISIT_KEY = 'cubecity_first_visit'

// 检查是否首次访问
function isFirstVisit() {
  return !localStorage.getItem(FIRST_VISIT_KEY)
}

// 标记已访问
function markAsVisited() {
  localStorage.setItem(FIRST_VISIT_KEY, 'true')
}

// 组件挂载时检查首次访问状态
onMounted(() => {
  if (isFirstVisit()) {
    // 首次访问时自动显示新手教程
    emit('showGuide')
    // 标记为已访问
    markAsVisited()
  }
})

function closeModal() {
  emit('close')
  showQuickReference.value = false // 关闭时重置状态
}

// 防止点击内容区域时关闭弹窗
function handleContentClick(e) {
  e.stopPropagation()
}

// 切换显示内容
function toggleContent() {
  showQuickReference.value = !showQuickReference.value
}
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <div
      class="industrial-panel shadow-industrial max-w-4xl w-full max-h-[90vh] overflow-hidden"
      @click="handleContentClick"
    >
      <!-- 标题栏 -->
      <div class="p-4 border-b border-gray-600 flex justify-between items-center">
        <h2 class="text-xl font-bold text-industrial-accent uppercase tracking-wide neon-text">
          🏙️ {{ t('guideModal.title') }}
        </h2>
        <div class="flex items-center space-x-3">
          <!-- 切换按钮 -->
          <button
            class="px-3 py-1 rounded bg-industrial-green text-white font-bold shadow hover:bg-industrial-green/80 transition text-sm"
            @click="toggleContent"
          >
            {{ showQuickReference ? t('guideModal.toggleGuide') : t('guideModal.toggleQuickRef') }}
          </button>

          <button
            class="text-gray-400 hover:text-white transition-colors text-2xl"
            @click="closeModal"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
        <!-- 新手指南内容 -->
        <div v-if="!showQuickReference" class="space-y-6 text-gray-300">
          <!-- 游戏简介 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              1. 🎮 {{ t('guideModal.gameIntroduction.title') }}
            </h3>
            <p class="text-sm leading-relaxed mb-3">
              {{ t('guideModal.gameIntroduction.description') }}
            </p>
            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                {{ t('guideModal.gameIntroduction.coreFeatures') }}:
              </h4>
              <ul class="text-sm space-y-1">
                <li>🏗️ {{ t('guideModal.gameIntroduction.feature1') }}</li>
                <li>🏠 {{ t('guideModal.gameIntroduction.feature2') }}</li>
                <li>💾 {{ t('guideModal.gameIntroduction.feature3') }}</li>
                <li>🎨 {{ t('guideModal.gameIntroduction.feature4') }}</li>
              </ul>
            </div>
          </section>

          <!-- 快速开始 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              2. 🚀 {{ t('guideModal.quickStart.title') }}
            </h3>
            <div class="bg-gray-800/50 p-3 rounded">
              <ol class="text-sm space-y-2 list-decimal list-inside">
                <li>{{ t('guideModal.quickStart.step1') }}</li>
                <li>{{ t('guideModal.quickStart.step2') }}</li>
                <li>{{ t('guideModal.quickStart.step3') }}</li>
                <li>{{ t('guideModal.quickStart.step4') }}</li>
              </ol>
            </div>
          </section>

          <!-- 基础操作 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              3. 🎯 {{ t('guideModal.basicOperations.title') }}
            </h3>

            <div class="space-y-4">
              <!-- 建筑操作 -->
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                  {{ t('guideModal.basicOperations.buildingOperations') }}:
                </h4>
                <ul class="text-sm space-y-1">
                  <li><span class="text-industrial-green">🏗️</span> {{ t('guideModal.basicOperations.selectBuilding') }}</li>
                  <li><span class="text-industrial-green">📍</span> {{ t('guideModal.basicOperations.placeBuilding') }}</li>
                  <li><span class="text-industrial-green">🚧</span> {{ t('guideModal.basicOperations.moveBuilding') }}</li>
                  <li><span class="text-industrial-green">⬆️</span> {{ t('guideModal.basicOperations.upgradeBuilding') }}</li>
                  <li><span class="text-industrial-green">💥</span> {{ t('guideModal.basicOperations.demolishBuilding') }}</li>
                </ul>
              </div>

              <!-- 快捷键 -->
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                  {{ t('guideModal.basicOperations.keyboardShortcuts') }}:
                </h4>
                <ul class="text-sm space-y-1">
                  <li><span class="text-industrial-blue">{{ t('guideModal.basicOperations.rotateKey') }}</span> 🔄 {{ t('guideModal.basicOperations.rotateBuilding') }}</li>
                  <li><span class="text-industrial-blue">{{ t('guideModal.basicOperations.escapeKey') }}</span> ❌ {{ t('guideModal.basicOperations.cancelOperation') }}</li>
                  <li><span class="text-industrial-blue">{{ t('guideModal.basicOperations.rightClick') }}</span> 🖱️ {{ t('guideModal.basicOperations.cancelSelection') }}</li>
                  <li><span class="text-industrial-blue">{{ t('guideModal.basicOperations.mouseScroll') }}</span> 📏 {{ t('guideModal.basicOperations.zoomView') }}</li>
                </ul>
              </div>

              <!-- 模式切换 -->
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                  {{ t('guideModal.basicOperations.modeSwitching') }}:
                </h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>{{ t('guideModal.basicOperations.selectMode') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span>🏗️</span>
                    <span>{{ t('guideModal.basicOperations.buildMode') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span>🚧</span>
                    <span>{{ t('guideModal.basicOperations.relocateMode') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span>💥</span>
                    <span>{{ t('guideModal.basicOperations.demolishMode') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 建筑系统 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              4. 🏢 {{ t('guideModal.buildingSystem.title') }}
            </h3>

            <div class="space-y-4">
              <!-- 建筑分类 -->
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                  {{ t('guideModal.buildingSystem.buildingCategories') }}:
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <h5 class="font-bold text-industrial-green mb-1">
                      🏠 {{ t('guideModal.buildingSystem.residential') }}
                    </h5>
                    <ul class="space-y-1 text-gray-400">
                      <li>🏠 {{ t('guideModal.buildingSystem.house') }}</li>
                      <li>🏡 {{ t('guideModal.buildingSystem.mansion') }}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="font-bold text-industrial-green mb-1">
                      🏬 {{ t('guideModal.buildingSystem.commercial') }}
                    </h5>
                    <ul class="space-y-1 text-gray-400">
                      <li>🏬 {{ t('guideModal.buildingSystem.shop') }}</li>
                      <li>🏢 {{ t('guideModal.buildingSystem.office') }}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="font-bold text-industrial-green mb-1">
                      🏭 {{ t('guideModal.buildingSystem.industrial') }}
                    </h5>
                    <ul class="space-y-1 text-gray-400">
                      <li>🏭 {{ t('guideModal.buildingSystem.factory') }}</li>
                      <li>🧪 {{ t('guideModal.buildingSystem.chemicalPlant') }}</li>
                      <li>☢️ {{ t('guideModal.buildingSystem.nuclearPlant') }}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="font-bold text-industrial-green mb-1">
                      🌳 {{ t('guideModal.buildingSystem.environmental') }}
                    </h5>
                    <ul class="space-y-1 text-gray-400">
                      <li>🌳 {{ t('guideModal.buildingSystem.park') }}</li>
                      <li>🗑️ {{ t('guideModal.buildingSystem.garbageStation') }}</li>
                      <li>☀️ {{ t('guideModal.buildingSystem.solarPanel') }}</li>
                      <li>🌬️ {{ t('guideModal.buildingSystem.windTurbine') }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 建筑相互作用 -->
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                  {{ t('guideModal.buildingSystem.buildingInteractions') }}:
                </h4>
                <div class="text-sm space-y-2">
                  <div class="flex items-start space-x-2">
                    <span class="text-industrial-green">🏠 + 🌳</span>
                    <span>{{ t('guideModal.buildingSystem.houseNearPark') }}</span>
                  </div>
                  <div class="flex items-start space-x-2">
                    <span class="text-industrial-green">🏬 + 🌳</span>
                    <span>{{ t('guideModal.buildingSystem.shopNearPark') }}</span>
                  </div>
                  <div class="flex items-start space-x-2">
                    <span class="text-industrial-green">🏭 + 🌳</span>
                    <span>{{ t('guideModal.buildingSystem.factoryNearPark') }}</span>
                  </div>
                  <div class="flex items-start space-x-2">
                    <span class="text-industrial-green">🏠 + 🏭</span>
                    <span>{{ t('guideModal.buildingSystem.houseNearFactory') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 资源管理 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              5. 💰 {{ t('guideModal.resourceManagement.title') }}
            </h3>

            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                {{ t('guideModal.resourceManagement.mainResources') }}:
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-center space-x-2">
                  <span class="text-industrial-green text-lg">💰</span>
                  <span>{{ t('guideModal.resourceManagement.coins') }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-industrial-blue text-lg">👥</span>
                  <span>{{ t('guideModal.resourceManagement.population') }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-industrial-yellow text-lg">⚡</span>
                  <span>{{ t('guideModal.resourceManagement.power') }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-400 text-lg">🌫️</span>
                  <span>{{ t('guideModal.resourceManagement.pollution') }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 进阶技巧 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              6. 🎯 {{ t('guideModal.advancedTips.title') }}
            </h3>

            <div class="bg-gray-800/50 p-3 rounded">
              <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                {{ t('guideModal.advancedTips.layoutStrategy') }}:
              </h4>
              <ul class="text-sm space-y-2">
                <li>🏠 + 🌳 {{ t('guideModal.advancedTips.houseNearPark') }}</li>
                <li>🏭 → 🏠 {{ t('guideModal.advancedTips.industryAwayFromHouses') }}</li>
                <li>🏬 + 🌳 {{ t('guideModal.advancedTips.commerceNearPark') }}</li>
                <li>🏭 + 🗑️ {{ t('guideModal.advancedTips.industryNearGarbage') }}</li>
                <li>⚡ + 🏠 {{ t('guideModal.advancedTips.powerNearHouses') }}</li>
              </ul>
            </div>
          </section>

          <!-- 常见问题 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              7. ❓ {{ t('guideModal.faq.title') }}
            </h3>

            <div class="space-y-3">
              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-1">
                  {{ t('guideModal.faq.notEnoughCoins.question') }}
                </h4>
                <p class="text-sm text-gray-400">
                  {{ t('guideModal.faq.notEnoughCoins.answer') }}
                </p>
              </div>

              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-1">
                  {{ t('guideModal.faq.slowPopulationGrowth.question') }}
                </h4>
                <p class="text-sm text-gray-400">
                  {{ t('guideModal.faq.slowPopulationGrowth.answer') }}
                </p>
              </div>

              <div class="bg-gray-800/50 p-3 rounded">
                <h4 class="text-sm font-bold text-industrial-yellow mb-1">
                  {{ t('guideModal.faq.tooMuchPollution.question') }}
                </h4>
                <p class="text-sm text-gray-400">
                  {{ t('guideModal.faq.tooMuchPollution.answer') }}
                </p>
              </div>
            </div>
          </section>

          <!-- 游戏小贴士 -->
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              8. 💡 {{ t('guideModal.gameTips.title') }}
            </h3>

            <div class="bg-gray-800/50 p-3 rounded">
              <ul class="text-sm space-y-2">
                <li>🏗️ {{ t('guideModal.gameTips.reasonableLayout') }}</li>
                <li>💰 {{ t('guideModal.gameTips.resourceBalance') }}</li>
                <li>⬆️ {{ t('guideModal.gameTips.upgradePriority') }}</li>
                <li>📊 {{ t('guideModal.gameTips.watchStatusIndicators') }}</li>
                <li>💾 {{ t('guideModal.gameTips.autoSave') }}</li>
                <li>🎮 {{ t('guideModal.gameTips.enjoyProcess') }}</li>
                <li>⚡ {{ t('guideModal.gameTips.performanceOptimization') }}</li>
              </ul>
            </div>
          </section>
        </div>

        <!-- 建筑相互作用速查表 -->
        <div v-if="showQuickReference" class="space-y-6 text-gray-300">
          <section>
            <h3 class="text-lg font-bold text-industrial-accent uppercase tracking-wide mb-3 neon-text">
              📋 {{ t('guideModal.quickReference.title') }}
            </h3>
            <p class="text-sm text-gray-400 mb-4">
              {{ t('guideModal.quickReference.description') }}
            </p>

            <!-- 住宅建筑相互作用 -->
            <div class="bg-gray-800/50 p-4 rounded mb-4">
              <h4 class="text-sm font-bold text-industrial-green mb-3 uppercase">
                🏠 {{ t('guideModal.quickReference.residential.title') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏠 + 🌳</span>
                  <span>{{ t('guideModal.quickReference.residential.housePark') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏠 + 🗽</span>
                  <span>{{ t('guideModal.quickReference.residential.houseMonument') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-red font-bold">🏠 + 🏭</span>
                  <span>{{ t('guideModal.quickReference.residential.houseFactory') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-red font-bold">🏠 + 🧪</span>
                  <span>{{ t('guideModal.quickReference.residential.houseChemical') }}</span>
                </div>
              </div>
            </div>

            <!-- 商业建筑相互作用 -->
            <div class="bg-gray-800/50 p-4 rounded mb-4">
              <h4 class="text-sm font-bold text-industrial-green mb-3 uppercase">
                🏬 {{ t('guideModal.quickReference.commercial.title') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏬 + 🌳</span>
                  <span>{{ t('guideModal.quickReference.commercial.shopPark') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏢 + 🌳</span>
                  <span>{{ t('guideModal.quickReference.commercial.officePark') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏬 + 🚰</span>
                  <span>{{ t('guideModal.quickReference.commercial.shopWaterTower') }}</span>
                </div>
              </div>
            </div>

            <!-- 工业建筑相互作用 -->
            <div class="bg-gray-800/50 p-4 rounded mb-4">
              <h4 class="text-sm font-bold text-industrial-green mb-3 uppercase">
                🏭 {{ t('guideModal.quickReference.industrial.title') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏭 + 🌳</span>
                  <span>{{ t('guideModal.quickReference.industrial.factoryPark') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏭 + 🧪</span>
                  <span>{{ t('guideModal.quickReference.industrial.factoryChemical') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🏭 + 🚰</span>
                  <span>{{ t('guideModal.quickReference.industrial.factoryWaterTower') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🧪 + 🏭</span>
                  <span>{{ t('guideModal.quickReference.industrial.chemicalFactory') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🧪 + 🗑️</span>
                  <span>{{ t('guideModal.quickReference.industrial.chemicalGarbage') }}</span>
                </div>
              </div>
            </div>

            <!-- 发电设施相互作用 -->
            <div class="bg-gray-800/50 p-4 rounded mb-4">
              <h4 class="text-sm font-bold text-industrial-green mb-3 uppercase">
                ⚡ {{ t('guideModal.quickReference.power.title') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">☀️ + 🏠</span>
                  <span>{{ t('guideModal.quickReference.power.solarHouse') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">☀️ + 🌬️</span>
                  <span>{{ t('guideModal.quickReference.power.solarWind') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🌬️ + 🌳</span>
                  <span>{{ t('guideModal.quickReference.power.windPark') }}</span>
                </div>
              </div>
            </div>

            <!-- 环境设施相互作用 -->
            <div class="bg-gray-800/50 p-4 rounded mb-4">
              <h4 class="text-sm font-bold text-industrial-green mb-3 uppercase">
                🌱 {{ t('guideModal.quickReference.environmental.title') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🌳 + 🏠</span>
                  <span>{{ t('guideModal.quickReference.environmental.parkHouse') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🌳 + 🏬</span>
                  <span>{{ t('guideModal.quickReference.environmental.parkCommerce') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🌳 + 🏭</span>
                  <span>{{ t('guideModal.quickReference.environmental.parkIndustry') }}</span>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-industrial-green font-bold">🗑️ + 🏭</span>
                  <span>{{ t('guideModal.quickReference.environmental.garbageIndustry') }}</span>
                </div>
              </div>
            </div>

            <!-- 使用提示 -->
            <div class="bg-gray-800/50 p-4 rounded">
              <h4 class="text-sm font-bold text-industrial-yellow mb-2 uppercase">
                💡 {{ t('guideModal.quickReference.usageTips.title') }}
              </h4>
              <ul class="text-sm space-y-1 text-gray-400">
                <li>• {{ t('guideModal.quickReference.usageTips.layoutProperly') }}</li>
                <li>• {{ t('guideModal.quickReference.usageTips.keepHousesAway') }}</li>
                <li>• {{ t('guideModal.quickReference.usageTips.powerNearHouses') }}</li>
                <li>• {{ t('guideModal.quickReference.usageTips.environmentalReduce') }}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 滚动条样式已移至全局样式文件 */
</style>
