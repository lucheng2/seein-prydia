import { LineChart } from 'echarts/charts'

import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
// 手动导入ECharts模块以减小包的大小
import { CanvasRenderer } from 'echarts/renderers'

export default defineNuxtPlugin(() => {
  use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])
})
