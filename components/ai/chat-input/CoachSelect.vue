<script setup lang="ts">
import arrowIcon from '@/assets/svg/arrow-right.svg'
import { openWordcloudModal } from '~/components/modal/wordcloud/open'

interface Props {
  coachList?: any[]
}

const props = defineProps<Props>()

const emits = defineEmits(['handleSelect'])
const visible = ref(false)
const handleSelect = (val: any) => {
  emits('handleSelect', val)
  visible.value = false
}

const handleWordcloud = () => {
  openWordcloudModal()
  visible.value = false
}
</script>

<template>
  <div class="coach-select">
    <el-popover
      v-model:visible="visible"
      placement="top-start"
      effect="dark"
      trigger="click"
      :show-arrow="false"
      :popper-style="{
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '868px',
      }"
    >
      <template #reference>
        <div
          class="cursor-pointer rounded-[20px]"
          style="
            background:
              linear-gradient(90deg, #703edb 0%, #ea8cff 60%, #0c76ff 100%),
              #37303f;
          "
        >
          <div class="h-[40px] w-[134px]" flex="~ justify-center items-center">
            <div text="#E0E0E0 16px">AI Coach</div>
            <UiIcon
              icon="arrow-back-ios-new-rounded"
              text="#E0E0E0"
              class="ml-[10px] rotate-[270deg] transform transition-all duration-300 ease-in-out"
              :class="{
                'rotate-[90deg]': visible,
              }"
            />
          </div>
        </div>
      </template>
      <template #default>
        <div class="rounded-[16px] bg-[#43404B]" border="1px solid #5E5A68">
          <div class="w-full p-[20px]" flex="~" text="#CBCACC">
            <div flex="1">
              <div text="18px #fff" font="500">AI Coach</div>
              <div class="max-h-[260px] w-full overflow-y-auto">
                <div
                  v-for="coach in coachList"
                  :key="coach.value"
                  flex="~ justify-start items-center w-full"
                  class="mt-[20px] cursor-pointer"
                  @click="handleSelect(coach)"
                >
                  <img
                    :src="coach.icon"
                    class="mr-[20px] h-[40px] w-[40px] flex-shrink-0 rounded-[6px]"
                  />
                  <div text="16px">
                    {{ coach.label }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mx-[24px] w-[1px] bg-[#5E5A68]"></div>
            <div class="w-[180px]">
              <div text="18px #fff" font="500">Other Features</div>
              <div class="max-h-[260px] w-full w-full overflow-y-auto">
                <div
                  flex="~ justify-start items-center w-full"
                  class="mt-[20px] cursor-pointer"
                  @click="handleWordcloud"
                >
                  <img class="mr-[12px] h-[24px] w-[24px] flex-shrink-0" src="@/assets/images/icon/word-cloud.svg" />
                  <div text="16px">Word Cloud</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.coach-select {
  :deep(.el-popper) {
    padding: 0 !important;
  }
}
</style>
