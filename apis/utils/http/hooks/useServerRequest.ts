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
      // 修复：确保 method 正确设置
      if (opts?.method) {
        options.method = opts.method as any
      }

      // 修复：baseURL 逻辑
      if (!url.includes('http')) {
        options.baseURL = opts?.baseURL?.toString() || '/'
      }

      // 添加请求头
      options.headers = new Headers(options.headers)
      if (meta?.auth && token) {
        options.headers.set('Authorization', `${token}`)
      }
    },
    onResponse({ response }) {
      const data = response._data
      logResponse(url, opts, data)

      if (data.code === 2001 || data.code === 401) {
        user.value = null
        throw createError({
          statusCode: 401,
          message: '登录失效，请重新登录',
        })
      }

      if (data.code !== 0) {
        throw createError({
          statusCode: 400,
          message: data.message,
          data: {
            data: data.data,
            code: data.code,
            msg: data.message,
          },
        })
      }
    },
    onResponseError({ response }) {
      throw createError({
        statusCode: response.status,
        message: response.statusText || '请求失败',
      })
    },
  }

  return new Promise((resolve, reject) => {
    useLazyFetch<Response<DataT>, ErrorT>(url, {
      ...defaultOptions,
    } as any)
      .then(({ data, error, status, execute }) => {
        // 修复：直接检查 error 和 data
        if (error.value) {
          reject(error.value)
        }
        else if (data.value) {
          resolve(data.value.data)
        }
        else {
          reject(new Error('No data received'))
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}
