<script setup lang="ts">
import bgImg from '@/assets/images/bg.png'

const useBg = () => {
  const revealImgRef = useTemplateRef<any>('revealImgRef')
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const el = revealImgRef.value
    if (el) {
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
    }
  }

  const handleMouseLeave = () => {
    const el = revealImgRef.value
    if (el) {
      el.style.setProperty('--mx', '-9999px')
      el.style.setProperty('--my', '-9999px')
    }
  }

  return {
    revealImgRef,
    handleMouseMove,
    handleMouseLeave,
  }
}

const { revealImgRef, handleMouseMove, handleMouseLeave } = useBg()

defineExpose({
  revealImgRef,
  handleMouseMove,
  handleMouseLeave,
})
</script>

<template>
  <ClientOnly>
    <img
      ref="revealImgRef"
      :src="bgImg"
      alt="Reveal effect"
      style="
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 5;
        mix-blend-mode: lighten;
        opacity: 1;
        pointer-events: none;
        --mx: -9999px;
        --my: -9999px;
        -webkit-mask-image: radial-gradient(
          circle at var(--mx) var(--my),
          rgba(255, 255, 255, 1) 0px,
          rgba(255, 255, 255, 0.95) 60px,
          rgba(255, 255, 255, 0.6) 120px,
          rgba(255, 255, 255, 0.25) 180px,
          rgba(255, 255, 255, 0) 240px
        );
        mask-image: radial-gradient(
          circle at var(--mx) var(--my),
          rgba(255, 255, 255, 1) 0px,
          rgba(255, 255, 255, 0.95) 60px,
          rgba(255, 255, 255, 0.6) 120px,
          rgba(255, 255, 255, 0.25) 180px,
          rgba(255, 255, 255, 0) 240px
        );
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
      "
    />
  </ClientOnly>
</template>

<style lang="scss" scoped>
</style>
