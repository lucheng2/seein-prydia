<script setup lang="ts">
import aiAvatar from '@/assets/images/ai-avatar.png'
import { config, MdPreview } from 'md-editor-v3'

import DisLike from './DisLike.vue'
import 'md-editor-v3/lib/style.css'

interface Props {
  message: any
}

const props = withDefaults(defineProps<Props>(), {
  message: () => ({}),
})

const emits = defineEmits(['send', 'scrollToBottom', 'regenerate'])
const AutoFoldThreshold = Number.MAX_SAFE_INTEGER
const editorId = computed(() => `markdown-content_${props.message.id}`)
const loading = ref(true)

const text = ref('')
const isError = computed(() => text.value.includes('服务器繁忙，请稍后再试'))
const showLike = computed(
  () =>
    props.message?.state === 'end'
    && props.message.sender === 'ai'
    && !isError.value
    && isTextComplete.value,
)

const showRegenerate = computed(
  () =>
    props.message?.state === 'end'
    && props.message.sender === 'ai'
    && isTextComplete.value,
)

// 新增队列和渲染控制相关变量
const textQueue = ref<string[]>([]) // 待渲染的文本队列
const isRendering = ref(false) // 当前是否正在渲染
// 新增状态标记文本是否渲染完成
const isTextComplete = ref(false)
let renderTimer: any = null // 渲染定时器

// 重新初始化消息
const initMessage = () => {
  text.value = ''
  textQueue.value = []
  isRendering.value = false
  isTextComplete.value = false
  loading.value = true
}

const handleRegenerate = () => {
  initMessage()
  emits('regenerate', props.message)
}

// 处理队列中的文本
const processQueue = () => {
  if (textQueue.value.length === 0) {
    isRendering.value = false
    isTextComplete.value = true // 标记文本渲染完成
    return
  }

  isRendering.value = true
  const chunk = textQueue.value.shift()!
  let index = 0

  const renderChunk = () => {
    if (index < chunk.length) {
      text.value += chunk.charAt(index)
      index++
      renderTimer = setTimeout(renderChunk, 20) // 50ms渲染一个字符
      emits('scrollToBottom')
    }
    else {
      // 当前块渲染完成，处理下一块
      renderTimer = setTimeout(processQueue, 10)
    }
  }

  renderChunk()
}

// 修改后的addText函数
const addText = (textChunk: string) => {
  textQueue.value.push(textChunk)

  if (!isRendering.value) {
    // 关闭加载状态以显示内容
    loading.value = false
    processQueue()
  }
}

defineExpose({
  addText,
})

onMounted(async () => {
  loading.value = true
  if (props.message.content) {
    loading.value = false
    isRendering.value = false
    isTextComplete.value = true // 标记文本渲染完成
    text.value = props.message.content
  }
})

// 清理定时器
onUnmounted(() => {
  if (renderTimer) {
    clearTimeout(renderTimer)
    renderTimer = null
  }
})
</script>

<template>
  <div v-if="!loading" class="w-full">
    <div class="seein-ai-message-item">
      <div
        class="mr-[12px] h-[36px] w-[36px] flex-shrink-0 self-start rounded-full"
      >
        <img class="h-full w-full" :src="aiAvatar" />
      </div>
      <!-- <div :id="`markdown-content_${message.id}`" class="seein-ai-message-item__content"></div> -->
      <div>
        <div class="seein-ai-message-item__content max-w-[700px]">
          <MdPreview
            v-model="text"
            class="markdown-content"
            :editor-id="editorId"
            :auto-fold-threshold="AutoFoldThreshold"
          />
        </div>
        <DisLike
          :show-regenerate="showRegenerate"
          :show-like="showLike"
          :message-id="message.id"
          @regenerate="handleRegenerate"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="seein-ai-message-loading h-[52px] w-full flex items-center justify-start"
  >
    <UiLoadingSpinner />
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/markdown.scss" as *;

.seein-ai-message-item {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  &__content {
    background: #2c2933;
    border-radius: 0px 16px 16px 16px;
    padding: 16px 20px;
    font-size: 16px;
    color: #f5f7fa;
    line-height: 24px;
  }
}
</style>
