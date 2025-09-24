<script setup lang="ts">
import expandIcon from '@/assets/images/icon/expand.png'

interface Props {
  isAbsolute?: boolean
  logo?: string
  routeList?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  isAbsolute: false,
  routeList: () => [],
})

const isCollapsed = ref(false)

// 切换侧边栏收起状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const activeTab = ref('chats')
const handleTab = (tab: string) => {
  activeTab.value = tab
}

const conversationId = ref('')
const conversationsGrouped = ref([
  {
    title: 'Today',
    list: [],
  },
])
const handleSelect = (conversation: any) => {
  conversationId.value = conversation.id
}

onMounted(() => {
  for (let index = 0; index < 100; index++) {
    conversationsGrouped.value[0].list.push({
      theme: 'hello',
      id: index,
      conversationId: index,
    })
  }
})
</script>

<template>
  <div class="seein-default-layout">
    <LayoutNavBar
      class="z-109"
      :logo="logo"
      :route-list="routeList"
      :is-absolute="isAbsolute"
    >
      <template #left>
        <div flex="~ items-center justify-center">
          <UiCard class="cursor-pointer" @click="toggleSidebar">
            <div class="h-[40px] w-[40px]" flex="~ items-center justify-center">
              <img class="h-[16px] w-[16px]" :src="expandIcon" alt="expand" />
            </div>
          </UiCard>
          <UiCard v-if="isCollapsed" class="ml-[20px] cursor-pointer">
            <div class="h-[40px] w-[40px]" flex="~ items-center justify-center">
              <img class="h-[16px] w-[16px]" :src="expandIcon" />
            </div>
          </UiCard>
        </div>
      </template>
    </LayoutNavBar>
    <div class="seein-default-layout__content relative z-2">
      <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
        <UiCard style="height: 100%">
          <div class="sidebar">
            <div flex="~ items-center justify-between" p="24px 22px 20px 24px">
              <div text="white 18px">History Chat</div>
              <UiCard>
                <div
                  class="h-[40px] w-[114px] cursor-pointer"
                  text="#CACCCB 14px"
                  flex="~ items-center justify-center"
                >
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

            <div class="mb-[10px] mr-[1px] flex-1 overflow-y-auto px-[14px]">
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
                      'bg-gray-700':
                        conversationId === conversation.conversationId,
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
      </div>

      <div class="content-area" :class="{ 'sidebar-collapsed': isCollapsed }">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__content {
    flex: 1;
    display: flex;
    padding: 0 40px 24px 40px;
    position: relative;
    overflow: hidden;
  }
}

.sidebar-container {
  position: relative;
  width: 288px;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  overflow: hidden;
  &.collapsed {
    transform: translateX(calc(-100% - 40px));
  }

  .sidebar {
    width: 288px;
    border-radius: 30px;
    height: calc(100vh - 94px - 24px);
    display: flex;
    flex-direction: column;
    /* 深色主题滚动条 - Webkit浏览器 */
    ::-webkit-scrollbar {
      width: 12px; /* 垂直滚动条宽度 */
      height: 12px; /* 水平滚动条高度 */
    }

    ::-webkit-scrollbar-track {
      background: #2d2d2d; /* 轨道背景色 */
      border-radius: 6px;
      margin: 2px;
    }

    ::-webkit-scrollbar-thumb {
      background: #555555; /* 滑块颜色 */
      border-radius: 6px;
      border: 2px solid #2d2d2d; /* 滑块边框 */
      transition: background-color 0.2s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #777777; /* 悬停时滑块颜色 */
    }

    ::-webkit-scrollbar-thumb:active {
      background: #999999; /* 点击时滑块颜色 */
    }

    /* 滚动条角落 */
    ::-webkit-scrollbar-corner {
      background: #2d2d2d;
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
  }
}

.content-area {
  flex: 1;
  margin-left: 24px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.sidebar-collapsed {
    margin-left: calc(-288px); /* 288px - 24px = 264px */
  }
}
</style>
