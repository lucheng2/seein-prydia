<script>
export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#000',
    },
    hoverColor: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 16,
    },
  },
  setup(props) {
    const psd = import.meta.env.VITE_PSD
    const svgRef = ref(null)

    // 处理颜色变化的方法
    const handleMouseEnter = () => {
      if (props.hoverColor) {
        setColor(props.hoverColor)
      }
    }

    const handleMouseLeave = () => {
      setColor(props.color)
    }

    const setColor = (color) => {
      if (svgRef.value) {
        const useElement = svgRef.value.querySelector('use')
        if (useElement) {
          // 创建一个克隆节点，这样可以直接修改样式
          const svgClone = document.importNode(useElement.href.baseVal.ownerDocument.documentElement, true)
          const pathElements = svgClone.querySelectorAll('path, circle, rect, polygon')

          pathElements.forEach((el) => {
            el.setAttribute('fill', color)
          })

          // 清空原内容并添加克隆的SVG
          svgRef.value.innerHTML = ''
          svgRef.value.appendChild(svgClone)
        }
      }
    }

    // 组件挂载后设置初始颜色
    onMounted(() => {
      if (!import.meta.client) return
      nextTick(() => {
        setColor(props.color)
      })
    })

    return {
      sizeVW: computed(() => `${props.size / (psd / 100)}vw`),
      sizePX: computed(() => `${props.size}px`),
      svgClass: computed(() => `svg-icon ${props.className}`),
      svgRef,
      handleMouseEnter,
      handleMouseLeave,
    }
  },
})
</script>

<template>
  <svg
    :ref="svgRef"
    :class="svgClass"
    :style="{ width: sizePX, height: sizePX }"
    aria-hidden="true"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<style lang="scss">
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
}
</style>
