type ConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'
type ErrorType = 'offer-error' | 'answer-error' | 'ice-error' | 'media-error' | 'signaling-error'

interface WebRTCEvents {
  connectionStateChange: (state: ConnectionState) => void
  error: (type: ErrorType, error: Error) => void
  stream: (stream: MediaStream) => void
}

export class WebRTCUtils {
  private pc: RTCPeerConnection
  private localStream?: MediaStream
  private eventListeners: { [K in keyof WebRTCEvents]?: WebRTCEvents[K] } = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private isNegotiating = false
  private shouldRenegotiate = false

  constructor(private config: RTCConfiguration) {
    this.pc = this.createPeerConnection()
  }

  // 创建新的PeerConnection
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.config)

    pc.oniceconnectionstatechange = () => this.handleIceStateChange()
    pc.onconnectionstatechange = () => this.handleConnectionStateChange()
    pc.onsignalingstatechange = () => this.handleSignalingState()
    pc.onicecandidate = event => this.handleIceCandidate(event)
    pc.ontrack = event => this.handleTrack(event)

    return pc
  }

  // 事件监听管理
  on<K extends keyof WebRTCEvents>(event: K, listener: WebRTCEvents[K]) {
    this.eventListeners[event] = listener
  }

  private emit<K extends keyof WebRTCEvents>(event: K, ...args: Parameters<WebRTCEvents[K]>) {
    const listener = this.eventListeners[event]
    if (listener) {
      (listener as any)(...args)
    }
  }

  // 初始化本地媒体流
  async initializeLocalStream(constraints: MediaStreamConstraints) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, this.localStream!)
      })
    }
    catch (error) {
      this.emit('error', 'media-error', error as Error)
      throw error
    }
  }

  // 媒体控制
  muteAudio(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted
    })
  }

  muteVideo(muted: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !muted
    })
  }

  // 创建Offer
  async createOffer() {
    if (this.isNegotiating) {
      this.shouldRenegotiate = true
      return null
    }
    try {
      this.isNegotiating = true
      const offer = await this.pc.createOffer()
      await this.pc.setLocalDescription(offer)
      return offer
    }
    catch (error) {
      this.emit('error', 'offer-error', error as Error)
      this.scheduleRetry()
      throw error
    }
    finally {
      this.isNegotiating = false
      if (this.shouldRenegotiate) {
        this.shouldRenegotiate = false
        await this.createOffer()
      }
    }
  }

  // 处理Answer
  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.pc.setRemoteDescription(answer)
    }
    catch (error) {
      this.emit('error', 'answer-error', error as Error)
      this.scheduleRetry()
      throw error
    }
  }

  // ICE Candidate处理
  private handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      // 发送candidate到对等端
    }
  }

  async addIceCandidate(candidate: RTCIceCandidate) {
    try {
      await this.pc.addIceCandidate(candidate)
    }
    catch (error) {
      this.emit('error', 'ice-error', error as Error)
    }
  }

  // 状态监控
  private handleIceStateChange() {
    const state = this.pc.iceConnectionState
    if (['disconnected', 'failed'].includes(state)) {
      this.scheduleRetry()
    }
  }

  private handleConnectionStateChange() {
    const state = this.pc.connectionState.toLowerCase() as ConnectionState
    this.emit('connectionStateChange', state)
  }

  private handleSignalingState() {
    if (this.pc.signalingState === 'stable') {
      if (!this.isNegotiating && this.shouldRenegotiate) {
        this.shouldRenegotiate = false
        this.createOffer()
      }
    }
  }

  // 错误恢复机制
  private scheduleRetry() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.reconnect(), Math.min(2000 * this.reconnectAttempts, 10000))
    }
  }

  private async reconnect() {
    try {
      this.pc.close()
      this.pc = this.createPeerConnection()
      if (this.localStream) {
        await this.initializeLocalStream({ video: true, audio: true })
      }
      await this.createOffer()
    }
    catch (error) {
      this.emit('error', 'signaling-error', error as Error)
    }
  }

  // 远程流处理
  private handleTrack(event: RTCTrackEvent) {
    this.emit('stream', event.streams[0])
  }

  // 关闭连接
  close() {
    this.pc.close()
    this.localStream?.getTracks().forEach(track => track.stop())
    this.reconnectAttempts = 0
  }
}
