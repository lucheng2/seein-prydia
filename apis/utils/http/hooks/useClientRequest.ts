import { logResponse } from '../utils'

type FetchType = typeof $fetch
export type FetchOptions = Parameters<FetchType>[1]

export function useClientRequest<T = unknown>(url: string, opts?: FetchOptions, meta?: any): Promise<any> {
  const userPinia = useUserStore()
  const token = userPinia.getToken
  meta = {
    auth: true,
    toast: true,
    ...meta,
  }
  const defaultOptions: FetchOptions = {
    onRequest({ options }) {
      options.method = opts.method.toString()
      // 是否携带http 不携带就使用默认值
      const baseURL = '/'
      !url.includes('http') && (options.baseURL = opts?.baseURL?.toString() || baseURL)
      // 添加请求头,没登录不携带token
      options.headers = new Headers(options.headers)
      meta?.auth && options.headers.set('Authorization', `${token}`)
    },
    onResponse({ response }) {
      const data = response._data
      logResponse(url, opts, data)
      if (data.code === 2001 || data.code === 401) {
        removeToken()
        return Promise.reject(new Error('登录失效，请重新登录'))
      }
      if (data.code !== 0) {
        message(data.message || '请求失败', { type: 'error' })
        return Promise.reject(data)
      }
    },
  }

  return $fetch<T>(url, { ...defaultOptions, ...opts })
}
