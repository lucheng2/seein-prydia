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
    class="seein-chat-layout flex"
    :style="{
      'background-color': props.bgColor,
    }"
  >
    <div z-1002>
      <slot name="conversations" />
    </div>
    <div class="w-full flex flex-col">
      <LayoutNavBar
        :route-list="routeList"
        :width="navBarWidth"
        :logo="navBarLogo"
        class="absolute left-0 z-999"
      />
      <div class="z-12">
        <slot name="content" />
      </div>
    </div>
    <div class="absolute left-0 top-0 h-full w-full">
      <slot name="bg" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
