import type { UseFetchOptions } from 'nuxt/app'
import { logResponse } from '../utils'

interface Response<T> {
  code: number
  message: string
  data: T
}

export function useServerRequest<DataT = any, ErrorT = any>(
  url: string,
  opts?: UseFetchOptions<Response<DataT>>,
  meta?: any,
): Promise<any> {
  const user = useCookie('user') as any
  const token = user.value?.token

  meta = {
    auth: true,
    toast: true,
    ...meta,
  }

  const defaultOptions: UseFetchOptions<Response<DataT>> = {
    ...opts,
    onRequest({ options }) {
      options.method = opts.method.toString()
      // 是否携带http 不携带就使用默认值
      const baseURL = '/'
      !url.includes('http')
      && (options.baseURL = opts?.baseURL?.toString() || baseURL)
      // 添加请求头,没登录不携带token
      options.headers = new Headers(options.headers)
      meta?.auth && options.headers.set('Authorization', `${token}`)
    },
    onResponse({ response }) {
      const data = response._data
      logResponse(url, opts, data)
      if (data.code === 2001 || data.code === 401) {
        // 删除Cookie中的user
        user.value = null
        return Promise.reject(new Error('登录失效，请重新登录'))
      }
      if (data.code !== 0) {
        return Promise.reject(new Error(data.message, {
          cause: {
            data: data.data,
            code: data.code,
            msg: data.message,
          },
        }))
      }
    },
  }

  return new Promise((resolve, reject) => {
    useFetch<Response<DataT>, ErrorT>(url, { ...defaultOptions } as any).then(
      ({ data, status, error, refresh, clear }) => {
        if (status.value === 'success') {
          resolve(data.value.data)
        }
        else {
          reject(error.value)
        }
      },
    )
  })
}
