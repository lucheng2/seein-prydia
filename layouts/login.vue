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
</script>

<template>
  <div class="seein-default-layout">
    <LayoutNavBar
      class="z-109"
      :logo="logo"
      :route-list="routeList"
      :is-absolute="isAbsolute"
      fixed
    />
    <div class="seein-default-layout__content relative z-2">
      <slot name="content" />
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
  }
}
</style>
