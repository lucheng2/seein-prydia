<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import * as api from '@/apis'
import closeIcon from '@/assets/images/icon/close.png'
import BasicInfo from './components/BasicInfo.vue'

interface Props {
  init?: (...args: any[]) => void
}
const props = defineProps<Props>()

const basicInfoRef = ref()

const showModal = ref(false)

const open = (phone?: string) => {
  showModal.value = true
  nextTick(() => {
    if (phone && basicInfoRef.value) {
      basicInfoRef.value.ruleForm.phone = phone
    }
  })
}

const close = () => {
  showModal.value = false
}

defineExpose({
  open,
  close,
})

const loading = ref(false)
const handleSubmit = () => {
  basicInfoRef.value?.formRef?.validate(
    async (formEl: FormInstance | undefined) => {
      if (!formEl) return
      try {
        loading.value = true
        const { phone, applyReason } = basicInfoRef.value?.ruleForm
        await api.applyAiChat({
          phone,
          applyReason,
        })
        message('申请发送成功，请等待汐里的运营人员联系你', { type: 'success' })
        close()
      }
      finally {
        loading.value = false
      }
    },
  )
}
</script>

<template>
  <div class="scale-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      w="full"
      md:w="480px"
      :show-close="false"
      :z-index="2000"
      :close-on-click-modal="false"
    >
      <template #header />
      <div class="h-[420px] flex flex-col">
        <div class="flex justify-end">
          <div class="cursor-pointer hover:bg-[#ccc]" @click="close">
            <img class="z-10 block h-[20px] w-[20px]" :src="closeIcon" />
          </div>
        </div>
        <BasicInfo ref="basicInfoRef" />
        <div class="flex justify-center">
          <el-button
            type="primary"
            class="h-[46px] w-[280px] rounded-[8px]"
            :loading="loading"
            @click="handleSubmit"
          >
            申请内测
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
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
