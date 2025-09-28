export default defineNuxtRouteMiddleware(async (to, from) => {
  // 如果跳转的是登录页且token存在，则跳转到首页
  const user = useCookie('user') as any
  const token = user.value?.token
  if (to.path === '/' && token) {
    return navigateTo('/ai/chat/new?new=true')
  }
})
