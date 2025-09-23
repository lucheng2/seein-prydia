import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useView } from './use-view'

if (import.meta.client) gsap.registerPlugin(ScrollTrigger)
export const useGsap = import.meta.client
  ? (
      callback: (args: {
        breakpoint: string
        isMobile: boolean
        gsap: typeof gsap
        ScrollTrigger: typeof ScrollTrigger
      }) => gsap.core.Tween,
    ) => {
      const { viewBreakpoint, isMobile } = useView()
      const gsapInstance = ref()
      watch(() => viewBreakpoint.value, async (val) => {
        await nextTick()
        if (gsapInstance.value) {
          gsapInstance.value.kill()
        }
        gsapInstance.value = callback({
          breakpoint: viewBreakpoint.value,
          isMobile: isMobile.value,
          gsap,
          ScrollTrigger,
        })
      })
    }
  : () => {}
