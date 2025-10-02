<template>
    <div class="word-cloud-container" :style="containerStyle">
        <svg ref="svgRef" />
    </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import cloud from 'd3-cloud' // 需要安装: npm install d3-cloud
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
    // 词语数据
    words: {
        type: Array,
        required: true,
        // 格式: [{ text: 'word', weight: 10 }, ...]
    },

    // 尺寸设置
    width: {
        type: Number,
        default: 800,
    },
    height: {
        type: Number,
        default: 600,
    },

    // 字体设置
    fontFamily: {
        type: [String, Function],
        default: 'Inter, system-ui, Avenir, --apple-system, "Segoe UI", Rototo, Helvetica, Arial, sans-serif',
    },
    fontStyle: {
        type: [String, Function],
        default: 'normal',
    },
    fontWeight: {
        type: [String, Function],
        default: 'normal',
    },

    // 字体大小设置
    fontSize: {
        type: Function,
        default: (d) => Math.sqrt(d.value) * 8,
    },
    fontSizeMin: {
        type: Number,
        default: 12,
    },
    fontSizeMax: {
        type: Number,
        default: 100,
    },

    // 旋转设置
    rotate: {
        type: Function,
        default: () => (~~(Math.random() * 6) - 3) * 30,
    },

    // 文本访问器
    text: {
        type: Function,
        default: (d) => d.text,
    },

    // 布局设置
    padding: {
        type: [Number, Function],
        default: 5,
    },
    spiral: {
        type: String,
        default: 'archimedean', // 'archimedean' 或 'rectangular'
        validator: (value) => ['archimedean', 'rectangular'].includes(value),
    },

    // 颜色设置
    colors: {
        type: [Array, Function],
        default: null,
    },
    colorScheme: {
        type: String,
        default: 'schemeCategory10',
        // d3.schemeCategory10, d3.schemeTableau10, d3.schemePastel1 等
    },

    // 动画设置
    animation: {
        type: Boolean,
        default: true,
    },
    animationDuration: {
        type: Number,
        default: 800,
    },
    animationDelay: {
        type: Function,
        default: (d, i) => i * 50,
    },

    // 交互设置
    enableHover: {
        type: Boolean,
        default: true,
    },
    hoverOpacity: {
        type: Number,
        default: 0.7,
    },
    enableClick: {
        type: Boolean,
        default: true,
    },

    // 随机数生成器
    random: {
        type: Function,
        default: Math.random,
    },

    // 时间间隔设置
    timeInterval: {
        type: Number,
        default: Infinity,
    },

    // 背景设置
    backgroundColor: {
        type: String,
        default: 'transparent',
    },

    // 响应式设置
    responsive: {
        type: Boolean,
        default: false,
    },

    // 文本对齐
    textAnchor: {
        type: String,
        default: 'middle',
        validator: (value) => ['start', 'middle', 'end'].includes(value),
    },
})

const emit = defineEmits([
    'wordClick',      // 点击词语
    'wordHover',      // 悬停词语
    'wordLeave',      // 离开词语
    'complete',       // 布局完成
    'wordPlaced',     // 单个词语放置完成
    'error',           // 错误
])

const svgRef = ref(null)
const containerStyle = computed(() => ({
    backgroundColor: props.backgroundColor,
    width: props.responsive ? '100%' : `${props.width}px`,
    height: props.responsive ? '100%' : `${props.height}px`,
}))

// 获取颜色比例尺
const getColorScale = () => {
    if (typeof props.colors === 'function') {
        return props.colors
    }

    if (Array.isArray(props.colors)) {
        return d3.scaleOrdinal(props.colors)
    }

    // 使用预定义的配色方案
    const scheme = d3[props.colorScheme] || d3.schemeCategory10
    return d3.scaleOrdinal(scheme)
}

// 规范化字体大小
const normalizeFontSize = (size) => {
    return Math.max(props.fontSizeMin, Math.min(props.fontSizeMax, size))
}

// 获取字体属性
const getFontProperty = (prop, d) => {
    return typeof prop === 'function' ? prop(d) : prop
}

const list = computed(() => {
    const result = (props.words || []).map((item: any) => {
        return {
            ...item,
            value: item.weight
        }
    })
    return result
})

