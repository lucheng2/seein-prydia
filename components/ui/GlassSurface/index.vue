<script setup lang="ts">
import { computed, type CSSProperties, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface GlassSurfaceProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  displace?: number
  backgroundOpacity?: number
  saturation?: number
  distortionScale?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
  xChannel?: 'R' | 'G' | 'B'
  yChannel?: 'R' | 'G' | 'B'
  mixBlendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'plus-darker'
    | 'plus-lighter'
  className?: string
  style?: CSSProperties
}

const props = withDefaults(defineProps<GlassSurfaceProps>(), {
  width: '',
  height: '',
  borderRadius: 20,
  borderWidth: 0.07,
  brightness: 70,
  opacity: 0.93,
  blur: 11,
  displace: 0.5,
  backgroundOpacity: 0,
  saturation: 1,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20,
  xChannel: 'R',
  yChannel: 'G',
  mixBlendMode: 'difference',
  className: '',
  style: () => ({}),
})

// 用于跟踪组件是否已挂载
const isMounted = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)
const feImageRef = ref<SVGElement | null>(null)
const redChannelRef = ref<SVGElement | null>(null)
const greenChannelRef = ref<SVGElement | null>(null)
const blueChannelRef = ref<SVGElement | null>(null)
const gaussianBlurRef = ref<SVGElement | null>(null)

const isDarkMode = ref(false)

// 确保在客户端执行
const updateDarkMode = () => {
  if (typeof window === 'undefined') return

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDarkMode.value = mediaQuery.matches

  const handler = (e: MediaQueryListEvent) => {
    isDarkMode.value = e.matches
  }

  mediaQuery.addEventListener('change', handler)

  return () => mediaQuery.removeEventListener('change', handler)
}

// 生成唯一ID - 使用基于时间的哈希避免SSR/CSR差异
const generateUniqueId = () => {
  if (typeof window === 'undefined') {
    return `ssr-id-${Math.floor(Math.random() * 1000000)}`
  }
  return `glass-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`
}

const uniqueId = ref(generateUniqueId())
const filterId = ref(`glass-filter-${uniqueId.value}`)
const redGradId = ref(`red-grad-${uniqueId.value}`)
const blueGradId = ref(`blue-grad-${uniqueId.value}`)

let resizeObserver: ResizeObserver | null = null

const generateDisplacementMap = () => {
  if (!containerRef.value) return ''

  const rect = containerRef.value.getBoundingClientRect()
  const actualWidth = rect?.width || 400
  const actualHeight = rect?.height || 200
  const edgeSize = Math.min(actualWidth, actualHeight) * (props.borderWidth * 0.5)

  const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId.value}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId.value}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${props.borderRadius}" fill="url(#${redGradId.value})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${props.borderRadius}" fill="url(#${blueGradId.value})" style="mix-blend-mode: ${props.mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${props.borderRadius}" fill="hsl(0 0% ${props.brightness}% / ${props.opacity})" style="filter:blur(${props.blur}px)" />
      </svg>
    `

  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`
}

const updateDisplacementMap = () => {
  if (feImageRef.value && isMounted.value) {
    feImageRef.value.setAttribute('href', generateDisplacementMap())
  }
}

const supportsSVGFilters = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  const isFirefox = /Firefox/.test(navigator.userAgent)

  if (isWebkit || isFirefox) {
    return false
  }

  const div = document.createElement('div')
  div.style.backdropFilter = `url(#${filterId.value})`
  return div.style.backdropFilter !== ''
}

const supportsBackdropFilter = () => {
  if (typeof window === 'undefined') return false
  return CSS.supports('backdrop-filter', 'blur(10px)')
}

const containerStyles = computed(() => {
  const baseStyles: Record<string, string | number> = {
    ...props.style,
    'width': typeof props.width === 'number' ? `${props.width}px` : props.width,
    'height': typeof props.height === 'number' ? `${props.height}px` : props.height,
    'borderRadius': `${props.borderRadius}px`,
    '--glass-frost': props.backgroundOpacity,
    '--glass-saturation': props.saturation,
  }

  // 在服务器端渲染时使用基础样式
  if (!isMounted.value) {
    return {
      ...baseStyles,
      background: `hsl(0 0% 100% / ${props.backgroundOpacity})`,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                  inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`,
    }
  }

  const svgSupported = supportsSVGFilters()
  const backdropFilterSupported = supportsBackdropFilter()

  if (svgSupported) {
    return {
      ...baseStyles,
      background: isDarkMode.value
        ? `hsl(0 0% 0% / ${props.backgroundOpacity})`
        : `hsl(0 0% 100% / ${props.backgroundOpacity})`,
      backdropFilter: `url(#${filterId.value}) saturate(${props.saturation})`,
      boxShadow: isDarkMode.value
        ? `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset,
           0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset,
           0px 4px 16px rgba(17, 17, 26, 0.05),
           0px 8px 24px rgba(17, 17, 26, 0.05),
           0px 16px 56px rgba(17, 17, 26, 0.05),
           0px 4px 16px rgba(17, 17, 26, 0.05) inset,
           0px 8px 24px rgba(17, 17, 26, 0.05) inset,
           0px 16px 56px rgba(17, 17, 26, 0.05) inset`
        : `0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset,
           0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset,
           0px 4px 16px rgba(17, 17, 26, 0.05),
           0px 8px 24px rgba(17, 17, 26, 0.05),
           0px 16px 56px rgba(17, 17, 26, 0.05),
           0px 4px 16px rgba(17, 17, 26, 0.05) inset,
           0px 8px 24px rgba(17, 17, 26, 0.05) inset,
           0px 16px 56px rgba(17, 17, 26, 0.05) inset`,
    }
  }
  else {
    if (isDarkMode.value) {
      if (!backdropFilterSupported) {
        return {
          ...baseStyles,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`,
        }
      }
      else {
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`,
        }
      }
    }
    else {
      if (!backdropFilterSupported) {
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`,
        }
      }
      else {
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2),
                      0 2px 16px 0 rgba(31, 38, 135, 0.1),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`,
        }
      }
    }
  }
})

