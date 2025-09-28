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
        <div v-else-if="wordData.length > 0" class="wordcloud-content">
            <!-- 操作按钮组 -->
            <div class="wordcloud-actions">
                <button
                    class="action-button copy-button"
                    @click="handleCopyImage"
                    :disabled="copying"
                    title="复制图片"
                >
                    <span class="action-icon">📋</span>
                    <span class="action-text">{{ copying ? '复制中...' : '复制' }}</span>
                </button>
                <button
                    class="action-button download-button"
                    @click="handleDownloadImage"
                    :disabled="downloading"
                    title="下载图片"
                >
                    <span class="action-icon">💾</span>
                    <span class="action-text">{{ downloading ? '下载中...' : '下载' }}</span>
                </button>
            </div>

            <UiWordCloud
                ref="wordCloudRef"
                :words="wordData"
                :options="cloudOptions"
                @click="onWordClick"
                @ready="onReady"
            />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
            <div class="empty-icon">📊</div>
            <div class="empty-text">暂无词云数据</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { WordCloudItem, WordCloudResponse } from '~/components/ui/WordCloud/types'
import { getWordCloudData } from '~/apis/server'
import type { WordData } from '~/components/ui/WordCloud/index.vue'

// 响应式状态
const loading = ref(false)
const error = ref('')
const copying = ref(false)
const downloading = ref(false)
const rawData = ref<WordCloudItem[]>([
    { text: 'Vue', weight: 100 },
    { text: 'TypeScript', weight: 80 },
    { text: '组件', weight: 70 },
    { text: '响应式', weight: 60 },
])

// 词云组件引用
const wordCloudRef = ref()

// 转换数据格式为词云组件需要的格式
const wordData = computed<WordData[]>(() => {
    return rawData.value.map(item => [item.text, item.weight])
})

// 词云配置选项
const cloudOptions = computed(() => ({
    minFontSize: 14,
    maxFontSize: 48,
    fontFamily: '微软雅黑, Microsoft YaHei, sans-serif',
    rotateType: 'cross' as const,
    useCanvas: false,
    space: 2,
    colorList: [
        '#1890ff',
        '#52c41a',
        '#fa541c',
        '#722ed1',
        '#13c2c2',
        '#eb2f96',
        '#f5222d',
        '#faad14'
    ],
    transition: 'all 0.3s ease',
}))

// 获取词云数据
const fetchWordCloudData = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await getWordCloudData()

        if (response.success && response.data) {
            rawData.value = response.data || [{text: 'Vue', weight: 100}]
        } else {
            error.value = response.message || '获取词云数据失败'
        }
    } catch (err: any) {
        error.value = err?.message || '网络请求失败，请稍后重试'
        console.error('获取词云数据失败:', err)
    } finally {
        loading.value = false
    }
}

// 词项点击事件
const onWordClick = (item: any) => {
    console.log('点击了词项:', item.text, '权重:', item.weight)
    // 这里可以添加更多交互逻辑，比如跳转到搜索结果页面
}

// 词云渲染完成事件
const onReady = (list: any[]) => {
    console.log('词云渲染完成，共', list.length, '个词项')
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
    // fetchWordCloudData()
})
</script>

<style scoped>
.wordcloud-container {
    width: 100%;
    height: 100%;
    width: 400px;
    height: 400px;
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
    position: relative;
}

/* 操作按钮组样式 */
.wordcloud-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.action-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #24292e;
    min-width: 80px;
    justify-content: center;
}

.action-button:hover:not(:disabled) {
    background: #f6f8fa;
    border-color: #d0d7de;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f6f8fa;
}

.copy-button:hover:not(:disabled) {
    border-color: #1890ff;
    color: #1890ff;
}

.download-button:hover:not(:disabled) {
    border-color: #52c41a;
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