// 生成词云
const generateWordCloud = () => {
    if (!svgRef.value) return

    try {
        const svg = d3.select(svgRef.value)
        svg.selectAll('*').remove()

        const actualWidth = props.responsive
            ? svgRef.value.clientWidth || props.width
            : props.width
        const actualHeight = props.responsive
            ? svgRef.value.clientHeight || props.height
            : props.height

        const g = svg
            .attr('width', actualWidth)
            .attr('height', actualHeight)
            .append('g')
            .attr('transform', `translate(${actualWidth / 2},${actualHeight / 2})`)

        // 创建布局
        const layout = cloud()
            .size([actualWidth, actualHeight])
            .words(list.value)
            .padding(props.padding)
            .rotate(props.rotate)
            .font(d => getFontProperty(props.fontFamily, d))
            .fontStyle(d => getFontProperty(props.fontStyle, d))
            .fontWeight(d => getFontProperty(props.fontWeight, d))
            .fontSize(d => normalizeFontSize(props.fontSize(d)))
            .text(props.text)
            .spiral(props.spiral)
            .random(props.random)
            .timeInterval(props.timeInterval)
            .on('word', (word) => {
                emit('wordPlaced', word)
            })
            .on('end', draw)

        layout.start()

        function draw(words) {
            const colorScale = getColorScale()

            const text = g.selectAll('text')
                .data(words)
                .enter()
                .append('text')
                .style('font-size', d => `${d.size}px`)
                .style('font-family', d => d.font || getFontProperty(props.fontFamily, d))
                .style('font-style', d => getFontProperty(props.fontStyle, d))
                .style('font-weight', d => getFontProperty(props.fontWeight, d))
                .style('fill', (d, i) => colorScale(i))
                .style('cursor', props.enableClick ? 'pointer' : 'default')
                .attr('text-anchor', props.textAnchor)
                .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text)

            // 添加动画
            if (props.animation) {
                text
                    .style('opacity', 0)
                    .transition()
                    .duration(props.animationDuration)
                    .delay(props.animationDelay)
                    .style('opacity', 1)
            }

            // 添加交互效果
            if (props.enableHover) {
                text
                    .on('mouseenter', function (event, d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .style('opacity', props.hoverOpacity)
                            .style('font-size', `${d.size * 1.1}px`)
                        emit('wordHover', d, event)
                    })
                    .on('mouseleave', function (event, d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .style('opacity', 1)
                            .style('font-size', `${d.size}px`)
                        emit('wordLeave', d, event)
                    })
            }

            if (props.enableClick) {
                text.on('click', (event, d) => {
                    emit('wordClick', d, event)
                })
            }

            // 计算边界
            const bounds = [
                { x0: d3.min(words, d => d.x), y0: d3.min(words, d => d.y) },
                { x1: d3.max(words, d => d.x), y1: d3.max(words, d => d.y) },
            ]

            emit('complete', words, bounds)
        }
    } catch (error) {
        console.error('Word cloud generation error:', error)
        emit('error', error)
    }
}

// 响应式处理
let resizeObserver = null

onMounted(() => {
    generateWordCloud()

    if (props.responsive && svgRef.value) {
        resizeObserver = new ResizeObserver(() => {
            generateWordCloud()
        })
        resizeObserver.observe(svgRef.value)
    }
})

// 监听数据变化
watch(() => props.words, () => {
    generateWordCloud()
}, { deep: true })

// 监听其他配置变化
watch(
    () => [
        props.width,
        props.height,
        props.fontFamily,
        props.fontSize,
        props.rotate,
        props.padding,
        props.spiral,
        props.colors,
        props.colorScheme,
    ],
    () => {
        generateWordCloud()
    },
    { deep: true }
)

// 获取词云图片数据URL（将 SVG 渲染到 Canvas 后转为 PNG）
const getWordCloudImageDataURL = async (): Promise<string> => {
    if (!svgRef.value) throw new Error('SVG is not ready')

    const svgEl = svgRef.value as unknown as SVGSVGElement
    const width = Number(svgEl.getAttribute('width') || props.width)
    const height = Number(svgEl.getAttribute('height') || props.height)

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgEl)
    const svgBlob = new Blob([
        `<?xml version="1.0" standalone="no"?>\n` + svgString,
    ], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = (e) => reject(e)
            img.src = url
        })

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context is unavailable')

        if (props.backgroundColor && props.backgroundColor !== 'transparent') {
            ctx.fillStyle = props.backgroundColor
            ctx.fillRect(0, 0, width, height)
        }

        ctx.drawImage(image, 0, 0, width, height)
        return canvas.toDataURL('image/png')
    } finally {
        URL.revokeObjectURL(url)
    }
}


// 复制图片到剪贴板
const copyImage = async (): Promise<boolean> => {
    try {
        const dataURL = await getWordCloudImageDataURL()

        // 将DataURL转换为Blob
        const response = await fetch(dataURL)
        const blob = await response.blob()

        // 复制到剪贴板（特性检测）
        const ClipboardItemCtor = (window as any).ClipboardItem
        if (navigator.clipboard && (navigator.clipboard as any).write && ClipboardItemCtor) {
            await (navigator.clipboard as any).write([
                new ClipboardItemCtor({ 'image/png': blob }),
            ])
        } else {
            throw new Error('当前环境不支持剪贴板图片写入')
        }

        console.log('Word cloud image copied to clipboard')
        return true
    }
    catch (error: any) {
        console.error('Failed to copy image:', error)

        // 如果剪贴板API失败，尝试创建链接下载作为降级方案
        try {
            const dataURL = await getWordCloudImageDataURL()
            const link = document.createElement('a')
            link.href = dataURL
            link.download = `wordcloud-${new Date().getTime()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            console.log('Copy failed, switched to download fallback')
            return false
        }
        catch (downloadError) {
            console.error('Download fallback also failed:', downloadError)
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
        const defaultFilename = `WordCloud-Analysis-${timestamp}.png`

        link.href = dataURL
        link.download = filename || defaultFilename

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log('Word cloud image downloaded successfully')
        return true
    }
    catch (error: any) {
        console.error('Failed to download image:', error)
        throw error
    }
}


// 暴露方法
defineExpose({
    regenerate: generateWordCloud,
    copyImage,
    downloadImage,
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
})
</script>

<style scoped>
.word-cloud-container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.word-cloud-container svg {
    display: block;
}
</style>
