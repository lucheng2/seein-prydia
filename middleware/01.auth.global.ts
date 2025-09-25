import { createPinia } from 'pinia'
import { openLoginModal } from '~/components/modal/login/open'
import { useDevPagesStore } from '~/stores/devPages'

const VITE_NODE_ENV = import.meta.env.VITE_NODE_ENV
const NEED_ENV = ['production', 'dev']

// 白名单
const WhitePaths = ['/', '/demo', '/ai', '/about', '/legal/**']

// 如果有多个全局中间件，根据ascll（阿斯克码）从小到大排序执行
export default defineNuxtRouteMiddleware(async (to, from) => {
  const whiteTo = await whiteRouterBefore(to, from)
  if (whiteTo) return navigateTo(whiteTo.path)
})

const whiteRouterBefore = (to, from) => {
  // 路由白名单，不需要登录
  const whitePatterns = getRegexPatterns(WhitePaths)
  const isWhite = matchPatterns(whitePatterns, to.path)

  if (isWhite) return

  // 假设使用Pinia或其他状态管理获取认证状态
  const { getToken } = useUserStore()

  if (!getToken) {
    const isWhiteFrom = !matchPatterns(whitePatterns, from.path)
    // 未登录则重定向到登录页
    if (import.meta.client) openLoginModal()
    return isWhiteFrom ? { path: '/?logic=login' } : from
  }
  return NEED_ENV.includes(VITE_NODE_ENV) ? devRouterBefore(to, from) : undefined
}

// 开发中，暂时禁用
const devRouterBefore = async (to, from) => {
  const pinia = import.meta.server ? createPinia() : useNuxtApp().$pinia
  const { fetchDevPages, getDevPageByPath } = useDevPagesStore(pinia)
  try {
    const { devPaths } = await fetchDevPages()
    const devObj = getDevPageByPath(to.path)
    const devRegexPatterns = getRegexPatterns(devPaths)
    const isDevTo = matchPatterns(devRegexPatterns, to.path)
    const isDevFrom = matchPatterns(devRegexPatterns, from.path)
    if (isDevTo) {
      if (isDevFrom) {
        throw createError(devObj)
      }
      message(devObj.message as string, { type: 'warning' })
      return from
    }
  }
  catch (error) {
    throw createError({ statusCode: error.statusCode, message: error.message })
  }
}
