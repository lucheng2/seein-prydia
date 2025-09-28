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

const isCollapsed = defineModel('isCollapsed', { type: Boolean })
</script>

<template>
  <div class="h-full">
    <div class="hidden h-full md:block">
      <ConversationsA
        v-model:is-collapsed="isCollapsed"
        :conversation-id="conversationId"
        :conversations="conversations"
        :create-scroll-listener="createScrollListener"
      />
    </div>
    <div class="block h-full md:hidden">
      <ConversationsA
        :key="1232"
        v-model:is-collapsed="isCollapsed"
        :conversation-id="conversationId"
        :conversations="conversations"
        :create-scroll-listener="createScrollListener"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
