<template>
    <div class="wordcloud-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <UiLoadingSpinner />
            <div class="loading-text">正在加载词云数据...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ error }}</div>
            <button class="retry-button" @click="fetchWordCloudData">
                重新加载
            </button>
        </div>

        <!-- 词云内容 -->
        <div v-else-if="rawData.length > 0" class="wordcloud-content">
            <div class="wordcloud-canvas-wrapper">
                <UiWordCloud
                    ref="wordCloudRef"
                    :list="rawData"
                />
            </div>

            <!-- 操作按钮组 -->
            <div class="wordcloud-actions">
                <button
                    class="action-button copy-button"
                    @click="handleCopyImage"
                    :disabled="copying"
                    title="复制图片"
                >
                    <span class="action-icon">📋</span>
                    <span class="action-text">{{ copying ? '复制中...' : 'copy' }}</span>
                </button>
                <button
                    class="action-button download-button"
                    @click="handleDownloadImage"
                    :disabled="downloading"
                    title="下载图片"
                >
                    <span class="action-icon">💾</span>
                    <span class="action-text">{{ downloading ? '下载中...' : 'save' }}</span>
                </button>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
            <div class="empty-icon">📊</div>
            <div class="empty-text">暂无词云数据</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { WordCloudItem } from '~/components/ui/WordCloud/types'
import { getWordCloudData } from '~/apis/server'

interface Props {
    recentDays: number
}

const props = withDefaults(defineProps<Props>(), {
    recentDays: 7
})

// 响应式状态
const loading = ref(false)
const error = ref('')
const copying = ref(false)
const downloading = ref(false)
const rawData = ref<WordCloudItem[]>([
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

// 获取词云数据
const fetchWordCloudData = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await getWordCloudData({
            recentDays: props.recentDays
        })

        console.log('res', response)

        rawData.value = response.wordItems || []
    } catch (err: any) {
        error.value = err?.message || '网络请求失败，请稍后重试'
        console.error('获取词云数据失败:', err)
    } finally {
        loading.value = false
    }
}

// 复制图片到剪贴板
const handleCopyImage = async () => {
    if (copying.value || !wordCloudRef.value) return

    copying.value = true
    try {
        const success = await wordCloudRef.value.copyImage()
        if (success) {
            // TODO: 可以添加toast提示
            console.log('复制成功')
        }
    } catch (error: any) {
        console.error('复制图片失败:', error)
        // TODO: 显示错误提示
    } finally {
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
            console.log('下载成功')
            // TODO: 可以添加成功提示
        }
    } catch (error: any) {
        console.error('下载图片失败:', error)
        // TODO: 显示错误提示
    } finally {
        downloading.value = false
    }
}

// 组件挂载时自动获取数据（适用于弹窗展开场景）
onMounted(() => {
    fetchWordCloudData()
})
</script>

<style scoped>
.wordcloud-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
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
    min-height: 300px;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* 词云画布包装器 */
.wordcloud-canvas-wrapper {
    flex: 1;
    width: 100%;
    background: #ffffff;
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
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #333;
    min-width: 100px;
    justify-content: center;
    backdrop-filter: blur(10px);
}

.action-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.7);
}

.copy-button:hover:not(:disabled) {
    border-color: rgba(24, 144, 255, 0.3);
    color: #1890ff;
}

.download-button:hover:not(:disabled) {
    border-color: rgba(82, 196, 26, 0.3);
    color: #52c41a;
}

.action-icon {
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
    gap: 16px;
    padding: 60px 20px;
    opacity: 0.8;
}

.empty-icon {
    font-size: 64px;
    opacity: 0.5;
}

.empty-text {
    font-size: 16px;
    color: #999;
    font-weight: 500;
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