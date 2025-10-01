<script setup lang="ts">
import * as api from '@/apis'
import copyIcon from '@/assets/images/ai/copy.png'
import dislikeActiveIcon from '@/assets/images/ai/icon-dislike-active.png'
import dislikeIcon from '@/assets/images/ai/icon-dislike.png'
import likeActiveIcon from '@/assets/images/ai/icon-like-active.png'
import likeIcon from '@/assets/images/ai/icon-like.png'
import regenerateIcon from '@/assets/images/ai/regenerate.png'

const props = defineProps<Props>()
const emits = defineEmits(['regenerate', 'copy'])
interface Props {
  messageId: string
  showLike: boolean
  showRegenerate: boolean
}
const activeVal = ref([])
const otherVal = ref('')
const likeType = ref('')
const btnArray = ref([
  'Hazardous/Unsafe',
  'Disinformation',
  'No help',
  'Answering irrelevantly',
  'Other',
])
// 是否已经提交过
const isSubmit = ref(false)
const close = () => (likeType.value = '')

const handleActive = (item: string) => {
  const findIndex = activeVal.value.findIndex((i: string) => i === item)
  if (findIndex > -1) {
    activeVal.value.splice(findIndex, 1)
  }
  else {
    activeVal.value.push(item)
  }
}

const handleLike = () => {
  if (isSubmit.value) return
  likeType.value = 'like'
  submit({ likeDislike: 'LIKE' })
}

const handleDislike = () => {
  if (isSubmit.value) return
  likeType.value = 'dislike'
}

const handleRegenerate = () => {
  emits('regenerate')
}

const handleCopy = () => {
  emits('copy')
}

const submitDislike = () => {
  if (!activeVal.value.length)
    return message('Please select the reason for the negative review', { type: 'warning' })
  submit({
    likeDislike: 'DISLIKE',
    reason: activeVal.value.join(','),
    other: otherVal.value,
  })
}
const submit = async (params: any) => {
  if (isSubmit.value) return
  await api.likeMessage({
    platformType: 'WEBSITE',
    messageId: props.messageId,
    ...params,
  })
  isSubmit.value = true
  message('Submit successfully', { type: 'success' })
}
</script>

<template>
  <div
    v-if="showLike || showRegenerate"
    class="seein-ai-message-like mt-[6px] gap-[6px]"
  >
    <template v-if="showLike">
      <div
        class="flex cursor-pointer items-center rounded-[6px] p-[2px] hover:bg-gray-700"
        @click="handleLike"
      >
        <UiIcon
          class="h-[20px] w-[20px] text-[#858585]"
          :icon="
            likeType === 'like'
              ? 'thumb-up-rounded'
              : 'thumb-up-outline-rounded'
          "
        />
      </div>
      <div
      class="flex cursor-pointer items-center rounded-[6px] p-[2px] hover:bg-gray-700"
        @click="handleDislike"
      >
        <UiIcon
          class="h-[20px] w-[20px] text-[#858585]"
          :icon="
            likeType === 'dislike'
              ? 'thumb-down-rounded'
              : 'thumb-down-outline-rounded'
          "
        />
      </div>
    </template>
    <div
      v-if="showRegenerate"
      class="flex cursor-pointer items-center rounded-[6px] p-[2px] hover:bg-gray-700"
      @click="handleCopy"
    >
      <img
        class="h-[20px] w-[20px] text-[#858585]"
        :src="copyIcon"
      />
    </div>
    <div
      v-if="showRegenerate"
      class="flex cursor-pointer items-center rounded-[6px] p-[2px] hover:bg-gray-700"
      @click="handleRegenerate"
    >
      <UiIcon
        class="h-[20px] w-[20px] text-[#858585]"
        icon="refresh-3-line"
      />
    </div>
  </div>
  <div
    v-if="likeType === 'dislike' && !isSubmit"
    class="mt-[10px] border border-[#F0F0F0] rounded-[12px] border-solid bg-[#fff] px-[16px] py-[12px]"
  >
    <div>
      <div
        class="mb-[12px] flex justify-between text-[14px] text-[#141414] font-500"
      >
        Please tell us the reason (multiple choice)：
        <div class="cursor-pointer" @click="close">
          <img src="@/assets/images/icon/close.png" class="h-[14px] w-[14px]" />
        </div>
      </div>
      <div class="flex flex-wrap gap-[20px]">
        <div
          v-for="(item, index) in btnArray"
          :key="index"
          :class="{
            active: activeVal.includes(item),
          }"
          class="cursor-pointer border border-[#E0E0E0] rounded-[6px] border-solid p-[5px] text-center text-[14px] hover:bg-[#F5F7FA]"
          @click="handleActive(item)"
        >
          {{ item }}
        </div>
      </div>
    </div>
    <div class="mt-[6px] flex">
      <div class="flex-1">
        <el-input
          v-if="activeVal.includes('Other')"
          v-model="otherVal"
          class="h-[34px]"
          placeholder="(Optional) Tell us more about your user experience and help us optimize it~"
        />
      </div>
      <el-button
        type="primary"
        class="ml-[20px] h-[34px]"
        @click="submitDislike"
      >
        Submit
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.active {
  background-color: #e9f7ee;
  border-color: $brand-1;
  color: $brand-1;
}
.seein-ai-message-like {
  display: flex;
  justify-content: flex-start;
}
</style>
