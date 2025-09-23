import type { Canceler } from 'axios'

import axios from 'axios'

export class RequestCancel {
  private pendingMap: Map<string, { controller: AbortController, cancel?: Canceler }>

  constructor() {
    this.pendingMap = new Map()
  }

  // 生成请求的唯一键
  private generateKey(config: any): string {
    const { url, method, params, data } = config
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
  }

  // 添加请求
  addPending(config: any) {
    this.removePending(config)
    const key = this.generateKey(config)

    // 优先使用 AbortController
    const controller = new AbortController()
    config.signal = controller.signal

    // 兼容旧版本浏览器，同时设置 cancelToken

    config.cancelToken = new axios.CancelToken((cancel: Canceler) => {
      if (!this.pendingMap.has(key)) {
        this.pendingMap.set(key, { controller, cancel })
      }
    })
  }

  // 移除请求
  removePending(config: any) {
    const key = this.generateKey(config)
    if (this.pendingMap.has(key)) {
      const { controller, cancel } = this.pendingMap.get(key)!
      controller.abort() // 使用 AbortController 取消
      cancel?.('请求已取消') // 兼容性处理
      this.pendingMap.delete(key)
    }
  }

  // 清空所有pending的请求
  removeAllPending() {
    this.pendingMap.forEach(({ controller, cancel }) => {
      controller.abort()
      cancel?.('请求已取消')
    })
    this.pendingMap.clear()
  }
}
