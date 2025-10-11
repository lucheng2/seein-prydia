<script setup lang="ts">
import closeIcon from '@/assets/images/icon/close.png'
import emptyImg from '@/assets/images/not-find.png'
import { getWordCloudData } from '~/apis/server'

const props = withDefaults(defineProps<Props>(), {})

interface Props {
  init?: (...args: any[]) => void
}

// 响应式状态
const loading = ref(false)
const error = ref('')
const copying = ref(false)
const downloading = ref(false)
const rawData = ref<any[]>([
  { weight: 26, text: 'Web Technologies' },
  { weight: 20, text: 'HTML' },
  { weight: 20, text: '<canvas>' },
  { weight: 15, text: 'CSS' },
  { weight: 15, text: 'JavaScript' },
  { weight: 12, text: 'Document Object Model' },
  { weight: 12, text: '<audio>' },
  { weight: 12, text: '<video>' },
  { weight: 12, text: 'Web Workers' },
  { weight: 12, text: 'XMLHttpRequest' },
  { weight: 12, text: 'SVG' },
  { weight: 9, text: 'JSON.parse()' },
  { weight: 9, text: 'Geolocation' },
  { weight: 9, text: 'data attribute' },
  { weight: 9, text: 'transform' },
  { weight: 9, text: 'transition' },
  { weight: 9, text: 'animation' },
  { weight: 7, text: 'setTimeout' },
  { weight: 7, text: '@font-face' },
  { weight: 7, text: 'Typed Arrays' },
  { weight: 7, text: 'FileReader API' },
  { weight: 7, text: 'FormData' },
  { weight: 7, text: 'IndexedDB' },
  { weight: 7, text: 'getUserMedia()' },
  { weight: 7, text: 'postMassage()' },
  { weight: 7, text: 'CORS' },
  { weight: 6, text: 'strict mode' },
  { weight: 6, text: 'calc()' },
  { weight: 6, text: 'supports()' },
  { weight: 6, text: 'media queries' },
  { weight: 6, text: 'full screen' },
  { weight: 6, text: 'notification' },
  { weight: 6, text: 'orientation' },
  { weight: 6, text: 'requestAnimationFrame' },
  { weight: 5, text: 'border-radius' },
  { weight: 5, text: 'box-sizing' },
  { weight: 5, text: 'rgba()' },
  { weight: 5, text: 'text-shadow' },
  { weight: 5, text: 'box-shadow' },
  { weight: 5, text: 'flexbox' },
  { weight: 5, text: 'viewpoint' },
])

// 词云组件引用
const wordCloudRef = ref()

const recentDays = ref(7)
const recentDaysOptions = ref([
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 15 days', value: 15 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 90 days', value: 90 },
])
// 加载对话数据
const {
  data: response,
  error: fetchError,
  pending,
  execute: fetchWordCloudData,
} = useAsyncData(
  `chat-wordcloud`,
  () => {
    return getWordCloudData({
      recentDays: recentDays.value,
    })
  },
  { lazy: true },
)

// 获取词云数据
watchEffect(() => {
  rawData.value = response.value?.wordItems || []
  error.value = fetchError.value?.message
  loading.value = pending.value
})

// 复制图片到剪贴板
const handleCopyImage = async () => {
  if (copying.value || !wordCloudRef.value) return

  copying.value = true
  try {
    const success = await wordCloudRef.value.copyImage()
    if (success) {
      // TODO: 可以添加toast提示
      message('Success copy', { type: 'success' })
    }
  }
  catch (error: any) {
    console.error('复制图片失败:', error)
    // TODO: 显示错误提示
  }
  finally {
    copying.value = false
  }
}

// 下载图片
const handleDownloadImage = async () => {
  if (downloading.value || !wordCloudRef.value) return

  downloading.value = true
  try {
    const success = await wordCloudRef.value.downloadImage()
    if (success) {
      // TODO: 可以添加成功提示
      message('Success download', { type: 'success' })
    }
  }
  catch (error: any) {
    console.error('下载图片失败:', error)
    // TODO: 显示错误提示
  }
  finally {
    downloading.value = false
  }
}

const showModal = ref(false)

const open = () => {
  showModal.value = true
  fetchWordCloudData()
}

