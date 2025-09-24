<script setup lang="ts">
interface Props {
  radius?: number
  fixBorderWidth?: boolean
  borderWidth?: number
  borderColor?: string
  rotatingWidth?: string
  rotatingHeight?: string
  background?: string

}

const props = withDefaults(defineProps<Props>(), {
  radius: 20,
  fixBorderWidth: false,
  borderWidth: 1,
  borderColor: `conic-gradient(
    from 0deg at 50% 50%,
    #00c3ff 0%,
    #7b2ff7 25%,
    #00f2c3 55%,
    #ffe600 85%,
    #00c3ff 100%
  )`,
  rotatingWidth: '500%',
  rotatingHeight: '500%',
  background: '#1E1F25',
})
const _borderRadius = computed(() => `${props.radius}px`)
const _webkitMask = computed(() => {
  const styleText = `transparent ${props.radius - 1}px, black ${props.radius}px`
  return `
    radial-gradient(circle at top left, ${styleText}),
    radial-gradient(circle at top right, ${styleText}),
    radial-gradient(circle at bottom left, ${styleText}),
    radial-gradient(circle at bottom right, ${styleText});
  `
})
const _borderWidth = computed(() => {
  if (props.fixBorderWidth) {
    return `${props.borderWidth - 0.8}px ${props.borderWidth}px`
  }
  return `${props.borderWidth}px`
})
</script>

<template>
  <div class="card">
    <div class="gradient-overlay"></div>
    <div class="z-9 h-full w-full">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  height: fit-content;
  background: v-bind(background);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 使用 mask 替代 overflow: hidden */
  -webkit-mask: v-bind(_webkitMask);
  -webkit-mask-composite: intersect;
  border-radius: v-bind(_borderRadius);
}

/* Rotating background with gradient and glow */
.card::before {
  content: "";
  position: absolute;
  width: v-bind(rotatingWidth);
  height: v-bind(rotatingHeight);
  background: v-bind(borderColor);
  animation: rotateAnim 5s linear infinite;
  filter: blur(10px) brightness(1.2);
  z-index: 0;
}

/* Inner mask */
.card::after {
  content: "";
  position: absolute;
  inset: v-bind(_borderWidth);
  background: v-bind(background);
  border-radius: v-bind(_borderRadius);
  z-index: 1;
  box-shadow: inset 0 0 20px rgba(0, 183, 255, 0.1); /* subtle inner glow */
}

/* Optional radial gradient overlay */
.card .gradient-overlay {
  position: absolute;
  width: v-bind(rotatingWidth);
  height: v-bind(rotatingHeight);
  background: radial-gradient(circle at center, transparent 40%, #07182e 80%);
  z-index: 1;
}

/* Rotating animation */
@keyframes rotateAnim {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
