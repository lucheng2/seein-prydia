export class SpriteRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private spriteImage: HTMLImageElement
  private spriteLoaded: boolean = false
  private originalWidth: number = 0
  private originalHeight: number = 0
  private scaleRatio: number = 1
  private targetScaleRatio: number = 1 // 目标缩放比例，用于平滑过渡
  private resizeObserver: ResizeObserver | null = null
  private pendingRenders: Array<{ x: number, y: number, w: number, h: number, rotation?: number }> = []
  private lastRenderArgs: { x: number, y: number, w: number, h: number, rotation?: number } | null = null
  private loadPromise: Promise<void>
  private isFirstRender: boolean = true
  private renderedWidth: number = 0
  private renderedHeight: number = 0
  private animationFrameId: number | null = null

  // 旋转相关属性
  private rotationAngle: number = 0 // 当前旋转角度（弧度）
  private targetRotationAngle: number = 0 // 目标旋转角度（弧度）

  // 二次截取配置
  private cropX: number | null = null // 可以为null，表示使用第一次裁剪的值
  private cropY: number | null = null
  private cropWidth: number | null = null
  private cropHeight: number | null = null
  private useCrop: boolean = false // 只要有一个裁剪参数被设置，就启用二次裁剪

  // 填充模式选项
  private fillMode: 'contain' | 'cover' | 'stretch' = 'cover'

  // 响应式配置
  private transitionSpeed: number = 0.15 // 缩放过渡速度，值越小过渡越平滑
  private rotationSpeed: number = 0.15 // 旋转过渡速度

  // 事件监听存储对象
  private eventListeners: {
    resize: Array<(width: number, height: number, scale: number) => void>
    load: Array<() => void>
    rotate: Array<(angle: number) => void> // 旋转事件
  } = {
      resize: [],
      load: [],
      rotate: [],
    }

  // 构造函数
  constructor(
    canvasId: string,
    spriteUrl: string,
    cropX?: number,
    cropY?: number,
    cropWidth?: number,
    cropHeight?: number,
    fillMode: 'contain' | 'cover' | 'stretch' = 'cover',
    transitionSpeed?: number,
    rotationSpeed?: number,
    initialRotation?: number, // 初始旋转角度（度）
  ) {
    // 获取canvas元素
    const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvasElement) {
      throw new Error(`Canvas with id "${canvasId}" not found`)
    }
    this.canvas = canvasElement

    // 设置canvas基础样式
    this.canvas.style.display = 'block'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.margin = '0'
    this.canvas.style.padding = '0'

    // 设置父容器样式
    if (this.canvas.parentElement) {
      this.canvas.parentElement.style.position = 'relative'
      this.canvas.parentElement.style.overflow = 'hidden'
    }

    // 获取2D上下文
    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context for canvas')
    }
    this.ctx = context

    // 处理二次截取参数
    this.cropX = cropX !== undefined ? cropX : null
    this.cropY = cropY !== undefined ? cropY : null
    this.cropWidth = cropWidth !== undefined ? cropWidth : null
    this.cropHeight = cropHeight !== undefined ? cropHeight : null

    // 只要有一个裁剪参数被设置，就启用二次裁剪
    this.useCrop = this.cropX !== null || this.cropY !== null
      || this.cropWidth !== null || this.cropHeight !== null

    // 设置填充模式和过渡速度
    this.fillMode = fillMode
    if (transitionSpeed !== undefined && transitionSpeed > 0 && transitionSpeed <= 1) {
      this.transitionSpeed = transitionSpeed
    }

    // 设置旋转过渡速度
    if (rotationSpeed !== undefined && rotationSpeed > 0 && rotationSpeed <= 1) {
      this.rotationSpeed = rotationSpeed
    }

    // 设置初始旋转角度（转换为弧度）
    if (initialRotation !== undefined) {
      this.rotationAngle = this.degreesToRadians(initialRotation)
      this.targetRotationAngle = this.rotationAngle
    }

    // 初始化图片加载Promise
    this.loadPromise = new Promise((resolve, reject) => {
      this.spriteImage = new Image()
      this.spriteImage.crossOrigin = 'anonymous'

      this.spriteImage.onload = () => {
        this.spriteLoaded = true
        this.originalWidth = this.spriteImage.width
        this.originalHeight = this.spriteImage.height

        // 确保DOM布局完成后再计算尺寸
        requestAnimationFrame(() => {
          this.adjustCanvasSize()
          this.scaleRatio = this.targetScaleRatio
          this.executePendingRenders()
          resolve()
          this.triggerEvent('load')
        })
      }

      this.spriteImage.onerror = () => {
        const error = new Error(`Failed to load sprite image from "${spriteUrl}"`)
        reject(error)
      }

      this.spriteImage.src = spriteUrl
    })

    this.setupResponsive()
  }

  // 角度转换：度 -> 弧度
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // 角度转换：弧度 -> 度
  private radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI)
  }

  // 触发事件
  private triggerEvent(eventName: 'resize' | 'load' | 'rotate', ...args: any[]) {
    if (this.eventListeners[eventName as keyof typeof this.eventListeners]) {
      (this.eventListeners[eventName as keyof typeof this.eventListeners] as any[]).forEach((callback) => {
        callback(...args)
      })
    }
  }

  // 公共事件监听方法
  on(eventName: 'resize', callback: (width: number, height: number, scale: number) => void): void
  on(eventName: 'load', callback: () => void): void
  on(eventName: 'rotate', callback: (angle: number) => void): void
  on(eventName: any, callback: any) {
    if (this.eventListeners[eventName as keyof typeof this.eventListeners]) {
      (this.eventListeners[eventName as keyof typeof this.eventListeners] as any[]).push(callback)
    }
  }

  // 移除事件监听
  off(eventName: 'resize' | 'load' | 'rotate', callback?: any) {
    if (this.eventListeners[eventName]) {
      if (callback) {
        this.eventListeners[eventName] = this.eventListeners[eventName].filter(
          cb => cb !== callback,
        )
      }
      else {
        this.eventListeners[eventName] = []
      }
    }
  }

  private executePendingRenders() {
    if (this.pendingRenders.length > 0) {
      this.pendingRenders.forEach(args => this.renderSprite(args))
      this.pendingRenders = []
    }
  }

  private renderSprite(args: { x: number, y: number, w: number, h: number, rotation?: number }) {
    const { x, y, w, h, rotation = 0 } = args

    const previousWidth = this.renderedWidth
    const previousHeight = this.renderedHeight
    const previousScale = this.scaleRatio
    const previousRotation = this.rotationAngle

    this.lastRenderArgs = args
    const dpr = window.devicePixelRatio || 1

    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr)

    // 计算绘制位置（居中显示）
    const parentRect = this.canvas.parentElement?.getBoundingClientRect()
    if (!parentRect) return

    // 计算最终截取区域
    let finalX = x
    let finalY = y
    let finalWidth = w
    let finalHeight = h

    if (this.useCrop) {
      finalX += this.cropX !== null ? this.cropX : 0
      finalY += this.cropY !== null ? this.cropY : 0
      finalWidth = this.cropWidth !== null ? this.cropWidth : finalWidth
      finalHeight = this.cropHeight !== null ? this.cropHeight : finalHeight
    }

    // 处理拉伸模式的缩放
    let scaleX = this.scaleRatio
    let scaleY = this.scaleRatio

    if (this.fillMode === 'stretch') {
      scaleX = parentRect.width / finalWidth
      scaleY = parentRect.height / finalHeight
    }

    // 更新目标旋转角度（将传入的角度转为弧度）
    this.targetRotationAngle = this.degreesToRadians(rotation)

    // 处理旋转和平滑过渡
    let needsUpdate = false

    // 旋转过渡
    if (Math.abs(this.rotationAngle - this.targetRotationAngle) > 0.001) {
      // 计算最短旋转路径
      let angleDiff = this.targetRotationAngle - this.rotationAngle
      if (angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI
      }
      else if (angleDiff < -Math.PI) {
        angleDiff += 2 * Math.PI
      }

      this.rotationAngle += angleDiff * this.rotationSpeed
      needsUpdate = true
    }

    // 缩放过渡（非拉伸模式）
    if (this.fillMode !== 'stretch' && Math.abs(this.scaleRatio - this.targetScaleRatio) > 0.001) {
      this.scaleRatio += (this.targetScaleRatio - this.scaleRatio) * this.transitionSpeed
      needsUpdate = true
    }
    // 拉伸模式下的平滑过渡
    else if (this.fillMode === 'stretch') {
      const targetScaleX = parentRect.width / finalWidth
      const targetScaleY = parentRect.height / finalHeight

      if (Math.abs(scaleX - targetScaleX) > 0.001 || Math.abs(scaleY - targetScaleY) > 0.001) {
        scaleX += (targetScaleX - scaleX) * this.transitionSpeed
        scaleY += (targetScaleY - scaleY) * this.transitionSpeed
        needsUpdate = true
      }
    }

    // 如果需要更新，继续动画
    if (needsUpdate) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      this.animationFrameId = requestAnimationFrame(() => {
        this.renderSprite(args)
      })
    }

    // 计算实际渲染尺寸
    this.renderedWidth = finalWidth * (this.fillMode === 'stretch' ? scaleX : this.scaleRatio)
    this.renderedHeight = finalHeight * (this.fillMode === 'stretch' ? scaleY : this.scaleRatio)

    // 保存当前上下文状态
    this.ctx.save()

    // 将原点移动到画布中心
    this.ctx.translate(parentRect.width / 2, parentRect.height / 2)

    // 应用旋转
    this.ctx.rotate(this.rotationAngle)

    // 绘制图片（相对于中心定位）
    this.ctx.drawImage(
      this.spriteImage,
      finalX,
      finalY,
      finalWidth,
      finalHeight, // 从雪碧图中截取的区域
      -this.renderedWidth / 2, // 相对于中心的X位置
      -this.renderedHeight / 2, // 相对于中心的Y位置
      this.renderedWidth, // 绘制的宽度
      this.renderedHeight, // 绘制的高度
    )

    // 恢复上下文状态
    this.ctx.restore()

    // 检查变化并触发事件
    if (
      Math.abs(previousWidth - this.renderedWidth) > 0.5
      || Math.abs(previousHeight - this.renderedHeight) > 0.5
      || (this.fillMode !== 'stretch' && Math.abs(previousScale - this.scaleRatio) > 0.001)
      || Math.abs(previousRotation - this.rotationAngle) > 0.001
    ) {
      if (Math.abs(previousRotation - this.rotationAngle) > 0.001) {
        this.triggerEvent('rotate', this.radiansToDegrees(this.rotationAngle))
      }
      this.triggerEvent('resize', this.renderedWidth, this.renderedHeight, this.fillMode === 'stretch' ? Math.max(scaleX, scaleY) : this.scaleRatio)
    }

    // 首次渲染后强制重新计算
    if (this.isFirstRender) {
      this.isFirstRender = false
      requestAnimationFrame(() => {
        this.handleResize()
      })
    }
  }

  private setupResponsive(): void {
    requestAnimationFrame(() => {
      this.adjustCanvasSize()
    })

    // 防抖处理窗口resize事件
    const debouncedResize = this.debounce(() => this.handleResize(), 50)
    window.addEventListener('resize', debouncedResize)

    this.resizeObserver = new ResizeObserver((entries) => {
      debouncedResize()
    })

    if (this.canvas.parentElement) {
      this.resizeObserver.observe(this.canvas.parentElement)
    }
  }

  // 防抖函数
  private debounce(func: () => void, wait: number): () => void {
    let timeout: number | null = null
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = window.setTimeout(() => {
        func()
        timeout = null
      }, wait)
    }
  }

  private handleResize() {
    this.adjustCanvasSize()
    if (this.spriteLoaded && this.lastRenderArgs) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      this.animationFrameId = requestAnimationFrame(() => {
        this.renderSprite(this.lastRenderArgs)
      })
    }
  }

  private adjustCanvasSize(): void {
    if (!this.canvas.parentElement) return

    const parentWidth = this.canvas.parentElement.clientWidth
    const parentHeight = this.canvas.parentElement.clientHeight
    const dpr = window.devicePixelRatio || 1

    // 设置canvas实际尺寸
    this.canvas.width = parentWidth * dpr
    this.canvas.height = parentHeight * dpr

    // 重置上下文变换
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(dpr, dpr)

    // 计算目标缩放比例（非拉伸模式）
    if (this.spriteLoaded && this.fillMode !== 'stretch') {
      if (this.lastRenderArgs) {
        const { w: renderWidth, h: renderHeight } = this.lastRenderArgs
        let widthToUse = renderWidth
        let heightToUse = renderHeight

        if (this.useCrop) {
          widthToUse = this.cropWidth !== null ? this.cropWidth : widthToUse
          heightToUse = this.cropHeight !== null ? this.cropHeight : heightToUse
        }

        let scaleX = 1
        let scaleY = 1

        if (widthToUse > parentWidth) {
          scaleX = parentWidth / widthToUse
        }

        if (heightToUse > parentHeight) {
          scaleY = parentHeight / heightToUse
        }

        this.targetScaleRatio = scaleX === 1 && scaleY === 1
          ? (this.fillMode === 'cover' ? Math.max(parentWidth / widthToUse, parentHeight / heightToUse) : Math.min(parentWidth / widthToUse, parentHeight / heightToUse))
          : Math.min(scaleX, scaleY)
      }
      else {
        let widthToUse = this.originalWidth
        let heightToUse = this.originalHeight

        if (this.useCrop) {
          widthToUse = this.cropWidth !== null ? this.cropWidth : widthToUse
          heightToUse = this.cropHeight !== null ? this.cropHeight : heightToUse
        }

        let scaleX = 1
        let scaleY = 1

        if (widthToUse > parentWidth) {
          scaleX = parentWidth / widthToUse
        }

        if (heightToUse > parentHeight) {
          scaleY = parentHeight / heightToUse
        }

        this.targetScaleRatio = scaleX === 1 && scaleY === 1
          ? (this.fillMode === 'cover' ? Math.max(parentWidth / widthToUse, parentHeight / heightToUse) : Math.min(parentWidth / widthToUse, parentHeight / heightToUse))
          : Math.min(scaleX, scaleY)
      }
    }
  }

  // 单独设置裁剪参数的方法
  setCropParams(cropX?: number, cropY?: number, cropWidth?: number, cropHeight?: number): void {
    if (cropX !== undefined) this.cropX = cropX
    if (cropY !== undefined) this.cropY = cropY
    if (cropWidth !== undefined) this.cropWidth = cropWidth
    if (cropHeight !== undefined) this.cropHeight = cropHeight

    this.useCrop = this.cropX !== null || this.cropY !== null
      || this.cropWidth !== null || this.cropHeight !== null

    this.handleResize()
  }

  // 设置填充模式
  setFillMode(mode: 'contain' | 'cover' | 'stretch'): void {
    this.fillMode = mode
    this.handleResize()
  }

  // 获取当前填充模式
  getFillMode(): 'contain' | 'cover' | 'stretch' {
    return this.fillMode
  }

  // 设置过渡速度
  setTransitionSpeed(speed: number): void {
    if (speed > 0 && speed <= 1) {
      this.transitionSpeed = speed
    }
  }

  // 设置旋转过渡速度
  setRotationSpeed(speed: number): void {
    if (speed > 0 && speed <= 1) {
      this.rotationSpeed = speed
    }
  }

  // 获取渲染方法 - 现在包含rotation参数
  getRenderer() {
    return (p: { x: number, y: number, w: number, h: number }, rotation?: number) => {
      const { x, y, w, h } = p
      if (this.spriteLoaded) {
        this.renderSprite({ x, y, w, h, rotation })
      }
      else {
        this.pendingRenders.push({ x, y, w, h, rotation })
      }
    }
  }

  // 获取实际渲染的宽度
  getRenderedWidth(): number {
    return this.renderedWidth
  }

  // 获取实际渲染的高度
  getRenderedHeight(): number {
    return this.renderedHeight
  }

  // 获取当前缩放比例
  getScaleRatio(): number {
    return this.scaleRatio
  }

  // 获取当前旋转角度（度）
  getRotationAngle(): number {
    return this.radiansToDegrees(this.rotationAngle)
  }

  // 等待图片加载完成
  waitForLoad(): Promise<void> {
    return this.loadPromise
  }

  destroy() {
    if (this.resizeObserver) {
      if (this.canvas.parentElement) {
        this.resizeObserver.unobserve(this.canvas.parentElement)
      }
      this.resizeObserver.disconnect()
    }
    window.removeEventListener('resize', () => this.handleResize())
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.pendingRenders = []
    this.lastRenderArgs = null
    this.renderedWidth = 0
    this.renderedHeight = 0
    // 清空事件监听
    this.eventListeners = {
      resize: [],
      load: [],
      rotate: [],
    }
  }
}
