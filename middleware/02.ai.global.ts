import { createPinia } from 'pinia'
import { openApplyForTestModal } from '~/components/modal/apply-for-test/open'
import { useCheckChatRightStore } from '~/stores/checkChatRight'

const CheckPaths = ['/ai/chat/**']

// 如果有多个全局中间件，根据ascll（阿斯克码）从小到大排序执行
export default defineNuxtRouteMiddleware(async (to, from) => {
  const pinia = import.meta.server ? createPinia() : useNuxtApp().$pinia
  const { fetchCheck } = useCheckChatRightStore(pinia)
  const isChecked = await fetchCheck()
  const checkPatterns = getRegexPatterns(CheckPaths)
  const isCheckTo = matchPatterns(checkPatterns, to.path)

  if (isCheckTo) {
    if (isChecked) {
      return true
    }
    else {
      if (import.meta.client) {
        // 如果是客户端，则打开申请测试弹窗，并留在当前页面
        openApplyForTestModal()
        return false
      }
      else {
        // 如果是服务端，则跳转到申请测试页面
        const user = useCookie('user') as any
        const token = user.value?.token
        if (token) return navigateTo('/?logic=applyForTest')
        return navigateTo('/?logic=login')
      }
    }
  }
})
