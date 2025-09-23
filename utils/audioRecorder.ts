/**
 * 浏览器音频录制工具类
 * 支持用户停顿检测和音频格式转换
 */

import type { AudioFormat } from './audioFormatConverter'
import { AudioFormatConverter } from './audioFormatConverter'

export interface AudioRecorderOptions {
  /** 录音格式 */
  format?: AudioFormat
  /** 音频采样率 */
  sampleRate?: number
  /** 音频声道数 */
  channelCount?: number
  /** 音频比特率 */
  bitRate?: number
  /** 静音检测的阈值(0-1) */
  silenceThreshold?: number
  /** 静音检测的持续时间(ms) */
  silenceDuration?: number
  /** 是否启用静音检测 */
  enableSilenceDetection?: boolean
  /** 是否自动停止录音(当检测到停顿时) */
  autoStopOnSilence?: boolean
  /** 停止说话检测的灵敏度(0-1) */
  speechStopSensitivity?: number
  /** 停止说话检测的持续时间(ms) */
  speechStopDuration?: number
  /** 是否启用停止说话检测 */
  enableSpeechStopDetection?: boolean
  /**
   * 静音时长占比阈值（0-1）
   * 当静音时长占总录音时长的比例超过该值时自动丢弃录音
   */
  silencePercentageThreshold?: number
}

export interface RecordingData {
  /** 录音音频数据 */
  blob: Blob
  /** 音频类型 */
  type: string
  /** 录音持续时间(ms) */
  duration: number
  /** 录音大小(bytes) */
  size: number
}

export type RecordingState = 'inactive' | 'recording' | 'paused'
export type SilenceDetectedCallback = (isSilent: boolean) => void
export type SpeechStopDetectedCallback = (isStopped: boolean) => void
export type RecordingStateChangeCallback = (state: RecordingState) => void
export type RecordingErrorCallback = (error: Error) => void
export type RecordingDataCallback = (data: RecordingData) => void
export type AudioProcessCallback = (audioLevel: number) => void

