// 字体样式接口
export interface FontStyle {
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
}

// 文本边界矩形接口
export interface BoundingRect {
  width: number
  height: number
  lineWidth?: number
}

// 测量文本结果接口
export interface TextMeasurement {
  width: number
  height: number
}

// 图像数据接口
export interface ImageData {
  data: [number, number][]
  width: number
  height: number
}

// 默认颜色列表
const defaultColorList = [
  '#E40303', // 彩虹红
  '#FF8C00', // 彩虹橙
  '#008018', // 彩虹绿
  '#004CFF', // 彩虹蓝
  '#732982', // 彩虹紫
  '#D60270', // 双性恋粉
  '#078D70', // 男同绿
  '#5BCEFA', // 跨性别蓝
  '#FF218C', // 泛性恋粉
  '#A20160', // 女同紫红
]

// 获取随机颜色
export const getColor = (list: string[] = defaultColorList): string => {
  return list[Math.floor(Math.random() * list.length)]
}

// 拼接font字符串
export const joinFontStr = ({
  fontSize,
  fontFamily,
  fontWeight,
  fontStyle,
}: FontStyle): string => {
  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
}

// 计算文本宽高
let measureTextContext: CanvasRenderingContext2D | null = null

export const measureText = (text: string, fontStyle: FontStyle): TextMeasurement => {
  // 创建一个canvas用于测量
  if (!measureTextContext) {
    const canvas = document.createElement('canvas')
    measureTextContext = canvas.getContext('2d')!
  }
  measureTextContext.save()
  // 设置文本样式
  measureTextContext.font = joinFontStr(fontStyle)
  // 测量文本
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent }
    = measureTextContext.measureText(text)
  measureTextContext.restore()
  // 返回文本宽高
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent
  return { width, height }
}

// 获取文本的外包围框大小
export const getTextBoundingRect = ({
  text,
  fontStyle,
  space = 0,
  rotate = 0,
}: {
  text: string
  fontStyle: FontStyle
  space?: number
  rotate?: number
}): BoundingRect => {
  const lineWidth = space * fontStyle.fontSize * 2
  // 获取文本的宽高，并向上取整
  const { width, height } = measureText(text, fontStyle)
  const rect = getRotateBoundingRect(
    width + lineWidth,
    height + lineWidth,
    rotate,
  )
  return {
    ...rect,
    lineWidth,
  }
}

// 获取文字的像素点数据
export const getTextImageData = ({
  text,
  fontStyle,
  space = 0,
  rotate = 0,
}: {
  text: string
  fontStyle: FontStyle
  space?: number
  rotate?: number
}): ImageData => {
  const canvas = document.createElement('canvas')
  const { lineWidth, width, height } = getTextBoundingRect({
    text,
    fontStyle,
    space,
    rotate,
  })
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  // 绘制文本
  ctx.translate(width / 2, height / 2)
  ctx.rotate(degToRad(rotate))
  ctx.font = joinFontStr(fontStyle)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  if (lineWidth && lineWidth > 0) {
    ctx.lineWidth = lineWidth
    ctx.strokeText(text, 0, 0)
  }
  // 获取画布的像素数据
  const image = ctx.getImageData(0, 0, width, height).data
  // 遍历每个像素点，找出有内容的像素点
  const imageData: [number, number][] = []
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // 如果a通道不为0，那么代表该像素点存在内容
      const a = image[x * 4 + y * (width * 4) + 3]
      if (a > 0) {
        imageData.push([x, y])
      }
    }
  }
  return {
    data: imageData,
    width,
    height,
  }
}

// 根据权重计算字号
export const getFontSize = (
  weight: number,
  minWeight: number,
  maxWeight: number,
  minFontSize: number,
  maxFontSize: number,
): number => {
  return (
    minFontSize
    + ((weight - minWeight) / (maxWeight - minWeight))
    * (maxFontSize - minFontSize)
  )
}

// 计算旋转后的矩形的宽高
export const getRotateBoundingRect = (
  width: number,
  height: number,
  rotate: number = 0,
): { width: number, height: number } => {
  const rad = degToRad(rotate)
  const w = width * Math.abs(Math.cos(rad)) + height * Math.abs(Math.sin(rad))
  const h = width * Math.abs(Math.sin(rad)) + height * Math.abs(Math.cos(rad))
  return {
    width: Math.ceil(w),
    height: Math.ceil(h),
  }
}

// 角度转弧度
export const degToRad = (deg: number): number => {
  return (deg * Math.PI) / 180
}

// 返回一个随机整数
export const createRandom = (min: number, max: number): number => {
  return min + Math.floor(Math.random() * (max - min))
}

// 下载文件
export const downloadFile = (file: string, fileName: string): void => {
  const a = document.createElement('a')
  a.href = file
  a.download = fileName
  a.click()
}
