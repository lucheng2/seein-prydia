<script setup lang="ts">
import { useView } from '~/hooks'
import ConversationsA from './conversations-a.vue'

interface Props {
  conversations?: any[]
  conversationId?: string
  createScrollListener?: Function
}

const props = withDefaults(defineProps<Props>(), {
  conversations: () => [],
  conversationId: '',
  createScrollListener: () => {},
})

const isToNew = () => {
  if (!import.meta.client) return true
  if (['true', 'false'].includes(localStorage.getItem('toNew'))) {
    return localStorage.getItem('toNew') === 'true'
  }
  return true
}

const { isMobile } = useView()
const isCollapsed = reactive({
  pc: true,
  mobile: true,
})
watch(
  () => isMobile.value,
  (val) => {
    if (val) {
      isCollapsed.pc = true
      isCollapsed.mobile = true
    }
  },
)
</script>

<template>
  <div>
    <div class="hidden md:block">
      <ConversationsA
        v-model:is-collapsed="isCollapsed.pc"
        :conversation-id="conversationId"
        :conversations="conversations"
        :create-scroll-listener="createScrollListener"
      />
    </div>
    <div class="block md:hidden">
      <ConversationsA
        :key="1232"
        v-model:is-collapsed="isCollapsed.mobile"
        :conversation-id="conversationId"
        :conversations="conversations"
        :create-scroll-listener="createScrollListener"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
