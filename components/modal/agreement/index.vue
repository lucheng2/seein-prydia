<script setup lang="ts">
import * as api from '@/apis'
import closeIcon from '@/assets/images/icon/close.png'
import { MdPreview } from 'md-editor-v3'

import 'md-editor-v3/lib/style.css'

const props = defineProps<Props>()
const emits = defineEmits(['change'])
interface Props {
  init?: (...args: any[]) => void
}
const showModal = ref(false)
const modelType = ref(0)
const open = (model = 0) => {
  modelType.value = model
  showModal.value = true
}

const close = () => {
  showModal.value = false
}

defineExpose({
  open,
  close,
})
const loading = ref(false)
const handleSubmit = async (agreeFlag: number) => {
  loading.value = true
  try {
    await api.agreeOrRefuseAgreement(agreeFlag)
    close()
    emits('change', !!agreeFlag)
  }
  catch (error) {
    console.log(error)
  }
  loading.value = false
}

const pageLoading = ref(false)
const text = ref('')
const getMdText = async () => {
  pageLoading.value = true
  try {
    const data = await api.getAgreementMd()
    text.value = data
  }
  catch (error) {
    console.log(error)
  }
  pageLoading.value = false
}
onMounted(() => {
  getMdText()
})
</script>

<template>
  <div class="scale-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      class="w-[80%] md:w-[50%]"
      :show-close="false"
      :z-index="2000"
      :close-on-click-modal="modelType === 1"
    >
      <template #header />
      <div class="h-[500px] flex flex-col">
        <!-- <div class="flex justify-end">
          <div class="cursor-pointer hover:bg-[#ccc]" @click="close">
            <img class="z-10 block h-[20px] w-[20px]" :src="closeIcon" />
          </div>
        </div> -->
        <div class="mb-[16px] text-[24px] text-[#141414] font-500">
          <div>夕里科技AI心理疏导知情同意书</div>
        </div>
        <el-scrollbar v-loading="pageLoading" class="flex-1">
          <div class="agreement-md text-[#292929]">
            <MdPreview
              v-model="text"
              editor-id="markdown-content__agreement"
            />
          </div>
        </el-scrollbar>
        <div v-if="modelType === 0" class="mt-[12px] flex flex-col items-center">
          <el-button
            :loading="loading"
            type="primary"
            class="h-[40px] w-[320px] rounded-[6px]"
            @click="handleSubmit(1)"
          >
            同意并继续
          </el-button>
          <el-button
            :loading="loading"
            class="mt-[12px] h-[40px] w-[320px] rounded-[6px] border-none"
            style="margin-left: 0"
            @click="handleSubmit(0)"
          >
            拒绝
          </el-button>
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
  padding: 24px 32px;
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
