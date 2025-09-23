export const useScrollCanvas = (
  id: string,
  img: string,
  spriteSourceSize: any[],
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  mode?: 'contain' | 'cover' | 'stretch',
  rotation?: number,
) => {
  const renderer = ref<SpriteRenderer>()
  onMounted(() => {
    renderer.value = new SpriteRenderer(id, img, x, y, w, h, mode)
    const renderRegion = renderer.value.getRenderer()
    renderRegion(spriteSourceSize[0], rotation)
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY
      const index = Math.floor(scrollY / 30) % 10
      renderRegion(spriteSourceSize[index], rotation)
    })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', () => {})
    renderer.value?.destroy()
  })
}
