import type { AxiosInstance } from 'axios'

import type { RequestConfig, Response } from '../types'
import axios from 'axios'
import { DEFAULT_CONFIG } from '../config'
import { delay } from '../utils'
import { CacheManager } from './cache'

import { RequestCancel } from './cancel'
import { RequestQueueManager } from './queue'

export class Request {
  private instance: AxiosInstance
  private requestCancel: RequestCancel
  private cacheManager: CacheManager
  private requestQueueManager: RequestQueueManager

  constructor(config: RequestConfig) {
    this.requestCancel = new RequestCancel()
    this.cacheManager = new CacheManager()
    this.requestQueueManager = new RequestQueueManager()
    this.requestQueueManager.setRequestExecutor(this.executeRequest.bind(this))

    this.instance = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()
  }

  private setupRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config) => {
        config.headers['Proxy-Connection'] = undefined
        // 在发送请求之前做些什么z
        const token = getToken()
        if (token) {
          config.headers.Authorization = `${token}`
        }
        this.logRequest(config)
        return config
      },
      (error) => {
        // 对请求错误做些什么
        this.logError(error)
        return Promise.reject(error)
      },
    )
  }

  private setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response) => {
        // 2xx 范围内的状态码都会触发该函数。
        this.logResponse(response)
        if (response.data.code === 2001 || response.data.code === 401) {
          removeToken()
          location.href = '/'
          return Promise.reject(new Error('登录失效，请重新登录'))
        }
        if (response.data.code !== 0) {
          message(response.data.message || '请求失败', { type: 'error' })
          return Promise.reject(response.data)
        }
        return response.data.data
      },
      (error) => {
        // 超出 2xx 范围的状态码都会触发该函数。
        this.logError(error)
        if (error.status === 400) {
          removeToken()
          location.href = '/'
        }
        return Promise.reject(error)
      },
    )
  }

  private logRequest(config: RequestConfig): void {
    console.log(`🍏: ${config.method?.toUpperCase()} ${config.url}`, config)
  }

  private logResponse(response: Response): void {
    console.log(`🍎: ${response.status} ${response.config.url}`, response.data)
  }

  private logError(error: any): void {
    console.error('❎:', error)
  }

  private packConfig(config: RequestConfig): RequestConfig {
    const url = config.url?.startsWith('http') ? config.url : `${config.url}`
    return { ...config, url }
  }

  public get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(
      this.packConfig({ ...config, method: 'GET', url, params }),
    )
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(
      this.packConfig({ ...config, method: 'POST', url, data }),
    )
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(
      this.packConfig({ ...config, method: 'PUT', url, data }),
    )
  }

  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(
      this.packConfig({ ...config, method: 'DELETE', url }),
    )
  }

  public upload<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(
      this.packConfig({
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        url,
        data,
      }),
    )
  }

  public async request<T = any>(config: RequestConfig): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueueManager.enqueue<T>({ config, resolve, reject })
    })
  }

  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    if (config.cache) {
      const cachedData = this.cacheManager.get(config)
      if (cachedData) {
        return cachedData as T
      }
    }

    const response = await this.retryRequest<T>(config)

    if (config.cache) {
      this.cacheManager.set(
        config,
        response,
        config.cacheTime || DEFAULT_CONFIG.cacheTime!,
      )
    }

    return response
  }

  private async retryRequest<T>(
    config: RequestConfig,
    retryCount = 0,
  ): Promise<T> {
    try {
      return await this.instance.request(config)
    }
    catch (error) {
      if (retryCount < (config.retryCount || DEFAULT_CONFIG.retryCount!)) {
        await delay(config.retryDelay || DEFAULT_CONFIG.retryDelay)
        return this.retryRequest(config, retryCount + 1)
      }
      throw error
    }
  }
}
