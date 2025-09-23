export function base64ToMp3Url(base64Data) {
  // 转换为 Blob 或 File 对象
  const byteCharacters = atob(base64Data)
  const byteArrays = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays[i] = byteCharacters.charCodeAt(i)
  }
  const blob = new Blob([byteArrays], { type: 'application/octet-stream' })

  // 生成下载链接
  const url = URL.createObjectURL(blob)
  return url
}

// Blob 对象 转换为Wav格式文件
export function blobToWav(blob) {
  const blobData = new Blob([blob], { type: 'audio/wav' })
  const file = new File([blob], `audio-${Date.now()}.wav`, {
    type: 'audio/wav', // 可选：覆盖原Blob的MIME类型
    lastModified: Date.now(), // 可选：设置最后修改时间
  })
  return file
}

export function arrayBufferToWav(arrayBuffer) {
  const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
  const file = new File([blob], `audio-${Date.now()}.wav`, {
    type: 'audio/wav', // 可选：覆盖原Blob的MIME类型
    lastModified: Date.now(), // 可选：设置最后修改时间
  })
  return file
}

export function float32ArrayToChunks(
  float32Array: Float32Array,
  chunkSize = 1536,
): Float32Array[] {
  // 参数校验
  if (!(float32Array instanceof Float32Array)) {
    throw new TypeError('Expected input to be a Float32Array')
  }

  chunkSize = Math.floor(chunkSize)
  if (chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive integer')
  }

  const totalChunks = Math.ceil(float32Array.length / chunkSize)
  const chunks = Array.from({ length: totalChunks }, () => new Float32Array())

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, float32Array.length)
    chunks[i] = float32Array.subarray(start, end)
  }

  return chunks
}

export function float32ArrayToWav(input, numChannels, sampleRate, bitDepth) {
  // 验证参数
  if (bitDepth !== 16 && bitDepth !== 32) {
    throw new Error('仅支持16位或32位位深度')
  }

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const dataSize = input.length * bytesPerSample

  // 创建ArrayBuffer并设置头部
  const bufferSize = 44 + dataSize
  const arrayBuffer = new ArrayBuffer(bufferSize)
  const view = new DataView(arrayBuffer)

  // 写入RIFF头
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true) // RIFF块大小
  writeString(view, 8, 'WAVE')

  // 写入fmt块
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt块大小固定为16
  view.setUint16(20, bitDepth === 16 ? 1 : 3, true) // 格式类型
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true) // 字节率
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)

  // 写入data块头
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // 填充音频数据
  let offset = 44
  if (bitDepth === 16) {
    // 转换为16位整数
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i])) // 钳制到[-1, 1]
      const intVal = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset, intVal, true)
      offset += 2
    }
  }
  else {
    // 32位浮点直接写入
    for (let i = 0; i < input.length; i++) {
      view.setFloat32(offset, input[i], true)
      offset += 4
    }
  }

  return arrayBuffer
}

// 辅助函数：写入字符串到DataView
export function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

// 下载WAV文件
export function downloadWav(arrayBuffer, fileName = 'output.wav') {
  const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}
