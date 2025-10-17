import { request } from '@/apis/utils/http'

/** 登录 */
export const login = (params: any) => {
  return request.post('/prydia-api/user/serein_user/login', params)
}

/** 注册 */
export const register = (params: any) => {
  return request.post('/prydia-api/user/serein_user/registerUser', params)
}

/** 设置密码 */
export const setPwd = (params: any, token: string) => {
  return request.post('/prydia-api/user/serein_user/setUserPassword', params, { __token: token })
}

/** 获取验证码（注册） */
export const getCaptcha = (params: any) => {
  return request.get('/prydia-api/user/serein_user/getCaptchaForRegister', params)
}

/** 获取验证码（找回密码） */
export const getCaptchaByFindPwd = (params: any) => {
  return request.get('/prydia-api/user/serein_user/getCaptchaForResetPassword', params)
}

/** 校验验证码 */
export const checkCaptcha = (params: any) => {
  return request.get('/prydia-api/user/serein_user/checkCaptcha', params)
}

/** 退出登录 */
export const logout = () => {
  return request.post('/prydia-api/user/serein_user/logout')
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return request.get('/prydia-api/user/serein_user/getUserInfo')
}

/** 保存用户信息 */
export const saveUserInfo = (params: any) => {
  return request.post('/prydia-api/user/serein_user/saveUserInfo', params)
}
