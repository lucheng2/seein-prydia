<script setup lang="ts">
interface Props {
  isAbsolute?: boolean
  logo?: string
  routeList?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  isAbsolute: false,
  routeList: () => [],
})

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
    </LayoutNavBar>
    <div class="seein-default-layout__content relative z-2">
      <div class="content-area">
        <slot name="content" />
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

.content-area {
  flex: 1;
}
</style>
