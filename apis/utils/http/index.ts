import type { RequestConfig } from './types'

import { Request } from './core'
import { WebRtcRequest } from './core/index-webrtc'
import { useServerRequest } from './hooks/useServerRequest'

export const createRequest = (config: RequestConfig) => {
  return new Request(config)
}

export const request = createRequest({
  baseURL: '/',
})

export const webrtcRequest = new WebRtcRequest({
  baseURL: '/',
})

// 服务端用请求方法，客户端用request
export const server = {
  get: <T = any>(url: string, params?: any, config?: any) => {
    return useServerRequest<T, any>(url, {
      ...config,
      method: 'GET',
      query: params,
    })
  },
  post: <T = any>(url: string, data?: any, config?: any) => {
    return useServerRequest<T, any>(url, {
      ...config,
      method: 'POST',
      body: data,
    })
  },
}
