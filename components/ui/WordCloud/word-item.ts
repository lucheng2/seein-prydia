import { type FontStyle, getColor, getTextImageData, type ImageData } from './utils'

// 词项配置接口
export interface WordItemConfig {
  text: string
  weight: number
  fontStyle: FontStyle
  color?: string
  space?: number
  rotate?: number
  colorList?: string[]
}

// 文本类
export class WordItem {
  // 文本
  text: string
  // 权重
  weight: number
  // 字体样式
  fontStyle: FontStyle
  // 文本颜色
  color: string
  // 间距
  space: number
  // 旋转角度
  rotate: number
  // 文本像素数据
  imageData: ImageData
  // 文本包围框的宽高
  width: number
  height: number
  // 文本渲染的位置
  left: number
  top: number

  constructor({ text, weight, fontStyle, color, space = 0, rotate = 0, colorList }: WordItemConfig) {
    // 文本
    this.text = text
    // 权重
    this.weight = weight
    // 字体样式
    this.fontStyle = fontStyle
    // 文本颜色
    this.color = color || getColor(colorList)
    // 间距
    this.space = space
    // 旋转角度
    this.rotate = rotate
    // 文本像素数据
    this.imageData = getTextImageData({
      text,
      fontStyle,
      space: this.space,
      rotate: this.rotate,
    })
    // 文本包围框的宽高
    this.width = this.imageData.width
    this.height = this.imageData.height
    // 文本渲染的位置
    this.left = 0
    this.top = 0
  }
}

export default WordItem
