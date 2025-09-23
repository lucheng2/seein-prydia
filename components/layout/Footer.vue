<script setup lang="ts">
import { useGsap } from '~/hooks'

useGsap(({ isMobile, gsap }) => {
  let transform = 'translateY(-500px)'
  if (isMobile) {
    transform = 'translateY(-600px)'
  }
  return gsap.fromTo(
    '.seein-footer__wapper',
    { transform },
    {
      transform: 'translateY(-0px)',
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.seein-footer',
        scrub: true,
        start: 'top 80%',
        end: 'bottom 100%',
      },
    },
  )
})
</script>

<template>
  <div class="seein-footer">
    <div class="seein-footer__wapper px-[16px] md:px-0">
      <div class="h-[60px] md:h-[90px]" />
      <div class="flex flex-col md:flex-row md:justify-center">
        <div class="seein-footer__item">
          <UiElementVisible class="seein-footer__item--title">
            心理产品
          </UiElementVisible>
          <div class="seein-footer__item--content">
            <UiElementVisible class="wx-code">
              <img src="@/assets/images/wx-code.png" alt="微信二维码" />
            </UiElementVisible>
            <div class="wx-links">
              <UiElementVisible> 访问“汐里心理”小程序 </UiElementVisible>
              <div class="links flex flex-wrap">
                <NuxtLink class="link" to="/">
                  <UiElementVisible content="心理评估" />
                </NuxtLink>
                <NuxtLink class="link" to="/">
                  <UiElementVisible content="定制方案" />
                </NuxtLink>
                <NuxtLink class="link" to="/">
                  <UiElementVisible content="数字心理" />
                </NuxtLink>
                <NuxtLink class="link" to="/">
                  <UiElementVisible content="心理咨询" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div class="seein-footer__item mt-[16px] md:mt-0">
          <UiElementVisible class="seein-footer__item--title">
            咨询师
          </UiElementVisible>
          <div class="seein-footer__item--content links">
            <NuxtLink class="link" to="/">
              <UiElementVisible content="申请入驻" />
            </NuxtLink>
          </div>
        </div>
        <div class="seein-footer__item mt-[16px] md:mt-0">
          <UiElementVisible class="seein-footer__item--title">
            关于
          </UiElementVisible>
          <div class="seein-footer__item--content links">
            <NuxtLink class="link" to="/about">
              <UiElementVisible content="关于我们" />
            </NuxtLink>
            <NuxtLink class="link" to="/">
              <UiElementVisible content="联系我们 shangwu@xilikeji.cn" />
            </NuxtLink>
            <NuxtLink class="link" to="/">
              <UiElementVisible content="商务合作 吴经理 17710548605" />
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="h-[40px]" />
      <div class="seein-footer__copyright">
        <UiElementVisible
          content="Copyright @ 2024 夕里科技 京ICP备2024062754号-1"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-footer {
  background-color: #062721;
  color: #fff;

  .seein-footer__item {
    font-size: 14px;
    flex-shrink: 0;
    .seein-footer__item--title {
      font-weight: 600;
      font-size: 20px;
      color: #ffffff;
      line-height: 23px;
      margin-bottom: 24px;
      flex-shrink: 0;
    }

    .seein-footer__item--content {
      display: flex;

      .wx-code {
        width: 90px;
        height: 90px;
        margin-right: 20px;
        flex-shrink: 0;
      }

      .wx-links {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-shrink: 0;
        .links {
          margin-top: 12px;

          .link {
            &:not(:last-child) {
              margin-right: 12px;
            }
          }
        }
      }
    }

    .seein-footer__item--content.links {
      display: flex;
      flex-direction: column;

      .link {
        flex-shrink: 0;
        margin-bottom: 12px;
      }
    }

    &:not(:last-child) {
      margin-right: 278px;
    }
  }

  .seein-footer__copyright {
    margin-top: 40px;
    padding-bottom: 100px;
    font-size: 13px;
    color: #ffffff;
    text-align: center;
  }
}
</style>
