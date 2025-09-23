import type { RequestConfig } from '../types'

import { MAX_CONCURRENT_REQUESTS } from '../config'

interface QueueItem<T = any> {
  config: RequestConfig
  resolve: (value: T) => void
  reject: (reason: any) => void
}

export class RequestQueueManager {
  private queue: QueueItem[] = []
  private activeRequests = 0
  executeRequest: any

  enqueue<T>(item: QueueItem<T>): void {
    this.queue.push(item)
    this.processQueue()
  }

  private async processQueue() {
    if (this.activeRequests < MAX_CONCURRENT_REQUESTS && this.queue.length > 0) {
      const item = this.queue.shift()!
      this.activeRequests++

      try {
        const response = await this.executeRequest(item.config)
        item.resolve(response)
      }
      catch (error) {
        item.reject(error)
      }
      finally {
        this.activeRequests--
        this.processQueue()
      }
    }
  }

  setRequestExecutor<T>(executor: (config: RequestConfig) => Promise<T>) {
    this.executeRequest = executor
  }
}

export const requestQueueManager = new RequestQueueManager()
