import { CookieManager } from './cookie'

type WebSocketEventName = 'open' | 'message' | 'close' | 'error'

interface ReconnectWebSocketOptions {
  /** 最大重连次数，默认3次 */
  reconnectLimit?: number
  /** 重连间隔(ms)，默认3000 */
  reconnectInterval?: number
  /** 是否启用心跳 */
  heart?: boolean
  /** 心跳间隔(ms)，默认20000 */
  heartInterval?: number
  /** 心跳消息内容，默认"ping" */
  heartMsg?: string
  /** 心跳消息响应内容，默认"pong" */
  heartMsgRes?: string
  /** 心跳超时时间(ms)，默认5000 */
  heartTimeout?: number
}

interface EventHandlerMap {
  open: (event: Event) => void
  message: (event: MessageEvent) => void
  close: (event: CloseEvent) => void
  error: (event: Event) => void
}

class ReconnectWebSocket {
  private url: string
  private options: Required<ReconnectWebSocketOptions>
  private ws: WebSocket | null = null
  private reconnectCount = 0
  private isManualClose = false

  private heartTimer: number | null = null
  private heartTimeoutTimer: number | null = null
  private reconnectTimer: number | null = null

  // 添加心跳状态跟踪
  private isHeartAlive = true
  private lastHeartTime = 0

  private eventMap: {
    [K in WebSocketEventName]: Array<EventHandlerMap[K]>
  } = {
      open: [],
      message: [],
      close: [],
      error: [],
    }

  constructor(url: string, options: ReconnectWebSocketOptions = {}) {
    const env = import.meta.env.VITE_NODE_ENV
    if (env === 'localhost') {
      url = url.replace(/^\/api-ws/, '/ws')
      this.url = `ws://localhost:8080/seein${url}`
    }
    else {
      if (url.startsWith('ws')) {
        this.url = url
      }
      else {
        const [protocol, domain] = getFromUrl()
        this.url = `${protocol === 'https' ? 'wss' : 'ws'}://${domain}${url}`
      }
    }
    this.options = {
      reconnectLimit: options.reconnectLimit ?? 3,
      reconnectInterval: options.reconnectInterval ?? 3000,
      heart: options.heart ?? true,
      heartInterval: options.heartInterval ?? 30000, // 增加到30秒
      heartMsg: options.heartMsg ?? 'ping',
      heartMsgRes: options.heartMsgRes ?? 'pong',
      heartTimeout: options.heartTimeout ?? 10000, // 新增超时时间
    }

    this.createWs()
  }

  private createWs(): void {
    if (typeof WebSocket === 'undefined') {
      throw new TypeError('当前环境不支持 WebSocket')
    }

    try {
      // 使用示例
      const cookieManager = new CookieManager('', '/')
      // 批量设置多个 Cookie
      cookieManager.setMultipleCookies([
        { name: 'token', value: getToken(), options: { secure: true, sameSite: 'Strict' } },
      ])
      this.ws = new WebSocket(this.url)
      this.bindEvent()
    }
    catch (error) {
      this.handleError(error)
      this.reconnect()
    }
  }

  private bindEvent(): void {
    if (!this.ws) return

    const ws = this.ws

    ws.addEventListener('open', (e) => {
      console.log('WebSocket连接已建立')
      this.reconnectCount = 0
      this.isHeartAlive = true
      this.emit('open', e)
      this.startHeartbeat()
    })

    ws.addEventListener('message', (e) => {
      // 收到任何消息都重置心跳状态

      if (e.data === this.options.heartMsgRes) {
        console.log('收到心跳响应:', e.data)
        this.resetHeartbeat()
        this.isHeartAlive = true
        return
      }

      this.emit('message', e)
    })

    ws.addEventListener('close', (e) => {
      console.log('WebSocket连接关闭:', e.code, e.reason)
      this.stopHeartbeat()
      this.emit('close', e)

      // 只有在非手动关闭且不是正常关闭的情况下才重连
      if (!this.isManualClose && e.code !== 1000) {
        this.reconnect()
      }
    })

    ws.addEventListener('error', (e) => {
      console.error('WebSocket发生错误:', e)
      this.emit('error', e)
      this.stopHeartbeat()
    })
  }

