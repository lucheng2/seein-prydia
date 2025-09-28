<script setup lang="ts">
import { computed, type CSSProperties, nextTick, onMounted, ref, watch } from 'vue'
import { addToMap, clear as clearCompute, getBoundingRect, getPosition } from './compute'
import {
  createRandom,
  downloadFile,
  getFontSize,
  getTextBoundingRect,
  joinFontStr,
} from './utils'
import { WordItem } from './word-item'

// 词云数据类型
export type WordData = [string, number, Record<string, any>?]

// 旋转类型
export type RotateType = 'none' | 'cross' | 'oblique' | 'random'

// 词云配置选项
export interface WordCloudOptions {
  minFontSize?: number
  maxFontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  fontSizeScale?: number
  rotateType?: RotateType
  space?: number
  colorList?: string[]
  transition?: string
  smallWeightInCenter?: boolean
  useCanvas?: boolean
  onClick?: (item: WordItem) => void
}

// Props
interface Props {
  words?: WordData[]
  options?: WordCloudOptions
}

const props = withDefaults(defineProps<Props>(), {
  words: () => [],
  options: () => ({}),
})

const emit = defineEmits<Emits>()

// Emits
interface Emits {
  (e: 'click', item: WordItem): void
  (e: 'ready', list: WordItem[]): void
}

// 容器引用
const containerRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()

// 容器大小
const elWidth = ref(1000)
const elHeight = ref(1000)

// 渲染状态
const curRenderList = ref<WordItem[]>([])
const renderCtx = ref<CanvasRenderingContext2D | null>(null)

// 配置选项
const config = computed(() => ({
  minFontSize: 12,
  maxFontSize: 40,
  fontFamily: '微软雅黑, Microsoft YaHei',
  fontWeight: '',
  fontStyle: '',
  space: 0,
  colorList: undefined,
  rotateType: 'none' as RotateType,
  fontSizeScale: 1 / 12,
  transition: 'all 0.5s ease',
  smallWeightInCenter: false,
  useCanvas: false,
  onClick: undefined,
  ...props.options,
}))

// 是否使用Canvas渲染
const useCanvas = computed(() => config.value.useCanvas)

// 容器样式
const containerStyle = computed((): CSSProperties => ({
  position: 'relative' as const,
  width: '100%',
  height: '100%',
}))

// 更新容器大小
const updateElSize = () => {
  if (!containerRef.value) return
  const elRect = containerRef.value.getBoundingClientRect()
  elWidth.value = elRect.width
  elHeight.value = elRect.height
}

// 当容器大小改变了需要调用该方法
const resize = () => {
  updateElSize()
}

// 创建旋转角度
const createRotate = (): number => {
  switch (config.value.rotateType) {
    case 'cross':
      return Math.random() > 0.5 ? -90 : 0
    case 'oblique':
      return -45
    case 'random':
      return createRandom(-90, 90)
    default:
      return 0
  }
}

// 计算词云位置
const run = (words: WordData[] = []): Promise<WordItem[]> => {
  return new Promise((resolve) => {
    clearCompute()
    // 按权重从大到小排序
    const wordList = [...words].sort((a, b) => {
      return config.value.smallWeightInCenter ? a[1] - b[1] : b[1] - a[1]
    })

    if (wordList.length === 0) {
      resolve([])
      return
    }

    let minWeight = wordList[wordList.length - 1][1]
    let maxWeight = wordList[0][1]
    if (config.value.smallWeightInCenter) {
      const tmp = minWeight
      minWeight = maxWeight
      maxWeight = tmp
    }

    // 创建词云文本实例
    const wordItemList = wordList.map((item) => {
      const text = item[0]
      const weight = item[1]
      const itemConfig = item[2] || {}

      // 旋转角度
      let rotate = 0
      if (!Number.isNaN(Number(itemConfig.rotate))) {
        rotate = Number(itemConfig.rotate)
      }
      else {
        rotate = createRotate()
      }

      return new WordItem({
        text,
        weight,
        space: itemConfig.space ?? config.value.space,
        rotate,
        color: itemConfig.color,
        colorList: config.value.colorList,
        fontStyle: {
          fontSize:
            getFontSize(
              weight,
              minWeight,
              maxWeight,
              config.value.minFontSize,
              config.value.maxFontSize,
            ) * config.value.fontSizeScale,
          fontFamily: itemConfig?.fontFamily || config.value.fontFamily,
          fontWeight: itemConfig?.fontWeight || config.value.fontWeight,
          fontStyle: itemConfig?.fontStyle || config.value.fontStyle,
        },
      })
    })

    computePositions(wordItemList)
    fitContainer(wordItemList)
    resolve(wordItemList)
  })
}

// 计算文本的位置
const computePositions = (wordItemList: WordItem[]) => {
  for (let i = 0; i < wordItemList.length; i++) {
    const curWordItem = wordItemList[i]
    // 将第一个文本的像素数据保存到map中
    if (i === 0) {
      addToMap(curWordItem)
      continue
    }
    // 依次计算后续的每个文本的显示位置
    const res = getPosition({
      curWordItem,
      elWidth: elWidth.value,
      elHeight: elHeight.value,
    })
    curWordItem.left = res[0]
    curWordItem.top = res[1]
    // 计算出位置后的每个文本也需要将像素数据保存到map中
    addToMap(curWordItem)
  }
}

