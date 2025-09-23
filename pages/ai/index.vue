<script lang="ts" setup>
import { homeRouteList } from '@/constants/home'
import { openLoginModal } from '~/components/modal/login/open'

defineOptions({
  name: 'AIChat',
})
useHead({
  title: 'AI聊天',
})
const { token } = storeToRefs(useUserStore())
const handleToAiChat = () => {
  if (!token.value) openLoginModal()
  else window.open('/ai/chat/new?new=true', '_blank')
}
</script>

<template>
  <NuxtLayout :route-list="homeRouteList" name="chat">
    <template #content>
      <div class="seein-ai px-[16px] pt-[84px] md:px-0">
        <div class="seein-ai__content md:mt-[80px]">
          <div class="seein-ai__content-title">
            <div>你好！</div>
            <div>我是Seein</div>
          </div>
          <div class="seein-ai__content-desc">
            你的一站式心理管家，助你更好地了解自己；随时随地，聆听你的心声；科学减压，轻松拥有好心情。
          </div>
          <div class="seein-ai__content-select">选择一个咨询模式吧</div>
          <div class="seein-ai__content-card flex flex-col md:flex-row md:justify-between">
            <div class="seein-ai__content-card-item mb-[20px] md:mb-0 md:w-[450px]" @click="handleToAiChat">
              <div class="seein-ai__content-card-item-title">文字聊天</div>
              <img src="@/assets/images/ai/chat.png" alt="" />
            </div>
            <NuxtLink class="seein-ai__content-card-item md:ml-[20px] md:w-[450px]" to="/ai/voice">
              <div class="seein-ai__content-card-item-title">语音聊天</div>
              <img src="@/assets/images/ai/voice.png" alt="" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.seein-ai {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 84px);
  &__content {
    &-title {
      font-weight: 600;
      font-size: 24px;
      color: #000000;
      line-height: 28px;
      margin-bottom: 10px;
    }
    &-desc {
      font-size: 14px;
      color: $color-text-3;
      line-height: 16px;
      margin-bottom: 29px;
    }
    &-select {
      font-size: 14px;
      color: $color-text-2;
      line-height: 16px;
      margin-bottom: 12px;
    }
    &-card {
      cursor: pointer;
      &-item {
        position: relative;
        height: 204px;
        padding: 40px;
        &-title {
          position: relative;
          font-weight: 600;
          font-size: 32px;
          color: $color-text-1;
          line-height: 38px;
          z-index: 2;
        }
        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
      }
    }
  }
}
</style>
