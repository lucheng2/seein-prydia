<script setup lang="ts">
import contractIcon from '@/assets/images/icon/contract.png'
import expandIcon from '@/assets/images/icon/expand.png'

import plusIcon from '@/assets/images/icon/plus.png'

interface Props {
  isNew?: boolean
  isAbsolute?: boolean
  logo?: string
  routeList?: any[]
  bgRef?: any
}

const props = withDefaults(defineProps<Props>(), {
  isNew: true,
  isAbsolute: false,
  routeList: () => [],
})

const isCollapsed = defineModel<boolean>('isCollapsed')
const isCollapsedknowledge = defineModel<boolean>('isCollapsedknowledge')

// 切换侧边栏收起状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleNew = async () => {
  if (props.isNew) return
  isCollapsed.value = true
  navigateTo('/ai/chat/new?new=true')
}

onMounted(() => {})
</script>

<template>
  <div
    class="seein-default-layout"
    @mousemove="bgRef.handleMouseMove"
    @mouseleave="bgRef.handleMouseLeave"
  >
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
              <img
                class="h-[16px] w-[16px]"
                :src="isCollapsed ? expandIcon : contractIcon"
              />
            </div>
          </UiCard>
          <UiCard
            v-if="isCollapsed"
            class="ml-[20px] cursor-pointer"
            @click="handleNew"
          >
            <div class="h-[40px] w-[40px]" flex="~ items-center justify-center">
              <img class="h-[16px] w-[16px]" :src="plusIcon" />
            </div>
          </UiCard>
        </div>
      </template>
    </LayoutNavBar>
    <div class="seein-default-layout__content relative z-99">
      <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
        <slot name="conversations" :is-collapsed="isCollapsed" />
      </div>

      <div
        class="content-area"
        :class="{
          'sidebar-collapsed': isCollapsed,
          'knowledge-collapsed': isCollapsedknowledge,
          'knowledge-collapsed-show': !isCollapsedknowledge,
        }"
      >
        <slot name="content" />
      </div>

      <div
        class="knowledge-container"
        :class="{ collapsed: isCollapsedknowledge }"
        style="height: calc(100vh - 94px - 24px);overflow-y: auto;"
      >
        <slot name="knowledge" :is-collapsed="isCollapsedknowledge" />
      </div>
    </div>
    <slot name="bg" />
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

  &::after {
    content: "";
    position: fixed;
    top: -100px;
    width: 92px;
    height: 430px;
    transform: rotate(-35deg);
    background: linear-gradient(179deg, #7c2bff 0%, #ee3942 63%, #ffdc2d 100%);
    filter: blur(120px);
    z-index: 0;
  }

  &.collapsed {
    transform: translateX(calc(-100% - 40px));
  }

  .sidebar {
    width: 288px;
    border-radius: 30px;
    height: calc(100vh - 94px - 24px);
    display: flex;
    flex-direction: column;
  }
}

.knowledge-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
  width: calc(50vw);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  &.collapsed {
    transform: translateX(calc(100% + 40px));
  }
}

.content-area {
  flex: 1;
  margin-left: 24px;
  transition: margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.sidebar-collapsed {
    margin-left: calc(-288px); /* 288px - 24px = 264px */
  }

  &.knowledge-collapsed {
    margin-right: calc(-50vw); /* 288px - 24px = 264px */
  }

  &.knowledge-collapsed-show {
    margin-right: 24px;
  }
}
</style>
