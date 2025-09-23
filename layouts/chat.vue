<script setup lang="ts">
interface Props {
  routeList: any[]
  navBarWidth?: string
  navBarLogo?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  routeList: () => [],
  bgColor: '',
})
</script>

<template>
  <div
    class="seein-chat-layout h-screen flex"
    :style="{
      'background-color': props.bgColor,
    }"
  >
    <div>
      <slot name="conversations" />
    </div>
    <div class="w-full flex flex-col">
      <LayoutNavBar
        :route-list="routeList"
        :width="navBarWidth"
        :logo="navBarLogo"
      />
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
