<script setup lang="ts">
import { homeRouteList } from '@/constants/home'

const aiChatMessageRef = ref()
const messages = ref([
  {
    id: Date.now(),
    sender: 'user',
    content:
      'I hadn\'t ',
  },
  {
    id: Date.now(),
    sender: 'ai',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
  {
    id: Date.now(),
    sender: 'user',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
  {
    id: Date.now(),
    sender: 'ai',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
  {
    id: Date.now(),
    sender: 'user',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
  {
    id: Date.now(),
    sender: 'ai',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
  {
    id: Date.now(),
    sender: 'user',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
  {
    id: Date.now(),
    sender: 'ai',
    content:
      'I hadn\'t thought about the timing-good point. i was planning to just blurt it out, but maybe l should prepare a little. What if they ask questions l can\'t answer, though? Like, if they say “Are you sure?or ',
  },
])
</script>

<template>
  <NuxtLayout name="demo" :route-list="homeRouteList">
    <template #content>
      <!-- <AiChatHello /> -->
      <UiCard
        border-color="conic-gradient(
          from 0deg at 50% 50%,
          #703EDB 0%,
          #FFD12A 25%,
          #703EDB 50%,
          #FFD12A 100%
        )"
        rotating-height="100vw"
        rotating-width="100vw"
      >
        <div class="chat-content" flex="~ col justify-center items-center">
          <AiChatMessage
            ref="aiChatMessageRef"
            flex="~ 1"
            class="my-[20px] w-[900px]"
            :message-list="messages"
          />
          <div>
            <UiCard
              class="mb-[12px]"
              rotating-height="1000%"
              rotating-width="1000%"
            >
              <AiChatInput class="w-[900px]" />
            </UiCard>
          </div>
        </div>
      </UiCard>
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.chat-content {
  height: calc(100vh - 94px - 24px);
}
</style>
