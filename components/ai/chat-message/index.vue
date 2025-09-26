<script setup lang="ts">
import ComponentsMap from './message-item/ComponentsMap'

interface Props {
  messageList: any[]
}
const props = withDefaults(defineProps<Props>(), {
  messageList: () => [],
})

const messageRefMap = new Map()
const handleSetRefMap = (el: any, item: any) => {
  messageRefMap.set(`markdown-content_${item.id}`, el)
}

const getMessageRef = (id: string) => {
  return messageRefMap.get(`markdown-content_${id}`)
}

const useEmit = () => {
  const emitMap = new Map<string, Function>()

  const on = (key: string, fn: Function) => {
    emitMap.set(key, fn)
  }

  const off = (key: string) => {
    emitMap.delete(key)
  }

  const emit = (key: string, ...args: any[]) => {
    const fn = emitMap.get(key)
    fn && fn(...args)
  }

  return {
    on,
    off,
    emit,
  }
}

const { on, off, emit } = useEmit()

defineExpose({
  on,
  off,
  getMessageRef,
})
</script>

<template>
  <div class="overflow-auto">
    <div class="seein-chat-message w-full flex flex-col items-center">
      <template v-for="item in messageList" :key="item.id">
        <component
          v-bind="item.attrs"
          :is="ComponentsMap[item.sender as keyof typeof ComponentsMap]"
          :ref="(el: any) => handleSetRefMap(el, item)"
          :message="item"
          @on="emit"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-chat-message {
  & > div {
    margin-top: 24px;
  }
}
</style>
