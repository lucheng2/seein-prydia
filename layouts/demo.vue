<script setup lang="ts">
import contractIcon from '@/assets/images/icon/contract.png'
import expandIcon from '@/assets/images/icon/expand.png'

import plusIcon from '@/assets/images/icon/plus.png'

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

onMounted(() => {})
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
              <img
                class="h-[16px] w-[16px]"
                :src="isCollapsed ? expandIcon : contractIcon"
              />
            </div>
          </UiCard>
          <UiCard v-if="isCollapsed" class="ml-[20px] cursor-pointer">
            <div class="h-[40px] w-[40px]" flex="~ items-center justify-center">
              <img class="h-[16px] w-[16px]" :src="plusIcon" />
            </div>
          </UiCard>
        </div>
      </template>
    </LayoutNavBar>
    <div class="seein-default-layout__content relative z-2">
      <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
        <slot name="conversations" :is-collapsed="isCollapsed" />
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

.content-area {
  flex: 1;
  margin-left: 24px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.sidebar-collapsed {
    margin-left: calc(-288px); /* 288px - 24px = 264px */
  }
}
</style>
