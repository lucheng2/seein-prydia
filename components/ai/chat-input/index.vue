<script setup lang="ts">
import { UiSvgIcon } from '#components'

interface Props {
  loading: boolean
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
        placeholder="输入你的问题，发送给Seein"
        :autosize="{
          minRows: 2,
          maxRows: 6,
        }"
        class="mb-[6px] min-h-[62px]"
        type="textarea"
        autofocus
        resize="none"
        :disabled="inputDisabled"
        @keydown="handleKeyCode"
        @focus="isFocus = true"
        @blur="isFocus = false"
      />
      <div class="seein-chat-input__btns">
        <UiIcon
          class="seein-chat-input__btns--item send-button"
          :class="[{ 'send-button--disabled': sendDisabled }]"
          :style="{
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            color: sendDisabled
              ? 'var(--el-color-primary-light-5)'
              : 'var(--el-color-primary)',
          }"
          icon="arrow-circle-up-rounded"
          @click="handleSend"
        />
      </div>
    </div>
    <div class="py-[12px] text-center text-[12px] text-[#858585]">
      提示：咨询内容由AI生成，不具备专业医疗建议。如您有紧急情况，建议寻求专业帮助
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-chat-input::after {
}
.seein-chat-input {
  background: #ffffff;
  border-radius: 12px 16px;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  padding: 12px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease-in-out;
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
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffffff;
    z-index: -1;
    border-radius: 12px 16px;
  }
  &:hover {
    box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
  }
  :deep(.el-input) {
    --el-input-inner-height: unset;
    line-height: unset !important;
  }
  :deep(.el-textarea__inner) {
    box-shadow: none;
    padding: unset;
    font-size: 16px;
    color: $color-text-1;
  }
  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    background: unset !important;
  }
  &__btns {
    display: flex;
    justify-content: flex-end;
    &--item {
      width: 32px;
      height: 32px;
    }
  }
}

.send-button {
  transition: all 0.2s ease-in-out;
  border-radius: 50%;
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