const close = () => {
  showModal.value = false
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <div class="wordcloud-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      class="w-[80%] md:w-[800px]"
      :show-close="false"
      :z-index="2000"
      :close-on-click-modal="false"
    >
      <template #header />
      <div class="mb-[18px] flex justify-between">
        <div text="#FFFFFF 24px" font="500">Word Cloud</div>
        <div class="cursor-pointer rounded-[6px]" @click="close">
          <img class="z-10 block h-[20px] w-[20px]" :src="closeIcon" />
        </div>
      </div>
      <div class="wordcloud-container">
        <UiSelect
          v-model="recentDays"
          :options="recentDaysOptions"
          @handle-select="fetchWordCloudData"
        />
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <UiLoadingSpinner />
          <div class="loading-text">Loading wordcloud...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{{ error }}</div>
          <button class="retry-button" @click="() => fetchWordCloudData">
            Retry
          </button>
        </div>

        <!-- 词云内容 -->
        <div v-else-if="rawData.length > 0" class="wordcloud-content">
          <div class="wordcloud-canvas-wrapper">
            <UiWordCloud
              ref="wordCloudRef"
              :words="rawData"
              :width="760"
              :height="540"
              background-color="#312f36"
            />
          </div>

          <!-- 操作按钮组 -->
          <div class="wordcloud-actions">
            <button
              class="action-button copy-button"
              :disabled="copying"
              title="Copy"
              @click="handleCopyImage"
            >
              <img src="@/assets/images/icon/copy.png" class="action-icon" />
              <span class="action-text">{{
                copying ? "copying..." : "copy"
              }}</span>
            </button>
            <button
              class="action-button download-button"
              :disabled="downloading"
              title="download"
              @click="handleDownloadImage"
            >
              <img
                src="@/assets/images/icon/download.png"
                class="action-icon"
              />
              <span class="action-text">{{
                downloading ? "downloading..." : "save"
              }}</span>
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <img class="empty-icon" :src="emptyImg" />
          <div class="empty-text">You need to chat to view the wordcloud</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
  @apply w-[80%] md:w-[800px];
}
:deep(.el-dialog__header) {
  display: none;
}
.wordcloud-container {
  width: 100%;
  height: 100%;
  min-height: 488px;
  position: relative;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
}

.loading-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  opacity: 0.6;
}

.error-text {
  font-size: 14px;
  color: #ff4d4f;
  margin-bottom: 8px;
  max-width: 280px;
  line-height: 1.5;
}

.retry-button {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

.retry-button:active {
  transform: translateY(0);
}

/* 词云内容样式 */
.wordcloud-content {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background-color: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 词云画布包装器 */
.wordcloud-canvas-wrapper {
  flex: 1;
  flex-shrink: 0;
  height: 600px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

/* 操作按钮组样式 */
.wordcloud-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0;
  z-index: 100;
}

.action-button {
  width: 150px;
  height: 40px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4f4d56;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #fff;
  min-width: 100px;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 20px;
  height: 20px;
  font-size: 14px;
  line-height: 1;
}

.action-text {
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #fefefe;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wordcloud-container {
    min-height: 300px;
    border-radius: 8px;
  }

  .loading-container,
  .error-container,
  .empty-container {
    padding: 30px 16px;
  }

  .error-text {
    font-size: 13px;
  }

  .retry-button {
    padding: 10px 24px;
    font-size: 14px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-text {
    font-size: 14px;
  }

  /* 移动端操作按钮样式调整 */
  .wordcloud-actions {
    top: 8px;
    right: 8px;
    padding: 6px;
    gap: 6px;
    border-radius: 6px;
  }

  .action-button {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 60px;
    gap: 4px;
  }

  .action-icon {
    font-size: 12px;
  }

  .action-text {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .wordcloud-container {
    min-height: 250px;
  }

  .wordcloud-content {
    min-height: 200px;
  }
}

/* 词云组件内词项的自定义样式增强 */
.wordcloud-container :deep(.word-cloud-word-item-wrap) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.wordcloud-container :deep(.word-cloud-word-item-wrap:hover) {
  transform: scale(1.1);
  z-index: 10;
}

.wordcloud-container :deep(.word-cloud-word-item-inner) {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  font-weight: 600;
}
</style>
