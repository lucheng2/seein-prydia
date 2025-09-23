<script setup lang="ts">
import closeIcon from '@/assets/images/icon/close.png'

const props = defineProps<Props>()

const emits = defineEmits(['change'])

const { userInfo } = storeToRefs(useUserStore())
const nickname = computed(() => userInfo.value?.nickname || `用户${userInfo.value?.phone}`)

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

const handleTo = (path: string) => {
  window.open(path, '_blank')
}
</script>

<template>
  <div class="setting-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      class="w-[80%] md:w-[290px]"
      :show-close="false"
      :z-index="2000"
    >
      <template #header />
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <div></div>
          <div
            class="cursor-pointer rounded-[3px] transition-all hover:bg-[#ccc]"
            @click="close"
          >
            <img class="z-10 block h-[20px] w-[20px]" :src="closeIcon" />
          </div>
        </div>
        <div class="flex flex-1 flex-col px-[26px]">
          <div
            class="mb-[16px] flex items-center justify-between pb-[16px]"
            border-b="1px solid #F0F0F0"
            text="#141414 14px"
          >
            <label class="min-w-[80px]">用户名</label>
            <div>{{ nickname }}</div>
          </div>
          <div
            class="mb-[16px] flex items-center justify-between pb-[16px]"
            border-b="1px solid #F0F0F0"
            text="#141414 14px"
          >
            <label class="min-w-[80px]">登录手机号</label>
            <div>{{ userInfo?.phone }}</div>
          </div>
          <div
            class="mb-[16px] flex items-center justify-between pb-[16px]"
            border-b="1px solid #F0F0F0"
            text="#141414 14px"
          >
            <label class="min-w-[80px]">用户协议</label>
            <UiTextLink class="cursor-pointer">
              <NuxtLink
                class="flex items-center text-[#00B755]"
                @click="handleTo('/legal/terms')"
              >
                查看<UiSvgIcon name="arrow-right" class="ml-[6px]" />
              </NuxtLink>
            </UiTextLink>
          </div>
          <div
            class="flex items-center justify-between pb-[16px]"
            text="#141414 14px"
          >
            <label class="min-w-[80px]">隐私政策</label>
            <UiTextLink class="cursor-pointer">
              <NuxtLink
                class="flex items-center text-[#00B755]"
                @click="handleTo('/legal/privacy')"
              >
                查看<UiSvgIcon name="arrow-right" class="ml-[6px]" />
              </NuxtLink>
            </UiTextLink>
          </div>
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
