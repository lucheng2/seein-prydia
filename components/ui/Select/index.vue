<script setup lang="ts">
import type { SelectOption } from './types'

interface Props {
  options: SelectOption[]
}

const props = defineProps<Props>()
const emits = defineEmits(['handleSelect'])
const modelValue = defineModel('modelValue', { required: true })
const currentItem = computed(() => {
  return props.options?.find(item => item.value === modelValue.value)
})
const handleSelect = (item: SelectOption) => {
  if (item.value === modelValue.value) return
  modelValue.value = item.value
  emits('handleSelect', item)
}
</script>

<template>
  <el-popover
    class="box-item"
    placement="bottom-start"
    trigger="click"
    popper-style="border-radius: 12px;"
    :show-arrow="false"
  >
    <template #reference>
      <UiCard
        style="width: fit-content;min-width: 160px; cursor: pointer; "
        border-color="linear-gradient(102deg, rgba(106, 78, 167, 0), rgba(106, 78, 167, 1))"
        rotating-height="100%"
        rotating-width="100%"
      >
        <div flex="~ items-center justify-start" class="px-[16px] py-[6px]">
          <div text="#E0E0E0 16px">{{ currentItem?.label || 'Pleace select' }}</div>
        </div>
      </UiCard>
    </template>
    <div flex="~ col">
      <div
        v-for="item in options"
        :key="item.value"
        :class="{
          'bg-gray-700': modelValue === item.value,
        }"
        class="w-full cursor-pointer rounded-[6px] p-[6px] hover:bg-gray-700"
        text="#E0E0E0"
        @click="handleSelect(item)"
      >
        {{ item.label }}
      </div>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped></style>
