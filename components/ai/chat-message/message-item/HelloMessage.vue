<script setup lang="ts">
interface Props {
  message: any
}
const props = withDefaults(defineProps<Props>(), {
  message: () => ({}),
})

const emit = defineEmits(['on'])
</script>

<template>
  <div class="seein-hello-message-item md:pt-[82px]">
    <div class="seein-hello-message-item__title text-[26px] md:text-[32px]">你好！我是Seein</div>
    <div class="seein-hello-message-item__content text-center text-[16px] md:text-[18px]">
      你的随身心理管家，有任何心理相关的问题都可以向我提问，我会严格保密
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-hello-message-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  &__title {
    font-weight: 500;
    color: $color-text-1;
    line-height: 28px;
    margin-bottom: 12px;
  }
  &__content {
    color: $color-text-2;
    margin-bottom: 20px;
  }
}
</style>
