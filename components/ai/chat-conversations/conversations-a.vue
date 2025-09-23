<script setup lang="ts">
import logoImg from '@/assets/images/logo/green.png'
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
</script>

<template>
  <div
    bg="#FFFFFF"
    md:bg="#FFFFFFBB"
    h="100vh"
    position="absolute"
    z-999
    md:position="relative"
  >
    <!-- 顶部标题和折叠按钮 -->
    <div
      class="fixed z-99 m-[16px] ml-[24px] mr-0 h-[49px] w-[206px] flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
    >
      <div class="h-[49px] w-[109px] flex items-center">
        <img v-if="logoImg" :src="logoImg" alt="logo" />
      </div>
      <button
        class="rounded transition-colors hover:bg-white dark:hover:bg-gray-700"
        cursor="pointer"
        :title="isCollapsed ? '展开' : '折叠'"
        @click="toggleCollapse"
      >
        <UiIcon
          v-if="isCollapsed"
          class="text-gray-500"
          width="30"
          icon="layout-rightbar-close-line"
        />
        <UiIcon
          v-else
          class="text-gray-500"
          width="30"
          icon="layout-rightbar-open-line"
        />
      </button>
    </div>
    <!-- 侧边栏容器 -->
    <div
      class="h-full flex flex-col border-r border-gray-200 pt-[70px] transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800"
      :class="isCollapsed ? 'w-[0] md:w-[0]' : 'w-[248px]'"
      relative
      z-3
    >
      <div class="mx-[24px] mb-[16px] mt-[6px]">
        <Transition name="fade" mode="out-in" tag="div">
          <button
            v-if="!isCollapsed"
            class="flex items-center"
            w="full"
            px="12px"
            py="10px"
            flex="~"
            border="1px solid #00B755"
            text="#00B755 14px"
            font="500"
            rounded="6px"
            bg="#E9F7EE"
            hover="bg-[#BCEBCD]"
            cursor="pointer"
            @click="handleNew"
          >
            <UiIcon
              class="mr-[16px] text-[#00B755]"
              width="20"
              icon="add-comment-outline-rounded"
            />开启新咨询
          </button>
        </Transition>
      </div>
      <div
        ref="conversationListRef"
        class="ml-[24px] flex flex-1 flex-col items-center overflow-hidden overflow-y-auto pb-[10px]"
      >
        <template v-for="item in conversationsGrouped" :key="item.title">
          <Transition name="fade" mode="out-in" tag="div">
            <div
              v-if="!isCollapsed"
              bg="#FFFFFF"
              md:bg="#FFFFFF"
              class="theme-text sticky top-0 z-99 w-full self-start rounded-lg pb-[4px] pl-[10px] pt-[10px] text-[14px] text-[#5E5E5E]"
            >
              {{ item.title }}
            </div>
          </Transition>
          <TransitionGroup name="list" tag="ul" class="w-full self-start">
            <li
              v-for="conversation in item.list"
              :key="conversation.id"
              :data-conversation-id="conversation.conversationId"
              class="flex cursor-pointer items-center self-start rounded-lg p-[10px] transition-colors hover:bg-[#F5F7FA] dark:hover:bg-gray-700"
              :class="{
                'bg-[#F5F7FA]': conversationId === conversation.conversationId,
              }"
              @click="handleSelect(conversation)"
            >
              <Transition name="fade" mode="out-in">
                <div v-if="!isCollapsed" class="min-w-0 flex-1 overflow-hidden">
                  <p
                    class="truncate text-[14px] text-[#141414] dark:text-gray-400"
                  >
                    {{ conversation.theme }}
                  </p>
                </div>
              </Transition>
            </li>
          </TransitionGroup>
        </template>
      </div>

      <!-- 底部用户信息 -->
      <!-- <div class="border-t border-gray-200 p-3 dark:border-gray-700">
        <Transition name="fade" mode="out-in">
          <div v-if="!isCollapsed" class="flex items-center">
            <div class="h-9 w-9 flex items-center justify-center rounded-full bg-green-500 text-white font-medium">
              U
            </div>
            <div class="ml-3 min-w-0 overflow-hidden">
              <p class="truncate text-gray-800 font-medium dark:text-gray-200">
                用户名
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                在线
              </p>
            </div>
          </div>
          <div v-else class="flex justify-center">
            <div class="h-9 w-9 flex items-center justify-center rounded-full bg-green-500 text-white font-medium">
              U
            </div>
          </div>
        </Transition>
      </div> -->
    </div>
  </div>
  <Transition name="mask">
    <div
      v-if="!isCollapsed"
      class="mask"
      z-2
      md:hidden
      @click="toggleCollapse"
    />
  </Transition>
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
</style>
