<script setup lang="ts">
import closeIcon from '@/assets/images/icon/close.png'
import wxCodeImg from '@/assets/images/wx-code-c.png'

const props = defineProps<Props>()
interface Props {
  init?: (...args: any[]) => void
}
const showModal = ref(false)
const open = () => {
  showModal.value = true
}

const close = () => {
  showModal.value = false
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <div class="contact-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      class="w-[80%] md:w-[290px]"
      :show-close="false"
      :z-index="2000"
    >
      <template #header />
      <div class="h-[220px] flex flex-col">
        <div class="flex items-center justify-between">
          <div></div>
          <div
            class="cursor-pointer rounded-[3px] transition-all hover:bg-[#ccc]"
            @click="close"
          >
            <img class="z-10 block h-[20px] w-[20px]" :src="closeIcon" />
          </div>
        </div>
          <div class="flex flex-1 flex-col items-center justify-between">
            <el-image style="width: 150px; height: 150px" :src="wxCodeImg" />
            <div class="mb-[12px]">欢迎扫码联系客服，反馈您的问题</div>
          </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/markdown.scss" as *;

:deep(.el-dialog) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  border-radius: 12px !important;
  padding: 12px;
}

:deep(.el-dialog__header) {
  display: none;
}
:deep(.el-form-item__label) {
  color: $color-text-1;
  font-size: 14px;
  font-weight: 400;
}
</style>
