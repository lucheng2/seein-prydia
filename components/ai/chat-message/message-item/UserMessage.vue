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
    <div class="seein-user-message-item__content">{{ message.content }}</div>
  </div>
</template>

<style lang="scss" scoped>
.seein-user-message-item {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  &__content {
    background: #E9F7EE;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 16px;
    color: $color-text-1;
    line-height: 24px;
  }
}
</style>
