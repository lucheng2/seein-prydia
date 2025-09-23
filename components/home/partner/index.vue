<script setup lang="ts"></script>

<template>
  <div class="seein-partner" flex="~ col justify-center" md:min-h="80vh">
    <UiElementVisible class="seein-partner__title">合作客户</UiElementVisible>
    <UiElementVisible class="seein-partner__subtitle">
      赢得众多国内外企业及机构新信任，覆盖全生态
    </UiElementVisible>
    <div class="seein-partner__content">
      <div class="seein-partner__content-row">
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/1.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/2.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/3.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/4.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/5.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/6.png" />
        </UiElementVisible>
      </div>
      <div class="seein-partner__content-row">
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/7.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/8.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/9.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/10.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/11.png" />
        </UiElementVisible>
        <UiElementVisible class="row-card">
          <img src="@/assets/images/partner/12.png" />
        </UiElementVisible>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-partner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 62px;

  &__title {
    font-weight: 500;
    font-size: 32px;
    color: $color-text-1;
    margin-bottom: 6px;
  }

  &__subtitle {
    font-size: 16px;
    color: $color-text-3;
    margin-bottom: 36px;
  }

  &__content {
    &-row {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      .row-card {
        display: flex;
        justify-content: center;
        align-self: center;
        flex-shrink: 0;
        img {
          width: 200px;
        }
        margin-bottom: 16px;
        &:not(:last-child) {
          margin-right: 16px;
        }
      }

      &:not(:last-child) {
        margin-bottom: 36px;
      }
      &.first {
        .row-card {
          &:not(:last-child) {
            margin-right: 82px;
          }
        }
      }
    }
  }
}
</style>