  private startHeartbeat(): void {
    if (!this.options.heart) return

    this.stopHeartbeat() // 清除之前的定时器

    console.log('启动心跳检测，间隔:', this.options.heartInterval)

    this.heartTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // 检查上次心跳是否超时
        // if (!this.isHeartAlive) {
        //   console.warn('心跳超时，准备重连')
        //   this.handleHeartTimeout()
        //   return
        // }

        // 发送心跳
        this.isHeartAlive = false
        this.lastHeartTime = Date.now()
        this.send(this.options.heartMsg)
        console.log('发送心跳:', this.options.heartMsg)
        // 设置心跳超时检查
        this.heartTimeoutTimer = window.setTimeout(() => {
          if (!this.isHeartAlive) {
            console.warn('心跳响应超时')
            this.handleHeartTimeout()
          }
        }, this.options.heartTimeout)
      }
    }, this.options.heartInterval)
  }

  private resetHeartbeat(): void {
    if (this.heartTimeoutTimer) {
      clearTimeout(this.heartTimeoutTimer)
      this.heartTimeoutTimer = null
    }
  }

  private handleHeartTimeout(): void {
    console.log('心跳检测失败')
    // this.stopHeartbeat()
    // // 触发重连
    // if (this.ws) {
    //   this.ws.close(3000, 'heartbeat timeout')
    // }
  }

  private stopHeartbeat(): void {
    if (this.heartTimer) {
      clearInterval(this.heartTimer)
      this.heartTimer = null
    }
    if (this.heartTimeoutTimer) {
      clearTimeout(this.heartTimeoutTimer)
      this.heartTimeoutTimer = null
    }
  }

  send(message: string | ArrayBuffer | Blob): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    }
    else {
      console.error('WebSocket连接未就绪，当前状态:', this.readyState)
    }
  }

  private reconnect(): void {
    if (this.isManualClose) {
      console.log('手动关闭，不进行重连')
      return
    }

    this.clearTimer(this.reconnectTimer)

    if (this.reconnectCount >= this.options.reconnectLimit) {
      console.error(`WebSocket已重连${this.reconnectCount}次，不再尝试`)
      return
    }

    console.log(`准备第${this.reconnectCount + 1}次重连，${this.options.reconnectInterval}ms后执行`)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectCount++
      console.log(`尝试第${this.reconnectCount}次重连...`)
      this.createWs()
    }, this.options.reconnectInterval)
  }

  close(): void {
    console.log('手动关闭WebSocket连接')
    this.isManualClose = true
    this.stopHeartbeat()
    this.ws?.close(1000, 'manual close')
    this.clearAllTimers()
  }

  private clearAllTimers(): void {
    this.stopHeartbeat()
    this.clearTimer(this.reconnectTimer)
  }

  private clearTimer(timerId: number | null): void {
    if (timerId) {
      clearTimeout(timerId)
      clearInterval(timerId)
    }
  }

  on<K extends WebSocketEventName>(event: K, handler: EventHandlerMap[K]): this {
    this.eventMap[event].push(handler)
    return this
  }

  off<K extends WebSocketEventName>(event: K, handler?: EventHandlerMap[K]): this {
    if (handler) {
      const handlers = this.eventMap[event]
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
    else {
      this.eventMap[event] = []
    }
    return this
  }

  private emit<K extends WebSocketEventName>(
    event: K,
    ...args: Parameters<EventHandlerMap[K]>
  ): void {
    this.eventMap[event].forEach((handler) => {
      try {
        ;(handler as Function)(...args)
      }
      catch (error) {
        console.error(`事件处理器执行错误 (${event}):`, error)
      }
    })
  }

  private handleError(error: unknown): void {
    console.error('WebSocket错误:', error)
    this.emit('error', new Event('error'))
  }

  get readyState(): string {
    const WebSocketState = ['ws尚未打开', 'ws已打开', 'ws正在关闭中', 'ws已关闭']
    return WebSocketState[this.ws?.readyState ?? WebSocket.CLOSED]
  }

  // 获取连接状态的数字值
  get readyStateValue(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  // 获取心跳状态
  get heartStatus(): { isAlive: boolean, lastTime: number } {
    return {
      isAlive: this.isHeartAlive,
      lastTime: this.lastHeartTime,
    }
  }
}

export default ReconnectWebSocket
