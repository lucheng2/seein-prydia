<script setup lang="ts">
import plusIcon from '@/assets/images/icon/plus.png'
import { useView } from '~/hooks'
import { groupByCreateTime } from './utils'

const props = withDefaults(defineProps<Props>(), {
  conversations: () => [],
  conversationId: '',
  createScrollListener: () => {},
})

const router = useRouter()

interface Props {
  conversations?: any[]
  conversationId?: string
  createScrollListener?: Function
}

const isCollapsed = defineModel('isCollapsed', { type: Boolean })
const { isMobile } = useView()

// 添加对话列表容器的引用
const conversationListRef = ref<HTMLElement>()

const conversationsGrouped = computed(() => {
  return groupByCreateTime(props.conversations)
})

// watch(
//   () => isMobile.value,
//   (val) => {
//     if (val) {
//       isCollapsed.value = true
//     }
//   },
// )

// 新增：监听 conversationId 变化并滚动到对应项
watch(
  () => props.conversationId,
  (newId) => {
    if (newId && !isCollapsed.value) {
      nextTick(() => {
        scrollToCurrentConversation(newId)
      })
    }
  },
)

// 新增：滚动到当前对话的函数
function scrollToCurrentConversation(conversationId: string) {
  if (!conversationListRef.value || !conversationId) return

  // 查找对应的对话项元素
  const targetElement = conversationListRef.value.querySelector(
    `[data-conversation-id="${conversationId}"]`,
  )

  if (targetElement) {
    // 滚动到目标元素，使其在容器顶部显示,不要使用scrollIntoView，因为它是平滑滚动，而这里需要立即滚动到顶部
    targetElement.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('isCollapsed', String(isCollapsed.value))
}

const handleSelect = async (conversation) => {
  if (isMobile.value) isCollapsed.value = true
  navigateTo(`/ai/chat/${conversation.conversationId}`)
}

const handleNew = async () => {
  isCollapsed.value = true
  navigateTo('/ai/chat/new?new=true')
}

const navigateTo = (path: string) => {
  router.push(path)
}
let clearScrollListener
onMounted(() => {
  if (import.meta.client) {
    // isCollapsed.value = localStorage.getItem('isCollapsed') === 'true'
    clearScrollListener = props.createScrollListener(conversationListRef.value)
    // 如果有当前对话ID，滚动到对应位置
    if (props.conversationId) {
      nextTick(() => {
        scrollToCurrentConversation(props.conversationId)
      })
    }
  }
})
onBeforeUnmount(() => {
  if (clearScrollListener) {
    clearScrollListener?.()
  }
})

const activeTab = ref('chats')
const handleTab = (tab: string) => {
  activeTab.value = tab
}
</script>

<template>
  <UiCard style="height: 100%; z-index: 2">
    <div class="sidebar">
      <div flex="~ items-center justify-between" p="24px 22px 20px 24px">
        <div text="white 18px">History Chat</div>
        <UiCard>
          <div
            class="h-[40px] w-[114px] cursor-pointer"
            text="#CACCCB 14px"
            flex="~ items-center justify-center"
          >
            <img class="mr-[6px] h-[16px] w-[16px]" :src="plusIcon" />
            New Chat
          </div>
        </UiCard>
      </div>

      <div flex="~" class="px-[24px] pb-[6px]">
        <div
          text="#9E94A5 16px"
          font="500"
          class="relative cursor-pointer pb-[6px]"
          :class="{
            'active-tab': activeTab === 'chats',
          }"
          @click="handleTab('chats')"
        >
          Chats
        </div>
        <div
          text="#9E94A5 16px"
          font="500"
          :class="{
            'active-tab': activeTab === 'coach',
          }"
          class="relative ml-[16px] cursor-pointer pb-[6px]"
          @click="handleTab('coach')"
        >
          Topic with coach
        </div>
      </div>

      <div
        ref="conversationListRef"
        class="mb-[10px] mr-[1px] flex-1 overflow-y-auto px-[14px]"
      >
        <template v-for="item in conversationsGrouped" :key="item.title">
          <div
            class="theme-text sticky top-0 z-99 w-full self-start rounded-lg bg-[#1E1F25] pb-[4px] pl-[10px] pt-[10px] text-[14px] text-[#5E5E5E]"
          >
            {{ item.title }}
          </div>
          <ul name="list" class="w-full self-start">
            <li
              v-for="conversation in item.list"
              :key="conversation.id"
              :data-conversation-id="conversation.conversationId"
              class="flex cursor-pointer items-center self-start rounded-lg p-[10px] transition-colors hover:bg-gray-700"
              :class="{
                'bg-gray-700': conversationId === conversation.conversationId,
              }"
              @click="handleSelect(conversation)"
            >
              <div class="min-w-0 flex-1 overflow-hidden">
                <p class="truncate text-[14px] text-[#CBCACC]">
                  {{ conversation.theme }}
                </p>
              </div>
            </li>
          </ul>
        </template>
      </div>
      <slot name="sidebar" />
    </div>
  </UiCard>
</template>

<style lang="scss" scoped>
.mask {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba($color: #000000, $alpha: 0.45);
}

/* 遮罩层过渡效果 */
.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.3s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.mask-enter-to,
.mask-leave-from {
  opacity: 1;
}

/* 折叠/展开过渡 */
.list-move, /* 对移动的元素应用过渡 */
.list-enter-active,
.list-leave-active {
  // transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 确保离开的元素从布局流中删除 */
.list-leave-active {
  position: absolute;
}

/* 内容淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active-tab {
  color: #fff;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 2px;
    background: linear-gradient(
      90deg,
      #24e243 0%,
      #ffd12a 30%,
      #ee3942 62%,
      #703edb 100%
    );
  }
}
</style>
