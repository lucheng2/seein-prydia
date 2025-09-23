<script setup lang="ts">
import imgHospital from '~/assets/images/solution/hospital.png'
import imgSchool from '~/assets/images/solution/school.png'
import { useGsap } from '~/hooks'

const arr = [
  {
    title: 'AI校园心理健康方案',
    content: [
      'AI校园心理健康方案可提供智能检测、24小时在线疏导、场景化干预等功能',
      '辅助校园心理健康老师完成问题分类、数据收集分析、报告生成、资料归档等工作',
      '辅助学校为学生提供更加全面、及时的心理健康教育和疏导服务，提升工作效率、提高学生学业表现',
    ],
    img: imgSchool,
  },
  {
    title: 'AI心理医疗解决方案',
    content: [
      '医疗级AI精神科、心理科诊疗辅助解决系统，连同医院端、心理咨询师端、患者端，打造不同登录入口',
      '可提供中重度患者出院后的生理、心理指标监测、用药数据收集、社会面心理咨询结果数据收集、及时预警、及时干预等功能',
      '协助医生更加全面的评估患者情况，更有针对性开具相应处方及药物',
    ],
    img: imgHospital,
  },
]

useGsap(({ isMobile, gsap }) => {
  let start = '95%'
  if (isMobile) {
    start = `120%`
  }
  return gsap.fromTo(
    '.seein-solution__wapper',
    { transform: 'translateY(-620px)', force3D: false },
    {
      transform: 'translateY(0px)',
      duration: 0.5,
      scrollTrigger: {
        trigger: '.seein-solution',
        scrub: true,
        start: `top ${start}`,
        end: `bottom ${start}`,
      },
    },
  )
})
</script>

<template>
  <div class="seein-solution">
    <div
      class="seein-solution__wapper px-[16px] md:px-0"
      bg="#062721"
      pt="120px"
      pb="80px"
      md:pb="180px"
      md:pt="200px"
    >
      <div class="seein-solution__title" text="32px" md:mt="120px" md:text="60px">
        <UiElementVisible content="解决方案" />
        <div
          class="seein-solution__subtitle"
          text="16px #F4F8F444 center "
          font="400"
          mb="32px"
          md:mb="90px"
          md:text="30px"
        >
          <UiElementVisible content="提供校园与心理医疗多种方案" />
        </div>
      </div>

      <div
        class="seein-solution__content"
        flex="col"
        md:flex="row justify-center items-center"
        gap="16px"
      >
        <div
          v-for="(item, index) in arr"
          :key="index"
          class="seein-solution__content--item min-h-[332px] w-full pb-[10px] md:w-[615px]"
        >
          <div
            class="seein-solution__content--item-left w-full rounded-[22px] bg-[rgb(31,61,55)] p-[40px]"
          >
            <div
              class="seein-solution__content--item-left-title"
              text="#F4F8F4 32px"
              relative
              z-1
            >
              <UiElementVisible :content="item.title" />
            </div>
            <div
              class="seein-solution__content--item-left-content"
              relative
              z-1
            >
              <div
                v-for="(content, contentIndex) in item.content"
                :key="contentIndex"
                class="seein-solution__content--item-left-content-item"
                text="#EDFFED 16px"
              >
                <div
                  class="seein-solution__content--item-left-content-item-text"
                >
                  <UiElementVisible :content="content" />
                </div>
              </div>
            </div>

            <div h="128px">
              <div w="184px" h="184px" bottom="10px" absolute right-0 z-0>
                <UiElementVisible>
                  <img :src="item.img" w="184px" h="184px" />
                </UiElementVisible>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-solution {
  &__title {
    font-weight: 500;
    text-align: center;
    padding-top: 52px;
    margin-bottom: 36px;
    color: #f4f8f4;
  }
  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    &--item {
      position: relative;
      background: linear-gradient(
        90deg,
        rgba(0, 183, 85, 1),
        rgba(34, 108, 234, 1)
      );
      border-radius: 30px;
      overflow: hidden; /* 确保伪元素圆角被裁剪 */
      display: flex;
      &-left {
        &-title {
          font-weight: 500;
          line-height: 32px;
          margin-bottom: 20px;
        }
        &-content {
          color: $color-text-3;
          line-height: 26px;
          &-item {
            display: flex;
            align-items: center;
            &-point {
              width: 6px;
              height: 6px;
              background: $brand-1;
              border-radius: 50%;
              margin-right: 14px;
              margin-top: 9px;
              align-self: flex-start;
            }
            &-text {
              flex: 1;
            }
            & + & {
              margin-top: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
