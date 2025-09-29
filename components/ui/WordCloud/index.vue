<template>
    <div class="component-word-cloud">
        <canvas class="canvas-word-cloud" ref="canvasRef"></canvas>
    </div>
</template>

<script setup lang="ts">
import WordCloud from 'wordcloud'

interface WordCloudItem {
    /** 词语文本 */
    text: string;
    /** 词语权重值，决定显示大小 */
    weight: number;
    /** 额外数据，可在回调函数中使用 */
    extraData?: any[];
}

interface Props {
    /** 词云数据列表 - 必需属性 */
    list: WordCloudItem[]
}

const props = defineProps<Props>()

// 简化事件定义 - 只保留最重要的
const emits = defineEmits<{
    ready: []
}>()

const canvasRef = ref<HTMLCanvasElement>()
const wordCloudInstance = ref<any>()

const wordCloudList = computed(() => {
    // 按权重从大到小排序，确保最大的单词优先放置在中间
    const sortedList = [...props.list].sort((a, b) => b.weight - a.weight)

    return sortedList.map(item => [item.text, item.weight])
})

// 设置高分辨率支持
const setupHighDPI = (canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // 获取父容器的实际大小
    const computedStyle = window.getComputedStyle(canvas.parentElement || canvas)
    const width = parseInt(computedStyle.width) || rect.width
    const height = parseInt(computedStyle.height) || rect.height

    // 设置实际画布大小（考虑设备像素比）
    canvas.width = width * dpr
    canvas.height = height * dpr

    // 设置CSS样式大小
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    // 缩放画布以匹配设备像素比
    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.scale(dpr, dpr)

        // 设置文本渲染优化
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.imageSmoothingEnabled = true
        if (ctx.imageSmoothingQuality) {
            ctx.imageSmoothingQuality = 'high'
        }
    }
}

const drawWordCloud = () => {
    if (!canvasRef.value) return

    try {
        // 停止之前的渲染
        if (WordCloud.stop) {
            WordCloud.stop()
        }

        // 设置高分辨率支持
        setupHighDPI(canvasRef.value)

        wordCloudInstance.value = WordCloud(canvasRef.value, {
            list: wordCloudList.value,
            gridSize: 18,
            weightFactor: 3,
            // weightFactor: function (size) {
            //     return Math.pow(size, 2.3) * canvasRef.value.width / 1024;
            // },
            color: 'random-light',
            backgroundColor: '#312F36',
            // 禁止旋转
            rotationSteps: 0
        })

        // 触发准备就绪事件
        nextTick(() => {
            emits('ready')
        })
    } catch (error) {
        console.error('WordCloud rendering error:', error)
    }
}

// 停止渲染的方法
const stopWordCloud = () => {
    if (WordCloud.stop) {
        WordCloud.stop()
    }
}

watch(() => props.list, () => {
    nextTick(() => {
        drawWordCloud()
    })
}, {
    deep: true
})

// 窗口大小变化处理
const handleResize = () => {
    nextTick(() => {
        drawWordCloud()
    })
}

onMounted(() => {
    nextTick(() => {
        drawWordCloud()

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize)
    })
})

onBeforeUnmount(() => {
    stopWordCloud()
    window.removeEventListener('resize', handleResize)
})

// 获取词云图片数据URL
const getWordCloudImageDataURL = async (): Promise<string> => {
    return canvasRef.value.toDataURL('image/png')
}

// 复制图片到剪贴板
const copyImage = async (): Promise<boolean> => {
    try {
        const dataURL = await getWordCloudImageDataURL()

        // 将DataURL转换为Blob
        const response = await fetch(dataURL)
        const blob = await response.blob()

        // 复制到剪贴板
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ])

        console.log('词云图片已复制到剪贴板')
        return true

    } catch (error: any) {
        console.error('复制图片失败:', error)

        // 如果剪贴板API失败，尝试创建链接下载作为降级方案
        try {
            const dataURL = await getWordCloudImageDataURL()
            const link = document.createElement('a')
            link.href = dataURL
            link.download = `词云-${new Date().getTime()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            console.log('复制失败，已转为下载方式')
            return false
        } catch (downloadError) {
            console.error('下载也失败了:', downloadError)
            throw error
        }
    }
}

// 下载图片
const downloadImage = async (filename?: string): Promise<boolean> => {
    try {
        const dataURL = await getWordCloudImageDataURL()

        // 创建下载链接
        const link = document.createElement('a')
        const timestamp = new Date().toISOString().split('T')[0]
        const defaultFilename = `词云分析-${timestamp}.png`

        link.href = dataURL
        link.download = filename || defaultFilename

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log('词云图片下载成功')
        return true

    } catch (error: any) {
        console.error('下载图片失败:', error)
        throw error
    }
}

// 暴露方法给父组件
defineExpose({
    drawWordCloud,
    stopWordCloud,
    copyImage,
    downloadImage
})
</script>

<style scoped>
.component-word-cloud {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.canvas-word-cloud {
    width: 100%;
    height: 100%;
    display: block;
    /* 确保画布不会被压缩 */
    max-width: 100%;
    max-height: 100%;
    /* 优化渲染性能 */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}
</style>