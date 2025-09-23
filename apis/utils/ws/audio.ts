type WebSocketEventName = 'open' | 'message' | 'close' | 'error'

interface AudioWebSocketOptions {
  reconnectLimit?: number
  reconnectInterval?: number
  heart?: boolean
  heartInterval?: number
  heartMsg?: string
  heartMsgRes?: string
  heartTimeout?: number
}

interface EventHandlerMap {
  open: (event: Event) => void
  message: (event: MessageEvent) => void
  close: (event: CloseEvent) => void
  error: (event: Event) => void
}

class AudioWebSocket {
  private url: string
  private options: Required<AudioWebSocketOptions>
  private ws: WebSocket | null = null
  private reconnectCount = 0
  private isManualClose = false

  private heartTimer: number | null = null
  private heartTimeoutTimer: number | null = null
  private reconnectTimer: number | null = null

  // 心跳状态 - 关键优化点
  private isHeartAlive = true
  private lastHeartTime = 0
  private heartbeatCount = 0
  private missedHeartbeats = 0

  // 音频数据统计
  private audioMessageCount = 0
  private lastAudioTime = 0

  private eventMap: {
    [K in WebSocketEventName]: Array<EventHandlerMap[K]>
  } = {
      open: [],
      message: [],
      close: [],
      error: [],
    }

  constructor(url: string, options: AudioWebSocketOptions = {}) {
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
      // 🔑 关键：大幅延长心跳间隔，避免与音频数据冲突
      heartInterval: options.heartInterval ?? 60000, // 60秒
      heartMsg: options.heartMsg ?? 'ping',
      heartMsgRes: options.heartMsgRes ?? 'pong',
      // 🔑 关键：延长心跳超时时间
      heartTimeout: options.heartTimeout ?? 20000, // 20秒
    }

