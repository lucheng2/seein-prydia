<script setup lang="ts"></script>

<template>
  <div
    class="seein-introduce flex flex-col justify-center px-[16px] md:px-0"
  >
    <div class="seein-introduce__title text-[38px] md:text-[90px]">
      <UiElementVisible>
        <UiGradientText
          text="夕起于心 智护于里"
          :colors="['#45BB19', '#334D9A', '#168D77']"
          :animation-speed="12"
          :show-border="false"
        ></UiGradientText>
      </UiElementVisible>
    </div>
    <div class="seein-introduce__subtitle text-center text-[16px] md:text-[40px]">
      <UiElementVisible content="从预防到临床治疗的全链路AI心理诊疗范式" />
    </div>
    <div h="160px"></div>
  </div>
</template>

<style lang="scss" scoped>
.seein-introduce {
  position: relative;
  height: 100vh;

  &__title {
    font-weight: 600;
    color: $color-text-1;
    margin-bottom: 12px;
    margin-top: 32px;
  }

  &__subtitle {
    font-weight: 400;
    color: $color-text-1;
  }

  &__bg {
    position: absolute;
    top: 0;
    z-index: -1;
    height: 100%;
  }
}
</style>
