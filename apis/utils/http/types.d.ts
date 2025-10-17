import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface RequestConfig extends AxiosRequestConfig {
  // 是否开启重试
  retry?: boolean
  // 重试次数
  retryCount?: number
  // 重试延迟
  retryDelay?: number

  //
  cache?: boolean
  cacheTime?: number

  __token?: string
}

export type Response<T = any> = AxiosResponse<T>

// 响应结果
export interface ResponseData<T = any> {
  code: number
  data: T
  message: string
}
