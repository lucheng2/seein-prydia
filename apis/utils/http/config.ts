export const CONTENT_TYPE_JSON = 'application/json;charset=UTF-8'
export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded;charset=UTF-8'
export const CONTENT_TYPE_MULTIPART = 'multipart/form-data'

// 默认超时时间：30s
export const DEFAULT_TIMEOUT = 30000

// 返回 response.data 为空时的错误信息
export const EMPTY_RESPONSE_ERROR_MESSAGE = '返回数据为空'

export const DEFAULT_CONFIG = {
  baseURL: '',
  timeout: 3e4,
  headers: {
    'Content-Type': CONTENT_TYPE_JSON,
  },
  // 重试
  retry: true,
  retryCount: 0,
  retryDelay: 1e3,

  // 缓存
  cache: false,
  cacheTime: 6e5, // 1 minute
}

export const MAX_CONCURRENT_REQUESTS = 5
