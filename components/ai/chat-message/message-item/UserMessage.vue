<script setup lang="ts">
interface Props {
  message: any
}
const props = withDefaults(defineProps<Props>(), {
  message: () => ({}),
})
</script>

<template>
  <div class="seein-user-message-item">
    <div class="seein-user-message-item__content max-w-[700px]">{{ message.content }}</div>
    <div class="ml-[12px] h-[36px] w-[36px] flex-shrink-0 self-end rounded-full bg-[#fff]">
      <img />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-user-message-item {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  &__content {
    background: linear-gradient(92deg, #703edb 0%, #f773a1 75%, #0c76ff 100%);
    border-radius: 16px 16px 0px 16px;
    padding: 16px 20px;
    font-size: 16px;
    color: #f5f7fa;
    line-height: 24px;
  }
}
</style>
