<script setup lang="ts"></script>

<template>
  <div class="chat-hello-content hello pt-[12px]" flex="~ col items-center">
    <div text="100px #FFFFFF center">SEREIN</div>
    <div text="60px #FFFFFF center" class="mb-[40px]">
      GENTLE RAIN FOR THE SOUL
    </div>
    <UiCard class="mb-[12px]" rotating-height="1000%" rotating-width="1000%">
      <AiChatInput class="w-[900px]" />
    </UiCard>
    <div flex="~" class="w-[900px] flex-wrap gap-[12px]" text="18px #F5F7FA">
      <UiCard class="w-[444px] cursor-pointer">
        <div p="20px 16px" flex="~ items-center">
          <img
            class="mr-[24px] h-[50px] w-[50px] flex-shrink-0 rounded-[6px]"
          />
          <div>How to tell my family that l'm coming out?</div>
        </div>
      </UiCard>
      <UiCard class="w-[444px] cursor-pointer">
        <div p="20px 16px" flex="~ items-center">
          <img
            class="mr-[24px] h-[50px] w-[50px] flex-shrink-0 rounded-[6px]"
          />
          <div>How to deal with others' strange looks and doubts?</div>
        </div>
      </UiCard>
      <UiCard class="w-[444px] cursor-pointer">
        <div p="20px 16px" flex="~ items-center">
          <img
            class="mr-[24px] h-[50px] w-[50px] flex-shrink-0 rounded-[6px]"
          />
          <div>How to help parents accept your sexual orientation?</div>
        </div>
      </UiCard>
      <UiCard class="w-[444px] cursor-pointer">
        <div p="20px 16px" flex="~ items-center">
          <img
            class="mr-[24px] h-[50px] w-[50px] flex-shrink-0 rounded-[6px]"
          />
          <div>How to express love to the same-sex person you like?</div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-hello-content {
  height: calc(100vh - 94px - 24px);
}
</style>
