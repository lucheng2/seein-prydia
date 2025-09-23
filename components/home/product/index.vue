<script setup lang="ts">
import img1 from '@/assets/images/product/1.png'
import img2 from '@/assets/images/product/2.png'
import img3 from '@/assets/images/product/3.png'
import { openLoginModal } from '@/components/modal/login/open'
import { useView } from '~/hooks'

const arr = [
  {
    img: img1,
    btn: '查看详情',
    title: 'Seein心理大模型',
    content:
      'Seein利用真实心理咨询对话数据、心理学流派数据、情绪识别数据、通用数据进行训练，集成实时打断、控制、多模态交互等能力，能够提供文字交互、语音交互、视频交互等功能，同时能够基于用户语音的细微变化与面部微表情的变化精准捕捉当前情绪并给出反馈，可为用户提供及时的心理咨询和疏导服务。',
    path: '/ai/chat/new?new=true',
    traget: '_self',
  },
  {
    img: img2,
    btn: '查看详情',
    title: 'AI心理咨询师（CBT）',
    content:
      '在Seein模型基础上针对CBT方向进行增量预训练与微调，辅助咨询流程框架，可自主完成50分钟完整咨询对话，遵循客观、中立立场为用户提供完整AI心理咨询服务，适合情绪、焦虑、抑郁、负面思维、自尊等问题困扰。',
    path: 'https://dev.seein.life:2443/',
    traget: '_blank',
  },
  {
    img: img3,
    btn: '即将开放 敬请期待',
    disabled: true,
    title: 'AI心理咨询师（叙事疗法）',
    content:
      '在Seein模型基础上针对叙事疗法方向进行增量预训练与微调，辅助咨询流程框架，可自主完成50分钟完整咨询对话，遵循客观、中立立场为用户提供完整AI心理咨询服务，适合个人成长、家庭关系、人际关系等问题困扰。',
    traget: '_self',
  },
]
const { token } = storeToRefs(useUserStore())
const handleNav = (path: string, traget: string = '_self') => {
  if (traget === '_blank') {
    if (token.value) {
      window.open(path, '_blank')
    }
    else {
      openLoginModal()
    }
  }
  else {
    navigateTo(path)
  }
}
const { isMobile } = useView()
</script>

<template>
  <div md:flex="~ items-center justify-center" pb="60px">
    <div
      class="seein-product px-[16px] md:w-[1200px] md:px-0"
      flex="~ col"
      md:flex="row"
      md:mb="180px"
    >
      <div
        class="seein-product__title mb-[12px] flex-shrink-0"
        md:text="60px left"
        text="32px center"
        font="600"
        relative
      >
        <el-affix target=".seein-product__title" :offset="isMobile ? 0 : 360">
          <UiElementVisible content="我们的产品" />
          <div
            flex="~ justify-center"
            gap="8px"
            text="16px"
            font="300"
            md:flex="col"
            md:gap="0"
            md:text="32px"
          >
            <UiElementVisible content="OUR" />
            <UiElementVisible content="PRODUCTS" />
          </div>
        </el-affix>
      </div>
      <div
        class="seein-product__content"
        flex="~ col items-center"
        md:flex="~ col justify-between"
        md:ml="242px"
        md:h="120vh"
      >
        <div
          v-for="(item, index) in arr"
          :key="index"
          class="seein-product__content--item w-full"
        >
          <UiElementVisible
            :content="item.title"
            class="seein-product__content--item-title"
            text="24px"
            md:text="32px"
          />
          <UiElementVisible
            :content="item.content"
            class="seein-product__content--item-content"
            text="15px"
          />
          <NuxtLink
            class="seein-product__content--item-btn"
            @click="handleNav(item.path, item.traget)"
          >
            <UiElementVisible>
              <UiTextLink
                :disabled="item.disabled"
                :hover:text="`${item.disabled ? '' : '#007B43'}`"
                class="flex"
              >
                <div class="flex items-center">
                  {{ item.btn }}
                  <UiSvgIcon
                    class="seein-product__content--item-btn-icon"
                    name="arrow-right-top"
                  />
                </div>
              </UiTextLink>
            </UiElementVisible>
          </NuxtLink>
          <UiElementVisible v-if="index !== arr.length - 1">
            <div h="1px" w-full bg="#728D88"></div>
          </UiElementVisible>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-product {
  &__title {
    font-weight: 500;
    color: #062721;
  }
  &__content {
    display: flex;
    gap: 24px;
    &--item {
      display: flex;
      flex-direction: column;

      &-title {
        font-weight: 600;
        color: #062721;
        margin-bottom: 20px;
      }

      &-content {
        color: #062721;
        margin-bottom: 28px;
      }

      &-btn {
        margin-bottom: 28px;
        align-self: flex-end;
        font-size: 14px;
        color: #062721;
        line-height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        &-icon {
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
