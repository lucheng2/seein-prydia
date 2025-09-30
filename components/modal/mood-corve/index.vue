<script setup lang="ts">
import emoji1 from '@/assets/images/emoji/1.png'
import emoji2 from '@/assets/images/emoji/2.png'
import emoji3 from '@/assets/images/emoji/3.png'
import emoji4 from '@/assets/images/emoji/4.png'
import emoji5 from '@/assets/images/emoji/5.png'

import closeIcon from '@/assets/images/icon/close.png'
import VChart from 'vue-echarts'
import * as api from '~/apis'

const props = withDefaults(defineProps<Props>(), {})

interface Props {
  init?: (...args: any[]) => void
}
const chartRef = ref()
// 响应式状态
const loading = ref(false)
const error = ref('')
const rawData = ref([])
const recentDays = ref(1)
const recentDaysOptions = ref([
  { label: 'Today', value: 1 },
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
  execute: fetchMoodCorveData,
} = useAsyncData(
  `chat-mood-corve`,
  () => {
    return api.getMoodCorve({
      recentDays: recentDays.value,
    })
  },
  {
    lazy: true,
  },
)

// 获取词云数据
watchEffect(() => {
  rawData.value = response.value || []
  error.value = fetchError.value?.message
  loading.value = pending.value
})

watch(loading, () => {
  nextTick(() => {
    console.log(chartRef.value)
    chartRef.value?.resize()
  })
})

const showModal = ref(false)

const open = () => {
  showModal.value = true
  fetchMoodCorveData()
}

const close = () => {
  showModal.value = false
}

defineExpose({
  open,
  close,
})

// 愤怒|不悦|一般|舒适|开心
const EmojiType = {
  愤怒: 0,
  不悦: 1,
  一般: 2,
  舒适: 3,
  开心: 4,
}

const option = computed(() => {
  const xData = []
  const yData = []
  rawData.value.forEach((item) => {
    xData.push(formatDate(item.createTime, 'MM-DD HH:mm'))
    yData.push(EmojiType[item.topEmotion])
  })
  return {
    grid: {
      top: '10%',
      left: '0%',
      right: '5%',
      bottom: '10%',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        // 坐标轴轴线相关设置。数学上的x轴
        show: false,
      },
      axisLabel: {
        // 坐标轴刻度标签的相关设置
        textStyle: {
          padding: 32,
          color: '#9E94A5',
          fontSize: 12,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#5E5A68',
        },
      },
      axisTick: {
        show: false,
      },
      data: xData,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 4,
      axisTick: {
        show: false, // 不显示坐标轴刻度线
      },
      axisLine: {
        show: false, // 不显示坐标轴线
      },
      splitLine: {
        show: false, // 不显示网格线
      },
      axisLabel: {
        show: true,
        margin: 20,
        formatter(value: any) {
          return `{${value}| }`
        },
        rich: {
          0: {
            height: 32,
            align: 'center',
            backgroundColor: {
              image: emoji1,
            },
          },
          1: {
            height: 32,
            align: 'center',
            backgroundColor: {
              image: emoji2,
            },
          },
          2: {
            height: 32,
            align: 'center',
            backgroundColor: {
              image: emoji3,
            },
          },
          3: {
            height: 32,
            align: 'center',
            backgroundColor: {
              image: emoji4,
            },
          },
          4: {
            height: 32,
            align: 'center',
            backgroundColor: {
              image: emoji5,
            },
          },
        },
      },
    },
    series: [
      {
        data: yData,
        type: 'line',
      },
    ],
  }
})
</script>

<template>
  <div class="mood-corve-modal">
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
        <div text="#FFFFFF 24px" font="500">Mood Corve</div>
        <div class="cursor-pointer rounded-[6px]" @click="close">
          <img class="z-10 block h-[20px] w-[20px]" :src="closeIcon" />
        </div>
      </div>
      <div class="mood-corve-container">
        <UiSelect
          v-model="recentDays"
          :options="recentDaysOptions"
          @handle-select="fetchMoodCorveData"
        />
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <UiLoadingSpinner />
          <div class="loading-text">Loading...</div>
        </div>
        <template v-if="!loading">
          <VChart
            v-show="rawData.length > 0"
            ref="chartRef"
            class="chart"
            :option="option"
            autoresize
          />
          <div v-show="rawData.length === 0" class="empty-container">
            <div class="empty-icon">📊</div>
            <div class="empty-text">Empty</div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.mood-corve-modal {
  :deep(.el-dialog) {
  @apply w-[80%] md:w-[800px];
}
:deep(.el-dialog__header) {
  display: none;
}
.chart {
  width: 100%;
  height: 360px;
}
.mood-corve-container {
  min-height: 400px;
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
}
</style>
