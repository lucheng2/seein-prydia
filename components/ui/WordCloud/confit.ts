// LGBT词云项目 - 颜色配置文件
// 包含多种LGBT主题色彩方案，适用于词云可视化

// 经典LGBT彩虹旗颜色 (Pride Flag Colors)
export const prideColors: string[] = [
    '#E40303', // 红色 - 生命
    '#FF8C00', // 橙色 - 治愈
    '#FFED00', // 黄色 - 阳光
    '#008018', // 绿色 - 自然
    '#004CFF', // 蓝色 - 和谐
    '#732982', // 紫色 - 精神
]

// 进步彩虹旗颜色 (Progress Pride Flag)
export const progressPrideColors: string[] = [
    '#E40303', // 红色
    '#FF8C00', // 橙色
    '#FFED00', // 黄色
    '#008018', // 绿色
    '#004CFF', // 蓝色
    '#732982', // 紫色
    '#000000', // 黑色 - 代表边缘化群体
    '#784F17', // 棕色 - 代表有色人种
    '#FFB3BA', // 粉色 - 跨性别旗帜
    '#87CEEB', // 浅蓝 - 跨性别旗帜
    '#FFFFFF', // 白色 - 跨性别旗帜
]

// 柔和彩虹色系 (适合浅色背景)
export const softRainbowColors: string[] = [
    '#FF6B6B', // 柔和红
    '#FFB366', // 柔和橙
    '#FFE066', // 柔和黄
    '#66B366', // 柔和绿
    '#6BB3FF', // 柔和蓝
    '#B366FF', // 柔和紫
    '#FF66D9', // 柔和粉
]

// 深色彩虹色系 (适合深色背景)
export const darkRainbowColors: string[] = [
    '#CC0000', // 深红
    '#FF6600', // 深橙
    '#CCAA00', // 深黄
    '#006600', // 深绿
    '#0066CC', // 深蓝
    '#6600CC', // 深紫
    '#CC0099', // 深品红
]

// LGBT各群体专属颜色
export const communityColors = {
    // 女同性恋旗帜颜色
    lesbian: ['#D62900', '#FF9B55', '#FFFFFF', '#D161A2', '#A20160'],

    // 男同性恋旗帜颜色
    gay: ['#078D70', '#26CEAA', '#98E8C1', '#FFFFFF', '#7BADE2', '#5049CC', '#3D1A78'],

    // 双性恋旗帜颜色
    bisexual: ['#D60270', '#9B59B6', '#0038A8'],

    // 跨性别旗帜颜色
    transgender: ['#5BCEFA', '#F5A9B8', '#FFFFFF'],

    // 泛性恋旗帜颜色
    pansexual: ['#FF218C', '#FFD800', '#21B1FF'],

    // 无性恋旗帜颜色
    asexual: ['#000000', '#A3A3A3', '#FFFFFF', '#800080'],
}

// 推荐的词云颜色组合 (确保对比度和可读性)
export const wordcloudRecommended: string[] = [
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

// 高对比度颜色 (适合无障碍访问)
export const highContrastColors: string[] = [
    '#FF0000', // 纯红
    '#FF6600', // 橙色
    '#00AA00', // 绿色
    '#0066FF', // 蓝色
    '#6600CC', // 紫色
    '#CC0066', // 品红
    '#000000', // 黑色
    '#FFFFFF', // 白色 (深色背景时使用)
]

// 根据背景色获取合适的颜色方案
export function getColorsForBackground(backgroundColor: 'light' | 'dark'): string[] {
    return backgroundColor === 'light' ? darkRainbowColors : softRainbowColors
}

// 随机获取颜色的工具函数
export function getRandomColor(colors: string[] = wordcloudRecommended): string {
    return colors[Math.floor(Math.random() * colors.length)]
}

// 生成渐变色的工具函数
export function generateGradientColors(startColor: string, endColor: string, steps: number): string[] {
    // 简化版渐变色生成，实际项目中可能需要更复杂的颜色插值
    const colors: string[] = []
    // 这里需要颜色插值算法，暂时返回起始和结束色
    colors.push(startColor)
    for (let i = 1; i < steps - 1; i++) {
        colors.push(getRandomColor(wordcloudRecommended))
    }
    colors.push(endColor)
    return colors
}

// 导出默认颜色方案
export default wordcloudRecommended
