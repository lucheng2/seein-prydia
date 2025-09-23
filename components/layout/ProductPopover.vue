<script setup lang="ts">
import IconChat from '@/assets/images/icon/chat.png'
import IconVoice from '@/assets/images/icon/voice.png'
import { openLoginModal } from '@/components/modal/login/open'
import { storeToRefs } from 'pinia'
import { openApplyForTestModal } from '~/components/modal/apply-for-test/open'

const { token } = storeToRefs(useUserStore())
const { fetchCheck } = useCheckChatRightStore()
const handleToAiChat = async () => {
  if (!token.value) {
    return openLoginModal()
  }
  else {
    const isChecked = await fetchCheck()
    if (isChecked) window.open('/ai/chat/new?new=true', '_blank')
    else openApplyForTestModal()
  }
}
</script>

<template>
  <div class="flex">
    <NuxtLink
      style="background: linear-gradient(180deg, #c6f1f6 0%, #f4fdff 100%)"
      class="cursor-pointer rounded-[12px] px-[19px] py-[16px]"
      flex="~ col justify-center items-center"
      border="1px solid #fff"
      hover:border="1px solid #43C3D1"
      @click="handleToAiChat"
    >
      <img class="h-[48px] w-[48px]" :src="IconChat" />
      <div text="#141414 18px" font="500">文字聊天</div>
    </NuxtLink>
    <NuxtLink
      to="/ai/voice"
      style="background: linear-gradient(180deg, #cde0ff 0%, #f2f9fd 100%)"
      class="ml-[12px] cursor-pointer rounded-[12px] px-[19px] py-[16px]"
      flex="~ col justify-center items-center"
      border="1px solid transparent"
      hover:border="1px solid #6792E8"
    >
      <img class="h-[48px] w-[48px]" :src="IconVoice" />
      <div text="#141414 18px" font="500">语音对话</div>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped></style>
