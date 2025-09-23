<script setup lang="ts">
import { openAgreementModal2 } from '@/components/modal/agreement/open'

const props = withDefaults(defineProps<Props>(), {
  message: () => ({}),
})
const emits = defineEmits(['agree'])
interface Props {
  message: any
}
onMounted(async () => {})
</script>

<template>
  <div class="seein-agreement-message-item">
    <div class="seein-agreement-message-item__content">
      <div>
        请先阅读并同意夕里科技<span
          class="cursor-pointer text-[#00b755]"
          link
          @click="openAgreementModal2()"
        >
        AI心理疏导知情同意书</span>，再进行AI聊天
      </div>
      <el-button
        class="h-[40px] rounded-[3px]"
        type="primary"
        @click="emits('agree')"
      >
        我已阅读并同意协议内容
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-agreement-message-item {
  width: 800px;
  display: flex;
  justify-content: flex-start;
  &__content {
    background: $color-fill-5;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 15px;
    color: $color-text-1;
    line-height: 24px;
  }
}
</style>