/**
 * 浏览器音频录制器类
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private recordedChunks: Blob[] = []
  private startTime: number = 0
  private endTime: number = 0
  private silenceTimer: number | null = null
  private silenceStart: number | null = null
  private speechStopTimer: number | null = null
  private speechStopStart: number | null = null
  private processorInterval: number | null = null
  private state: RecordingState = 'inactive'
  private options: AudioRecorderOptions
  private silenceDetectedCallback: SilenceDetectedCallback | null = null
  private speechStopDetectedCallback: SpeechStopDetectedCallback | null = null
  private stateChangeCallback: RecordingStateChangeCallback | null = null
  private errorCallback: RecordingErrorCallback | null = null
  private dataCallback: RecordingDataCallback | null = null
  private processCallback: AudioProcessCallback | null = null
  private backgroundLevel: number = 0
  private speechLevel: number = 0
  private isSpeaking: boolean = false
  private speechStartTime: number | null = null
  private lastSpeechTime: number | null = null
  private silenceDetected: boolean = false
  private speechStopped: boolean = false
  private speakingConfirmationTimer: number | null = null
  private potentialSpeakingStart: number | null = null
  private consecutiveSpeakingSamples: number = 0
  private minSpeechVolume: number = 0.1 // 最小说话音量阈值
  private silenceTotalTime: number = 0 // 累计静音时间（毫秒）
  private lastProcessTime: number = 0 // 上次处理时间戳

  /**
   * 创建一个新的AudioRecorder实例
   * @param options 录音选项
   */
  constructor(options: AudioRecorderOptions = {}) {
    this.options = {
      format: 'wav',
      sampleRate: 44100,
      channelCount: 1,
      bitRate: 128000,
      silenceThreshold: 0.05,
      silenceDuration: 1500,
      enableSilenceDetection: true,
      autoStopOnSilence: false,
      speechStopSensitivity: 0.3, // 默认灵敏度
      speechStopDuration: 800, // 默认持续时间，调整为更短的800ms
      enableSpeechStopDetection: true, // 默认启用
      silencePercentageThreshold: undefined,
      ...options,
    }
  }

  /**
   * 检查麦克风权限
   * @returns 是否有麦克风权限
   */
  public async checkPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    }
    catch (error) {
      console.error('麦克风权限检查失败:', error)
      return false
    }
  }

  /**
   * 初始化录音器
   * @returns 是否初始化成功
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('浏览器不支持音频录制')
      }

      // 获取原始媒体流
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: this.options.channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // 创建音频上下文和处理节点
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(this.stream)

      // 创建分析器用于音量检测（连接原始流）
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      source.connect(this.analyser)

      // 创建低通滤波器
      const lowpassFilter = this.audioContext.createBiquadFilter()
      lowpassFilter.type = 'lowpass'
      lowpassFilter.frequency.value = 1000
      lowpassFilter.Q.value = 1

      // 创建目标节点捕获处理后的音频流
      const destination = this.audioContext.createMediaStreamDestination()
      source.connect(lowpassFilter)
      lowpassFilter.connect(destination)

      // 使用处理后的流创建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: this.options.bitRate,
      })

      // 设置事件监听
      this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
      this.mediaRecorder.onstop = this.handleRecordingStopped.bind(this)
      this.mediaRecorder.onerror = this.handleError.bind(this)

      return true
    }
    catch (error) {
      this.handleError(error as Error)
      return false
    }
  }

  /**
   * 开始录音
   * @returns 是否成功开始录音
   */
  public start(): boolean {
    if (!this.mediaRecorder || this.state === 'recording') {
      return false
    }

    try {
      this.recordedChunks = []
      this.startTime = Date.now()
      this.silenceTotalTime = 0 // 重置静音计时
      this.lastProcessTime = 0 // 重置处理时间戳
      this.mediaRecorder.start(100) // 每100ms触发一次dataavailable事件
      this.state = 'recording'
      this.changeState('recording')

      // 开始音频处理
      if (this.options.enableSilenceDetection || this.processCallback) {
        this.startAudioProcessing()
      }

      return true
    }
    catch (error) {
      this.handleError(error as Error)
      return false
    }
  }

  /**
   * 暂停录音
   * @returns 是否成功暂停录音
   */
  public pause(): boolean {
    if (
      !this.mediaRecorder
      || this.state !== 'recording'
      || !this.mediaRecorder.state
      || this.mediaRecorder.state === 'inactive'
    ) {
      return false
    }

    try {
      this.mediaRecorder.pause()
      this.state = 'paused'
      this.changeState('paused')
      this.stopAudioProcessing()
      return true
    }
    catch (error) {
      this.handleError(error as Error)
      return false
    }
  }

  /**
   * 恢复录音
   * @returns 是否成功恢复录音
   */
  public resume(): boolean {
    if (!this.mediaRecorder || this.state !== 'paused') {
      return false
    }

    try {
      this.mediaRecorder.resume()
      this.state = 'recording'
      this.changeState('recording')

      if (this.options.enableSilenceDetection || this.processCallback) {
        this.startAudioProcessing()
      }

      return true
    }
    catch (error) {
      this.handleError(error as Error)
      return false
    }
  }

  /**
   * 停止录音
   * @returns 是否成功停止录音
   */
  public stop(): boolean {
    if (!this.mediaRecorder || this.state === 'inactive') {
      return false
    }

    try {
      // 只有在recording状态下才能调用stop
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop()
      }
      else if (this.mediaRecorder.state === 'paused') {
        // 如果是暂停状态，先恢复再停止
        this.mediaRecorder.resume()
        setTimeout(() => {
          this.mediaRecorder?.stop()
        }, 10)
      }

      this.stopAudioProcessing()
      this.endTime = Date.now()

      return true
    }
    catch (error) {
      this.handleError(error as Error)
      return false
    }
  }

  /**
   * 取消录音
   */
  public cancel(): void {
    this.stopAudioProcessing()
    this.recordedChunks = []
    this.state = 'inactive'
    this.changeState('inactive')

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop()
      }
      catch (error) {
        console.error('取消录音时出错:', error)
      }
    }
  }

  /**
   * 获取录音数据并转换为指定格式
   * @param format 音频格式
   * @returns 录音数据
   */
  public async getRecording(
    format: AudioFormat = 'webm',
  ): Promise<RecordingData | null> {
    if (this.recordedChunks.length === 0) {
      return null
    }

    try {
      const originalBlob = new Blob(this.recordedChunks, {
        type: this.getSupportedMimeType(),
      })
      let outputBlob: Blob

      if (
        format === 'blob'
        || AudioFormatConverter.getMimeType(format) === this.getSupportedMimeType()
      ) {
        outputBlob = originalBlob
      }
      else {
        // 使用AudioFormatConverter进行格式转换
        outputBlob = await AudioFormatConverter.convertBlob(
          originalBlob,
          format,
        )
      }

      return {
        blob: outputBlob,
        type: outputBlob.type,
        duration: this.endTime - this.startTime,
        size: outputBlob.size,
      }
    }
    catch (error) {
      this.handleError(error as Error)
      return null
    }
  }

  /**
   * 保存录音到文件
   * @param filename 文件名
   * @param format 音频格式
   */
  public async saveRecording(
    filename: string,
    format: AudioFormat = 'webm',
  ): Promise<boolean> {
    const recording = await this.getRecording(format)
    if (!recording) {
      return false
    }

    try {
      const url = URL.createObjectURL(recording.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      return true
    }
    catch (error) {
      this.handleError(error as Error)
      return false
    }
  }

  /**
   * 检查格式是否被支持
   * @param format 音频格式
   * @returns 是否支持
   */
  public isFormatSupported(format: AudioFormat): boolean {
    return AudioFormatConverter.isFormatSupported(format)
  }

  /**
   * 释放资源
   */
  public release(): void {
    this.stopAudioProcessing()

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    this.analyser = null

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.mediaRecorder = null
    this.recordedChunks = []
    this.state = 'inactive'
    this.changeState('inactive')
  }

  /**
   * 获取当前状态
   * @returns 当前录音状态
   */
  public getState(): RecordingState {
    return this.state
  }

  /**
   * 获取当前录音时长(ms)
   * @returns 当前录音时长
   */
  public getDuration(): number {
    if (this.state === 'inactive') {
      return this.endTime - this.startTime
    }
    else {
      return Date.now() - this.startTime
    }
  }

  /**
   * 设置静音检测回调
   * @param callback 静音检测回调函数
   */
  public onSilenceDetected(callback: SilenceDetectedCallback): void {
    this.silenceDetectedCallback = callback
  }

  /**
   * 设置停止说话检测回调
   * @param callback 停止说话检测回调函数
   */
  public onSpeechStopDetected(callback: SpeechStopDetectedCallback): void {
    this.speechStopDetectedCallback = callback
  }

  /**
   * 设置状态变化回调
   * @param callback 状态变化回调函数
   */
  public onStateChange(callback: RecordingStateChangeCallback): void {
    this.stateChangeCallback = callback
  }

  /**
   * 设置错误回调
   * @param callback 错误回调函数
   */
  public onError(callback: RecordingErrorCallback): void {
    this.errorCallback = callback
  }

  /**
   * 设置数据回调
   * @param callback 数据回调函数
   */
  public onData(callback: RecordingDataCallback): void {
    this.dataCallback = callback
  }

  /**
   * 设置音频处理回调
   * @param callback 音频处理回调函数
   */
  public onAudioProcess(callback: AudioProcessCallback): void {
    this.processCallback = callback
  }

  /**
   * 更新录音选项
   * @param options 新的录音选项
   */
  public updateOptions(options: Partial<AudioRecorderOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 转换静音检测阈值
   * @param threshold 新的静音检测阈值
   */
  public setSilenceThreshold(threshold: number): void {
    this.options.silenceThreshold = Math.max(0, Math.min(1, threshold))
  }

  /**
   * 设置静音检测持续时间
   * @param duration 新的静音检测持续时间
   */
  public setSilenceDuration(duration: number): void {
    this.options.silenceDuration = Math.max(100, duration)
  }

  /**
   * 启用/禁用静音检测
   * @param enable 是否启用静音检测
   */
  public enableSilenceDetection(enable: boolean): void {
    this.options.enableSilenceDetection = enable
    if (this.state === 'recording') {
      if (enable) {
        this.startAudioProcessing()
      }
      else if (!this.processCallback) {
        this.stopAudioProcessing()
      }
    }
  }

  /**
   * 启用/禁用自动停止
   * @param enable 是否启用自动停止
   */
  public enableAutoStop(enable: boolean): void {
    this.options.autoStopOnSilence = enable
  }

  /**
   * 启用/禁用停止说话检测
   * @param enable 是否启用停止说话检测
   */
  public enableSpeechStopDetection(enable: boolean): void {
    this.options.enableSpeechStopDetection = enable
    if (this.state === 'recording') {
      if (enable) {
        this.startAudioProcessing()
      }
      else if (!this.processCallback && !this.options.enableSilenceDetection) {
        this.stopAudioProcessing()
      }
    }
  }

  /**
   * 设置停止说话检测灵敏度
   * @param sensitivity 灵敏度值(0-1)
   */
  public setSpeechStopSensitivity(sensitivity: number): void {
    this.options.speechStopSensitivity = Math.max(0, Math.min(1, sensitivity))
  }

  /**
   * 设置停止说话检测持续时间
   * @param duration 持续时间(ms)
   */
  public setSpeechStopDuration(duration: number): void {
    this.options.speechStopDuration = Math.max(100, duration)
  }

  // 私有方法

  /**
   * 处理录音数据
   * @param event 数据可用事件
   */
  private handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data)
    }
  }

  /**
   * 处理录音停止事件
   */
  private async handleRecordingStopped(): Promise<void> {
    this.endTime = Date.now()
    this.state = 'inactive'
    this.changeState('inactive')

    if (this.recordedChunks.length > 0 && this.dataCallback) {
      const duration = this.endTime - this.startTime

      // 静音比例检查（当启用时）
      if (
        this.options.silencePercentageThreshold !== undefined
        && duration > 0
      ) {
        const silencePercentage = this.silenceTotalTime / duration

        if (silencePercentage > this.options.silencePercentageThreshold) {
          this.recordedChunks = [] // 清除录音数据

          // 触发错误回调（可选）
          if (this.errorCallback) {
            this.errorCallback(
              new Error(
                `静音时长占比(${Math.round(silencePercentage * 100)}%)，超出设置(${Math.round(this.options.silencePercentageThreshold * 100)}%)`,
              ),
            )
          }
          return // 直接返回不生成音频
        }
      }

      const res = await this.getRecording(this.options.format)
      this.dataCallback(res)
    }
  }

  /**
   * 处理错误
   * @param error 错误对象
   */
  private handleError(error: Error): void {
    console.error('录音错误:', error)
    if (this.errorCallback) {
      this.errorCallback(error)
    }
  }

  /**
   * 状态变化处理
   * @param state 新状态
   */
  private changeState(state: RecordingState): void {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(state)
    }
  }

  /**
   * 开始音频处理
   */
  private startAudioProcessing(): void {
    if (!this.analyser || this.processorInterval !== null) {
      return
    }

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    this.processorInterval = window.setInterval(() => {
      if (!this.analyser) return

      const currentTime = Date.now()
      let timeElapsed = 0

      // 计算经过时间（首次运行不计算）
      if (this.lastProcessTime !== 0) {
        timeElapsed = currentTime - this.lastProcessTime
      }

      this.analyser.getByteFrequencyData(dataArray)

      // 计算当前音量级别 (0-1)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength / 255 // 归一化到0-1

      // 静音检测与计时
      if (timeElapsed > 0) {
        const isSilent = average < (this.options.silenceThreshold || 0.05)
        if (isSilent) {
          this.silenceTotalTime += timeElapsed
        }
      }

      this.lastProcessTime = currentTime

      // 处理音频回调
      if (this.processCallback) {
        this.processCallback(average)
      }

      // 静音检测
      if (this.options.enableSilenceDetection) {
        this.detectSilence(average)
      }

      // 停止说话检测
      if (this.options.enableSpeechStopDetection) {
        this.detectSpeechStop(average)
      }
    }, 100) // 每100ms检测一次
  }

  /**
   * 停止音频处理
   */
  private stopAudioProcessing(): void {
    if (this.processorInterval !== null) {
      clearInterval(this.processorInterval)
      this.processorInterval = null
    }

    if (this.silenceTimer !== null) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }

    if (this.speechStopTimer !== null) {
      clearTimeout(this.speechStopTimer)
      this.speechStopTimer = null
    }

    if (this.speakingConfirmationTimer !== null) {
      clearTimeout(this.speakingConfirmationTimer)
      this.speakingConfirmationTimer = null
    }

    this.silenceStart = null
    this.speechStopStart = null
    this.potentialSpeakingStart = null
    this.consecutiveSpeakingSamples = 0
    this.isSpeaking = false
    this.backgroundLevel = 0
    this.speechLevel = 0
    this.silenceDetected = false
    this.speechStopped = false
  }

  /**
   * 检测静音
   * @param audioLevel 音频级别 (0-1)
   */
  private detectSilence(audioLevel: number): void {
    const threshold = this.options.silenceThreshold || 0.05

    if (audioLevel < threshold) {
      // 开始计时静音
      if (this.silenceStart === null) {
        this.silenceStart = Date.now()
      }
      else {
        const silenceDuration = Date.now() - this.silenceStart

        // 如果静音持续足够长时间
        if (silenceDuration >= (this.options.silenceDuration || 1500)) {
          // 防止重复触发
          if (this.silenceTimer === null) {
            this.silenceTimer = window.setTimeout(() => {
              // 触发静音回调
              if (this.silenceDetectedCallback && !this.silenceDetected) {
                this.silenceDetected = true
                this.silenceDetectedCallback(true) // 传递静音状态为true
              }

              // 如果设置了自动停止
              if (this.options.autoStopOnSilence) {
                this.stop()
              }

              this.silenceTimer = null
              this.silenceStart = null
            }, 100)
          }
        }
      }
    }
    else {
      // 重置静音检测
      this.silenceStart = null
      if (this.silenceTimer !== null) {
        clearTimeout(this.silenceTimer)
        this.silenceTimer = null
      }
      // 如果音量超过阈值，重置静音状态
      if (this.silenceDetectedCallback && this.silenceDetected) {
        this.silenceDetected = false
        this.silenceDetectedCallback(false) // 传递静音状态为false
      }
    }
  }

  /**
   * 检测停止说话
   * @param audioLevel 音频级别 (0-1)
   */
  private detectSpeechStop(audioLevel: number): void {
    const now = Date.now()

    // 更新背景音量（使用指数移动平均）
    if (!this.isSpeaking) {
      this.backgroundLevel = this.backgroundLevel * 0.95 + audioLevel * 0.05
    }

    // 检测是否有潜在的说话声音
    if (!this.isSpeaking) {
      // 使用更严格的条件判断是否为人声
      // 1. 音量必须超过背景音量的3倍（提高门槛）
      // 2. 音量必须超过最小说话音量阈值
      // 3. 必须连续几个样本都满足条件
      if (audioLevel > Math.max(this.backgroundLevel * 3, this.minSpeechVolume)) {
        if (this.potentialSpeakingStart === null) {
          this.potentialSpeakingStart = now
          this.consecutiveSpeakingSamples = 1
        }
        else {
          this.consecutiveSpeakingSamples++

          // 如果连续3个样本（300ms）都检测到较高音量，则确认为说话
          if (this.consecutiveSpeakingSamples >= 3 && this.speakingConfirmationTimer === null) {
            this.speakingConfirmationTimer = window.setTimeout(() => {
              this.isSpeaking = true
              this.speechLevel = audioLevel
              this.speechStartTime = now
              this.lastSpeechTime = now

              // 重置停止说话状态
              if (this.speechStopDetectedCallback && !this.speechStopped) {
                this.speechStopped = false
                this.speechStopDetectedCallback(false)
              }

              this.speakingConfirmationTimer = null
            }, 50) // 短暂延迟以确认
          }
        }
      }
      else {
        // 如果音量下降，重置潜在说话检测
        this.potentialSpeakingStart = null
        this.consecutiveSpeakingSamples = 0

        if (this.speakingConfirmationTimer !== null) {
          clearTimeout(this.speakingConfirmationTimer)
          this.speakingConfirmationTimer = null
        }
      }
    }
    // 检测是否停止说话
    else {
      // 更新说话音量（使用指数移动平均）
      this.speechLevel = this.speechLevel * 0.95 + audioLevel * 0.05

      // 如果当前音量高于阈值，更新最后说话时间
      if (audioLevel > this.speechLevel * this.options.speechStopSensitivity!) {
        this.lastSpeechTime = now
        // 如果音量恢复，重置停止说话状态
        if (this.speechStopDetectedCallback && this.speechStopped) {
          this.speechStopped = false
          this.speechStopDetectedCallback(false)
        }
      }
      // 如果音量低于阈值，检查是否持续足够长时间
      else {
        const stopDuration = now - this.lastSpeechTime

        // 如果持续足够长时间，触发停止说话事件
        if (stopDuration >= this.options.speechStopDuration!) {
          // 触发停止说话回调
          if (this.speechStopDetectedCallback && !this.speechStopped) {
            this.speechStopped = true
            this.speechStopDetectedCallback(true)
          }

          // 重置状态
          this.isSpeaking = false
          this.speechLevel = 0
          this.speechStartTime = null
          this.lastSpeechTime = null
          this.potentialSpeakingStart = null
          this.consecutiveSpeakingSamples = 0
        }
      }
    }
  }

  /**
   * 获取支持的MIME类型
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return ''
  }
}
