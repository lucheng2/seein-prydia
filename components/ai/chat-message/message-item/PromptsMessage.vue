<script setup lang="ts">
import Icon1 from '@/assets/images/ai/icon-tip-1.png'
import Icon2 from '@/assets/images/ai/icon-tip-2.png'
import Icon3 from '@/assets/images/ai/icon-tip-3.png'

interface Props {
  message?: any
}
const props = withDefaults(defineProps<Props>(), {
  message: () => ({}),
})

const emits = defineEmits(['on', 'handleHello'])

const arr = [
  {
    title: '了解心理',
    desc: '人为什么会焦虑',
    icon: Icon1,
    bgColor: 'linear-gradient(180deg, #EBFEF4 0%, #F4FEF9 100%)',
  },
  {
    title: '心理问题',
    desc: '抑郁症初期有什么症状',
    icon: Icon2,
    bgColor: 'linear-gradient(180deg, #FFEFF4 0%, #FFFAFB 100%)',
  },
  {
    title: '解决负面情绪',
    desc: '怎样摆脱焦虑或抑郁的情绪',
    icon: Icon3,
    bgColor: 'linear-gradient(180deg, #FEF5E8 0%, #FEFAF3 100%)',
  },
]
const handleClick = (content) => {
  emits('on', 'handleHello', { content })
  emits('handleHello', content)
}
</script>

<template>
  <div class="seein-prompts-message-item">
    <div class="seein-prompts-message-item__btns w-full flex-col md:flex-row">
      <div
        v-for="(item, index) in arr"
        :key="index + Math.random() * 100"
        class="seein-prompts-message-item__btns--item flex flex-1 md:block"
        :style="{ background: item.bgColor }"
        @click="handleClick(item.desc)"
      >
        <img :src="item.icon" class="mb-[12px] mr-[12px] h-[40px] w-[40px]" />
        <div>
          <div class="seein-prompts-message-item__btns--item-title mb-[6px]">
            <div class="text-[18px] font-500">{{ item.title }}</div>
          </div>
          <div class="seein-prompts-message-item__btns--item-desc">
            <div class="text-[14px] text-[#5E5E5E]">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.seein-prompts-message-item {
  width: 100%;
  display: flex;
  &__title {
    font-weight: 500;
    font-size: 24px;
    color: $color-text-1;
    line-height: 28px;
    margin-bottom: 10px;
  }
  &__content {
    font-size: 14px;
    color: #858585;
    line-height: 16px;
    margin-bottom: 20px;
  }
  &__btns {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    &--item {
      padding: 20px 24px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      &:hover {
        transform: translateY(-2px); /* 添加轻微上浮效果 */
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* 增强阴影层次 */
      }
    }
  }
}
</style>
