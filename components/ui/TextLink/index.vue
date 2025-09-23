<script setup lang="ts">
import { gsap } from 'gsap'

interface Props {
  content?: string
  disabled?: boolean
}
const props = defineProps<Props>()
const linkTextRef = ref<HTMLElement>()
onMounted(() => {
  linkTextRef.value?.addEventListener('mouseenter', () => {
    if (props.disabled) return
    const t = linkTextRef.value
    t.classList.add('is-anim')
    gsap.killTweensOf(t.querySelector('.js-link-text__hover'))
    gsap.killTweensOf(t.querySelector('.js-link-text__label'))
    gsap.fromTo(
      t.querySelector('.js-link-text__hover'),
      0.8,
      {
        ease: 'power4.out',
        y: '100%',
        x: '0%',
        rotate: '0deg',
      },
      {
        ease: 'power4.out',
        y: '-100%',
        x: '0%',
        rotate: '0',
      },
    )
    gsap.fromTo(
      t.querySelector('.js-link-text__label'),
      0.2,
      {
        ease: 'power1.in',
        y: '0',
        x: '0%',
      },
      {
        ease: 'power1.in',
        y: '-100%',
        x: '-0%',
        rotate: '0deg',
      },
    )
  })
  linkTextRef.value?.addEventListener('mouseleave', () => {
    const t = linkTextRef.value
    t.classList.remove('is-anim')
  })
})
</script>

<template>
  <span ref="linkTextRef" class="js-link-text__in">
    <span class="js-link-text__label" style="transform: translate(0%, -100%)">
      <template v-if="!$slots.default">{{ content }}</template>
      <slot v-else />
    </span>
    <span class="js-link-text__hover" style="transform: translate(0%, -100%)">
      <template v-if="!$slots.default">{{ content }}</template> <slot v-else /></span>
  </span>
</template>

<style lang="scss" scoped></style>