    this.createWs()
  }

  private createWs(): void {
    if (typeof WebSocket === 'undefined') {
      throw new TypeError('当前环境不支持 WebSocket')
    }

    try {
      document.cookie = `token=${getToken()}; path=/`
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
      console.log('🟢 WebSocket连接已建立')
      this.reconnectCount = 0
      this.isHeartAlive = true
      this.heartbeatCount = 0
      this.missedHeartbeats = 0
      this.audioMessageCount = 0

      this.emit('open', e)
      this.startHeartbeat()
    })

    ws.addEventListener('message', (e) => {
      const now = Date.now()

      // 🔑 关键优化：优先处理心跳响应，避免被音频数据淹没
      if (typeof e.data === 'string' && e.data === this.options.heartMsgRes) {
        console.log(`💓 收到心跳响应 #${this.heartbeatCount}, 延迟: ${now - this.lastHeartTime}ms`)
        this.isHeartAlive = true
        this.missedHeartbeats = 0
        this.resetHeartbeatTimeout()
        return // 立即返回，不走后续处理逻辑
      }

      // 处理其他类型的控制消息（JSON格式）
      if (typeof e.data === 'string') {
        try {
          const controlMsg = JSON.parse(e.data)
          if (controlMsg.type === 'heartbeat' || controlMsg.type === 'pong') {
            console.log('💓 收到JSON格式心跳响应')
            this.isHeartAlive = true
            this.missedHeartbeats = 0
            this.resetHeartbeatTimeout()
            return
          }
        }
        catch {
          // 不是JSON，继续处理
        }
      }

      // 🔑 统计音频数据，用于监控
      this.audioMessageCount++
      this.lastAudioTime = now

      // 🔑 关键优化：使用 requestIdleCallback 或 setTimeout 异步处理音频数据
      // 避免阻塞心跳检测逻辑
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          this.emit('message', e)
        }, { timeout: 50 })
      }
      else {
        setTimeout(() => {
          this.emit('message', e)
        }, 0)
      }
    })

    ws.addEventListener('close', (e) => {
      console.log(`🔴 WebSocket连接关闭: code=${e.code}, reason=${e.reason || 'unknown'}`)

      // 🔑 详细记录 1011 错误
      if (e.code === 1011) {
        console.error(`💥 心跳超时关闭！统计信息:`, {
          heartbeatCount: this.heartbeatCount,
          missedHeartbeats: this.missedHeartbeats,
          audioMessageCount: this.audioMessageCount,
          lastAudioTime: this.lastAudioTime ? new Date(this.lastAudioTime).toLocaleTimeString() : 'never',
          lastHeartTime: this.lastHeartTime ? new Date(this.lastHeartTime).toLocaleTimeString() : 'never',
          timeSinceLastAudio: this.lastAudioTime ? Date.now() - this.lastAudioTime : 'N/A',
          timeSinceLastHeart: this.lastHeartTime ? Date.now() - this.lastHeartTime : 'N/A',
        })
      }

      this.stopHeartbeat()
      this.emit('close', e)

      if (!this.isManualClose && e.code !== 1000) {
        this.reconnect()
      }
    })

    ws.addEventListener('error', (e) => {
      console.error('🔴 WebSocket发生错误:', e)
      this.emit('error', e)
      this.stopHeartbeat()
    })
  }

  private startHeartbeat(): void {
    if (!this.options.heart) return

    this.stopHeartbeat()
    console.log(`💓 启动心跳检测，间隔: ${this.options.heartInterval}ms, 超时: ${this.options.heartTimeout}ms`)

    // 🔑 关键优化：使用更精确的心跳逻辑
    this.heartTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // 检查上次心跳是否超时
        if (!this.isHeartAlive) {
          this.missedHeartbeats++
          console.warn(`💔 心跳 #${this.heartbeatCount} 超时！连续错过: ${this.missedHeartbeats}`)

          // 🔑 允许错过1-2次心跳，避免过于敏感
          if (this.missedHeartbeats >= 2) {
            console.error('💥 连续错过多次心跳，主动关闭连接')
            this.handleHeartTimeout()
            return
          }
        }

        // 发送心跳
        this.heartbeatCount++
        this.isHeartAlive = false
        this.lastHeartTime = Date.now()

        console.log(`💓 发送心跳 #${this.heartbeatCount}`)
        this.send(this.options.heartMsg)

        // 🔑 设置心跳超时检查
        this.heartTimeoutTimer = window.setTimeout(() => {
          if (!this.isHeartAlive) {
            console.warn(`💔 心跳 #${this.heartbeatCount} 响应超时 (${this.options.heartTimeout}ms)`)
            // 不立即关闭，等待下次检查
          }
        }, this.options.heartTimeout)
      }
    }, this.options.heartInterval)
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartTimeoutTimer) {
      clearTimeout(this.heartTimeoutTimer)
      this.heartTimeoutTimer = null
    }
  }

  private handleHeartTimeout(): void {
    console.log('💥 心跳完全失败，关闭连接重连')
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1011, 'heartbeat timeout - client initiated')
    }
  }

  private stopHeartbeat(): void {
    if (this.heartTimer) {
      clearInterval(this.heartTimer)
      this.heartTimer = null
    }
    this.resetHeartbeatTimeout()
  }

  send(message: string | ArrayBuffer | Blob): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(message)
        return true
      }
      catch (error) {
        console.error('发送消息失败:', error)
        return false
      }
    }
    else {
      console.error('WebSocket连接未就绪，当前状态:', this.readyState)
      return false
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

    console.log(`🔄 准备第${this.reconnectCount + 1}次重连，${this.options.reconnectInterval}ms后执行`)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectCount++
      console.log(`🔄 尝试第${this.reconnectCount}次重连...`)
      this.createWs()
    }, this.options.reconnectInterval)
  }

  close(): void {
    console.log('🟡 手动关闭WebSocket连接')
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

  get readyStateValue(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  // 🔑 调试信息
  get debugInfo() {
    return {
      heartbeatCount: this.heartbeatCount,
      missedHeartbeats: this.missedHeartbeats,
      audioMessageCount: this.audioMessageCount,
      isHeartAlive: this.isHeartAlive,
      lastHeartTime: this.lastHeartTime,
      lastAudioTime: this.lastAudioTime,
      reconnectCount: this.reconnectCount,
    }
  }
}

export default AudioWebSocket
