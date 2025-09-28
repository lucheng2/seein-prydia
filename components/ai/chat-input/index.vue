<script setup lang="ts">
import { UiSvgIcon } from '#components'
import CoachSelect from './CoachSelect.vue'

interface Props {
  loading?: boolean
  inputDisabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  inputDisabled: false,
})
const emits = defineEmits(['handleSend'])
const modelValue = defineModel<string>('modelValue')
const handleSend = () => {
  emits('handleSend', modelValue.value)
}

const isFocus = ref(true)
const isAllNewLines = (str: string) => {
  // 检查是否全部为换行符，包括 \n, \r\n, \r
  const pattern = /^(?:\r\n?|\n)*$/
  return pattern.test(str)
}
const handleKeyCode = (e: KeyboardEvent) => {
  if (e.keyCode === 13) {
    if (!e.ctrlKey) {
      e.preventDefault()
      const val = modelValue.value.trim()
      if (val && !isAllNewLines(val)) handleSend()
    }
    else {
      modelValue.value += '\n'
    }
  }
}

const sendDisabled = computed(() => {
  return !modelValue.value || props.loading
})
</script>

<template>
  <div>
    <div
      class="seein-chat-input"
      :class="{
        'is-focus': isFocus,
      }"
    >
      <el-input
        v-model="modelValue"
        placeholder="Please enter your content, and l will give you the most sincere response."
        :autosize="{
          minRows: 2,
          maxRows: 4,
        }"
        class="mb-[6px]"
        type="textarea"
        autofocus
        resize="none"
        :disabled="inputDisabled"
        @keydown="handleKeyCode"
        @focus="isFocus = true"
        @blur="isFocus = false"
      />
      <div class="seein-chat-input__btns">
        <div>
          <CoachSelect />
        </div>
        <div
class="seein-chat-input__btns--item send-button" :style="{
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            color: sendDisabled
              ? 'var(--el-color-primary-light-5)'
              : 'var(--el-color-primary)',
          }" :class="[{ 'send-button--disabled': sendDisabled }]" @click="handleSend"
>
</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-chat-input::after {
}
.seein-chat-input {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  &.is-focus::after {
    width: calc(100% - 24px);
    animation: focus-animation 0.2s ease-in-out;
  }
  &::after {
    content: "";
    position: absolute;
    bottom: 1px;
    left: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 2px;
    background: $brand-1;
    width: 0;
    animation: nofocus-animation 0.2s ease-in-out;
  }
  @keyframes focus-animation {
    0% {
      width: 0;
    }
    100% {
      width: calc(100% - 24px);
    }
  }
  @keyframes nofocus-animation {
    0% {
      width: calc(100% - 24px);
    }
    100% {
      width: 0;
    }
  }

  :deep(.el-input) {
    --el-input-inner-height: unset;
    line-height: unset !important;
  }
  :deep(.el-textarea__inner) {
    box-shadow: none;
    padding: unset;
    font-size: 16px;
    color: #fff;
    background: #1e1f25 !important;
    caret-color: #fff;
    /* 深色主题滚动条 - Webkit浏览器 */
    &::-webkit-scrollbar {
      width: 12px; /* 垂直滚动条宽度 */
      height: 12px; /* 水平滚动条高度 */
    }

    &::-webkit-scrollbar-track {
      background: #2d2d2d; /* 轨道背景色 */
      border-radius: 6px;
      margin: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #555555; /* 滑块颜色 */
      border-radius: 6px;
      border: 2px solid #2d2d2d; /* 滑块边框 */
      transition: background-color 0.2s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #777777; /* 悬停时滑块颜色 */
      cursor: pointer;
    }

    &::-webkit-scrollbar-thumb:active {
      background: #999999; /* 点击时滑块颜色 */
    }

    /* 滚动条角落 */
    &::-webkit-scrollbar-corner {
      background: #2d2d2d;
    }
  }
  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    background: unset !important;
  }
  &__btns {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &--item {
      width: 32px;
      height: 32px;
    }
  }
}

.send-button {
  transition: all 0.2s ease-in-out;
  border-radius: 50%;
  background: linear-gradient( 134deg, #703EDB 0%, #EE3942 59%, #FFD12A 100%);
}

/* 正常状态的交互效果 */
.send-button:not(.send-button--disabled):hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.send-button:not(.send-button--disabled):active {
  transform: scale(0.95);
  filter: brightness(0.9);
}

/* 禁用状态样式 */
.send-button--disabled {
  opacity: 0.6;
}

.send-button--disabled:hover {
  transform: none;
  filter: none;
  box-shadow: none;
}
</style>

<style lang="scss">
</style>