// 根据容器大小调整字号
const fitContainer = (wordItemList: WordItem[]) => {
  const elRatio = elWidth.value / elHeight.value
  let { width, height, left, top } = getBoundingRect()
  const wordCloudRatio = width / height
  let w: number
  let h: number
  let offsetX = 0
  let offsetY = 0

  if (elRatio > wordCloudRatio) {
    // 词云高度以容器高度为准，宽度根据原比例进行缩放
    h = elHeight.value
    w = wordCloudRatio * elHeight.value
  }
  else {
    // 词云宽度以容器宽度为准，高度根据原比例进行缩放
    w = elWidth.value
    h = elWidth.value / wordCloudRatio
  }

  const scale = w / width
  // 将词云移动到容器中间
  left *= scale
  top *= scale

  if (elRatio > wordCloudRatio) {
    offsetY = -top
    offsetX = -left + (elWidth.value - w) / 2
  }
  else {
    offsetX = -left
    offsetY = -top + (elHeight.value - h) / 2
  }

  wordItemList.forEach((item) => {
    item.left *= scale
    item.top *= scale
    item.left += offsetX
    item.top += offsetY
    item.fontStyle.fontSize *= scale

    // 重新计算文本包围框大小而不是直接缩放，因为文本包围框大小和字号并不成正比
    const { width, height } = getTextBoundingRect({
      text: item.text,
      fontStyle: item.fontStyle,
      space: item.space,
      rotate: item.rotate,
    })
    item.width = width
    item.height = height

    // 修正超出容器文本
    if (item.left + item.width > elWidth.value) {
      item.left = elWidth.value - item.width
    }
    if (item.top + item.height > elHeight.value) {
      item.top = elHeight.value - item.height
    }
  })
}

// Canvas渲染
const renderUseCanvas = async (words: WordData[]) => {
  if (!canvasRef.value) return

  if (!renderCtx.value) {
    renderCtx.value = canvasRef.value.getContext('2d')!
  }

  renderCtx.value.clearRect(0, 0, elWidth.value, elHeight.value)

  const list = await run(words)
  curRenderList.value = list

  list.forEach((item) => {
    renderCtx.value!.save()
    renderCtx.value!.font = joinFontStr(item.fontStyle)
    renderCtx.value!.fillStyle = item.color

    if (item.rotate === 0) {
      renderCtx.value!.textBaseline = 'top'
      renderCtx.value!.fillText(item.text, item.left, item.top)
    }
    else {
      const cx = item.left + item.width / 2
      const cy = item.top + item.height / 2
      renderCtx.value!.translate(cx, cy)
      renderCtx.value!.textAlign = 'center'
      renderCtx.value!.textBaseline = 'middle'
      renderCtx.value!.rotate((item.rotate * Math.PI) / 180)
      renderCtx.value!.fillText(item.text, 0, 0)
    }
    renderCtx.value!.restore()
  })

  emit('ready', list)
}

// DOM渲染
const renderUseDOM = async (words: WordData[]) => {
  const list = await run(words)
  curRenderList.value = list
  emit('ready', list)
}

// Canvas点击事件
const onCanvasClick = (e: MouseEvent) => {
  if (!canvasRef.value || !renderCtx.value) return

  const { left, top } = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - left
  const y = e.clientY - top
  let res: WordItem | null = null

  for (let i = 0; i < curRenderList.value.length; i++) {
    const item = curRenderList.value[i]
    renderCtx.value.save()
    renderCtx.value.font = joinFontStr(item.fontStyle)
    renderCtx.value.fillStyle = item.color
    renderCtx.value.textBaseline = 'top'
    renderCtx.value.beginPath()

    if (item.rotate === 0) {
      renderCtx.value.rect(item.left, item.top, item.width, item.height)
    }
    else {
      const textSize = getTextBoundingRect({
        text: item.text,
        fontStyle: item.fontStyle,
        space: item.space,
      })
      const cx = item.left + item.width / 2
      const cy = item.top + item.height / 2
      renderCtx.value.translate(cx, cy)
      renderCtx.value.rotate((item.rotate * Math.PI) / 180)
      renderCtx.value.rect(
        -textSize.width / 2,
        -textSize.height / 2,
        textSize.width,
        textSize.height,
      )
    }

    renderCtx.value.closePath()
    renderCtx.value.restore()

    const isIn = renderCtx.value.isPointInPath(x, y)
    if (isIn) {
      res = item
      break
    }
  }

  if (res) {
    onWordClick(res)
  }
}

// 词项点击事件
const onWordClick = (item: WordItem) => {
  emit('click', item)
  if (config.value.onClick) {
    config.value.onClick(item)
  }
}

