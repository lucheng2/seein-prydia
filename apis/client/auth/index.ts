import { request } from '@/apis/utils/http'

/** 登录 */
export const login = (params: any) => {
  return request.post('/api/user/website_user/login', params)
}

/** 退出登录 */
export const logout = () => {
  return request.post('/api/user/website_user/logout')
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return request.get('/api/user/website_user/getWebsiteUserInfo')
}

/** 获取验证码 */
export const getCaptcha = (params: any) => {
  return request.get('/api/user/website_user/captcha', params)
}
