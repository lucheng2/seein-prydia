export const useView = () => {
  const breakpoints = {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  }

  const viewBreakpoint = ref()
  const isMobile = computed(() => ['md', 'sm', 'xs'].includes(viewBreakpoint.value))

  const getBreakpoint = (width: number) => {
    if (width < breakpoints.sm) return 'xs'
    if (width < breakpoints.md) return 'sm'
    if (width < breakpoints.lg) return 'md'
    if (width < breakpoints.xl) return 'lg'
    return 'xl'
  }

  onMounted(() => {
    if (import.meta.client) viewBreakpoint.value = getBreakpoint(window.innerWidth)
    window.addEventListener('resize', () => {
      viewBreakpoint.value = getBreakpoint(window.innerWidth)
    })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', () => {
      viewBreakpoint.value = getBreakpoint(window.innerWidth)
    })
  })
  return {
    viewBreakpoint,
    isMobile,
  }
}