const glassSurfaceClasses
  = 'relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out'

const focusVisibleClasses = computed(() => {
  return isDarkMode.value
    ? 'focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2'
    : 'focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2'
})

const updateFilterElements = () => {
  if (!isMounted.value) return

  const elements = [
    { ref: redChannelRef, offset: props.redOffset },
    { ref: greenChannelRef, offset: props.greenOffset },
    { ref: blueChannelRef, offset: props.blueOffset },
  ]

  elements.forEach(({ ref, offset }) => {
    if (ref.value) {
      ref.value.setAttribute('scale', (props.distortionScale + offset).toString())
      ref.value.setAttribute('xChannelSelector', props.xChannel)
      ref.value.setAttribute('yChannelSelector', props.yChannel)
    }
  })

  if (gaussianBlurRef.value) {
    gaussianBlurRef.value.setAttribute('stdDeviation', props.displace.toString())
  }
}

const setupResizeObserver = () => {
  if (!containerRef.value || typeof ResizeObserver === 'undefined') return

  resizeObserver = new ResizeObserver(() => {
    setTimeout(updateDisplacementMap, 0)
  })

  resizeObserver.observe(containerRef.value)
}

watch(
  [
    () => props.width,
    () => props.height,
    () => props.borderRadius,
    () => props.borderWidth,
    () => props.brightness,
    () => props.opacity,
    () => props.blur,
    () => props.displace,
    () => props.distortionScale,
    () => props.redOffset,
    () => props.greenOffset,
    () => props.blueOffset,
    () => props.xChannel,
    () => props.yChannel,
    () => props.mixBlendMode,
  ],
  () => {
    if (!isMounted.value) return
    updateDisplacementMap()
    updateFilterElements()
  },
)

watch([() => props.width, () => props.height], () => {
  if (!isMounted.value) return
  setTimeout(updateDisplacementMap, 0)
})

onMounted(() => {
  isMounted.value = true
  const cleanup = updateDarkMode()

  nextTick(() => {
    // 重新生成ID以确保客户端唯一性
    uniqueId.value = generateUniqueId()
    filterId.value = `glass-filter-${uniqueId.value}`
    redGradId.value = `red-grad-${uniqueId.value}`
    blueGradId.value = `blue-grad-${uniqueId.value}`

    updateDisplacementMap()
    updateFilterElements()
    setupResizeObserver()
  })

  onUnmounted(() => {
    if (cleanup) cleanup()
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })
})
</script>

<template>
  <div ref="containerRef" :class="[glassSurfaceClasses, focusVisibleClasses, className]" :style="containerStyles">
    <!-- 只在客户端渲染SVG滤镜 -->
    <svg v-if="isMounted" class="pointer-events-none absolute inset-0 h-full w-full opacity-0 -z-10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter :id="filterId" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
          <feImage ref="feImageRef" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

          <feDisplacementMap id="redchannel" ref="redChannelRef" in="SourceGraphic" in2="map" result="dispRed" />
          <feColorMatrix
            in="dispRed"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="red"
          />

          <feDisplacementMap id="greenchannel" ref="greenChannelRef" in="SourceGraphic" in2="map" result="dispGreen" />
          <feColorMatrix
            in="dispGreen"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="green"
          />

          <feDisplacementMap id="bluechannel" ref="blueChannelRef" in="SourceGraphic" in2="map" result="dispBlue" />
          <feColorMatrix
            in="dispBlue"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blue"
          />

          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur ref="gaussianBlurRef" in="output" stdDeviation="0.7" />
        </filter>
      </defs>
    </svg>

    <div class="relative z-10 h-full w-full flex items-center justify-center rounded-[inherit] p-2">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 添加平滑过渡效果 */
div {
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}
</style>
