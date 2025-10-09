<script setup lang="ts">
import { useView } from '~/hooks'
import ConversationsA from './conversations-a.vue'

const props = withDefaults(defineProps<Props>(), {
  isNew: true,
  conversationId: '',
  conversations: () => [],
  conversationsCoach: () => [],
  createScrollListener: () => {},
  createScrollListenerCoach: () => {},
})

interface Props {
  isNew?: boolean
  conversationId?: string
  conversations?: any[]
  conversationsCoach?: any[]
  createScrollListener?: Function
  createScrollListenerCoach?: Function
}

const isCollapsed = defineModel('isCollapsed', { type: Boolean })
const activeTab = defineModel('activeTab', { type: String })
const chatType = defineModel('chatType', { type: String })
</script>

<template>
  <div class="h-full">
    <div class="hidden h-full md:block">
      <ConversationsA
        v-model:is-collapsed="isCollapsed"
        v-model:active-tab="activeTab"
        v-model:chat-type="chatType"
        :is-new="isNew"
        :conversation-id="conversationId"
        :conversations="conversations"
        :create-scroll-listener="createScrollListener"
        :conversations-coach="conversationsCoach"
        :create-scroll-listener-coach="createScrollListenerCoach"
      />
    </div>
    <div class="block h-full md:hidden">
      <ConversationsA
        :key="1232"
        v-model:is-collapsed="isCollapsed"
        v-model:active-tab="activeTab"
        v-model:chat-type="chatType"
        :is-new="isNew"
        :conversation-id="conversationId"
        :conversations="conversations"
        :create-scroll-listener="createScrollListener"
        :conversations-coach="conversationsCoach"
        :create-scroll-listener-coach="createScrollListenerCoach"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