// 获取词项包装样式
const getWordItemWrapStyle = (item: WordItem): CSSProperties => ({
  position: 'absolute' as const,
  display: 'flex' as const,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  left: `${item.left}px`,
  top: `${item.top}px`,
  width: `${item.width}px`,
  height: `${item.height}px`,
  transition: config.value.transition,
  cursor: 'pointer',
})

// 获取词项内部样式
const getWordItemInnerStyle = (item: WordItem): CSSProperties => ({
  whiteSpace: 'nowrap' as const,
  fontSize: `${item.fontStyle.fontSize}px`,
  fontFamily: item.fontStyle.fontFamily,
  fontWeight: item.fontStyle.fontWeight,
  color: item.color,
  transform: `rotate(${item.rotate}deg)`,
  fontStyle: item.fontStyle.fontStyle,
})

// 导出画布
const exportCanvas = (isDownload = true, fileName = 'wordCloud') => {
  if (!canvasRef.value) return null

  const res = canvasRef.value.toDataURL()
  if (isDownload) {
    downloadFile(res, fileName)
  }
  else {
    return res
  }
}

// 清除渲染
const clearRender = () => {
  curRenderList.value = []
  if (renderCtx.value) {
    renderCtx.value.clearRect(0, 0, elWidth.value, elHeight.value)
  }
}

// 渲染方法
const render = async () => {
  if (elWidth.value <= 0 || elHeight.value <= 0) return

  if (useCanvas.value) {
    await renderUseCanvas(props.words)
  }
  else {
    await renderUseDOM(props.words)
  }
}

// 组件挂载
onMounted(() => {
  if (containerRef.value) {
    updateElSize()
    if (elWidth.value <= 0 || elHeight.value <= 0) {
      throw new Error('容器宽高不能为0')
    }

    // 设置容器position为relative
    const elPosition = window.getComputedStyle(containerRef.value).position
    if (elPosition === 'static') {
      containerRef.value.style.position = 'relative'
    }

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      updateElSize()
      nextTick(() => {
        render()
      })
    })

    // 开始监听大小变化
    resizeObserver.observe(containerRef.value)

    // 初始渲染
    render()
  }
})

// 监听词云数据变化
watch(() => props.words, () => {
  render()
}, { deep: true })

// 监听配置变化
watch(() => props.options, () => {
  render()
}, { deep: true })

// 使用原生Canvas创建词云图片
const createWordCloudCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // 设置canvas尺寸，高分辨率
  const scale = 2
  canvas.width = elWidth.value * scale
  canvas.height = elHeight.value * scale
  canvas.style.width = `${elWidth.value}px`
  canvas.style.height = `${elHeight.value}px`

  // 缩放上下文以获得更清晰的图像
  ctx.scale(scale, scale)

  // 设置背景（可选，透明背景）
  ctx.clearRect(0, 0, elWidth.value, elHeight.value)

  // 渲染每个词项
  curRenderList.value.forEach((item) => {
    ctx.save()
    ctx.font = joinFontStr(item.fontStyle)
    ctx.fillStyle = item.color

    if (item.rotate === 0) {
      ctx.textBaseline = 'top'
      ctx.fillText(item.text, item.left, item.top)
    } else {
      const cx = item.left + item.width / 2
      const cy = item.top + item.height / 2
      ctx.translate(cx, cy)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.rotate((item.rotate * Math.PI) / 180)
      ctx.fillText(item.text, 0, 0)
    }
    ctx.restore()
  })

  return canvas
}

// 获取词云图片数据URL
const getWordCloudImageDataURL = async (): Promise<string> => {
  if (!containerRef.value) {
    throw new Error('词云组件尚未准备好')
  }

  if (curRenderList.value.length === 0) {
    throw new Error('词云数据为空，无法导出图片')
  }

  // 无论是Canvas模式还是DOM模式，都使用原生Canvas重新绘制
  // 这样可以确保高质量和一致性
  if (useCanvas.value && canvasRef.value) {
    // Canvas模式：直接使用现有canvas
    return canvasRef.value.toDataURL('image/png')
  } else {
    // DOM模式：使用原生Canvas重新绘制
    const canvas = createWordCloudCanvas()
    return canvas.toDataURL('image/png')
  }
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

// 暴露方法
defineExpose({
  resize,
  render,
  exportCanvas,
  clearRender,
  copyImage,
  downloadImage,
  getWordCloudImageDataURL,
})
</script>

<template>
  <div ref="containerRef" class="word-cloud-container" :style="containerStyle">
    <canvas v-if="useCanvas" ref="canvasRef" :width="elWidth" :height="elHeight" @click="onCanvasClick" />
    <div v-for="(item, index) in curRenderList" v-else :key="`word-${index}`" class="word-cloud-word-item-wrap"
      :style="getWordItemWrapStyle(item)" @click="() => onWordClick(item)">
      <div class="word-cloud-word-item-inner" :style="getWordItemInnerStyle(item)">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.word-cloud-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.word-cloud-word-item-wrap {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.word-cloud-word-item-inner {
  white-space: nowrap;
}
</style>
