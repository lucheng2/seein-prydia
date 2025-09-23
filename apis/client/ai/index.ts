import { request } from '@/apis/utils/http'
import { fetchEventSource } from '@microsoft/fetch-event-source'

interface IChatMessage {
  round?: number
  messageId?: string
  prompt?: string
  ctrl: AbortController
  onMessage: (event: any) => void
  onError: (event: any) => void
  onClose: () => void
}

/** 发送消息SSE - 修复500错误无限重试问题 */
export const sendMessageStream = async ({
  round,
  prompt,
  ctrl,
  onMessage,
  onError,
  onClose,
}: IChatMessage) => {
  const { getToken } = useUserStore()
  const token = getToken

  // 错误计数器
  let retryCount = 0
  const maxRetries = 2 // 最大重试次数

  return fetchEventSource(`/chat-api/chat/chat`, {
    method: 'post',
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
    openWhenHidden: true,
    body: JSON.stringify({
      round,
      prompt,
    }),
    onmessage: onMessage,

    // 修复点：自定义错误处理
    onerror: (err) => {
      if (ctrl.signal.aborted) {
        console.log('操作已被用户取消')
        return
      }
      retryCount++
      // 500错误或超过重试次数时终止
      if (err.status === 500 || retryCount > maxRetries) {
        // 传递错误信息给外部回调
        onError(err)
        // 抛出错误停止重试
        throw err
      }
      // 其他错误继续重试（默认行为）
      console.warn(`Stream error (retry ${retryCount}/${maxRetries}):`, err)
    },
    onclose: onClose,
    signal: ctrl.signal,
  })
}

/** 重新生成 */
export const regenerateMessage = async ({
  messageId,
  ctrl,
  onMessage,
  onError,
  onClose,
}: IChatMessage) => {
  const { getToken } = useUserStore()
  const token = getToken

  // 错误计数器
  let retryCount = 0
  const maxRetries = 2 // 最大重试次数

  return fetchEventSource(`/chat-api/chat/chatRegenerate`, {
    method: 'post',
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
    openWhenHidden: true,
    body: JSON.stringify({
      messageId,
    }),
    onmessage: onMessage,

    // 修复点：自定义错误处理
    onerror: (err) => {
      if (ctrl.signal.aborted) {
        console.log('操作已被用户取消')
        return
      }
      retryCount++
      // 500错误或超过重试次数时终止
      if (err.status === 500 || retryCount > maxRetries) {
        // 传递错误信息给外部回调
        onError(err)
        // 抛出错误停止重试
        throw err
      }
      // 其他错误继续重试（默认行为）
      console.warn(`Stream error (retry ${retryCount}/${maxRetries}):`, err)
    },
    onclose: onClose,
    signal: ctrl.signal,
  })
}

/** 创建新聊天 */
export const createChat = (params?: any) => {
  return request.post('/api/user/chat/startChat', params)
}

/** 发送消息 */
export const sendMessage = (params: any) => {
  return request.post('/api/user/chat/sendMessage', params)
}

/** 上传语音文件 */
export const uploadVoice = (params: any) => {
  return request.upload('/api/user/chat/sendAudioMessage', params)
}

/** 建立语音聊天 */
export const createVoiceChat = (params?: any) => {
  return request.get('/api/user/chat/establishAudioChat', params)
}

/** 关闭语音聊天 */
export const closeVoiceChat = (params?: any) => {
  return request.get('/api/user/chat/finishAudioChat', params)
}

/** 建立语音聊天WebRTC */
export const createVoiceChatWebRTC = (params?: any) => {
  return request.get('/api/user/chat/v2/establishAudioChat', params)
}

/** 通知WebRTC已就绪 */
export const notifyVoiceChatWebRTCReady = (params?: any) => {
  return request.get('/api/user/chat/v2/audioStreamReady', params)
}

/** 关闭语音聊天WebRTC */
export const closeVoiceChatWebRTC = (params?: any) => {
  return request.get('/api/user/chat/v2/finishAudioChat', params)
}

/** 点赞 */
export const likeMessage = (params: any) => {
  return request.post('/chat-api/chat/likeOrDislike', params)
}

/** 检测是否同意协议 */
export const checkAgreement = (params?: any) => {
  return request.get('/api/user/website_user/getAgreeFlag', params)
}

/** 同意/拒绝协议 */
export const agreeOrRefuseAgreement = (agreeFlag: number) => {
  return request.post(`/api/user/website_user/saveAgreeFlag?agreeFlag=${agreeFlag}`)
}

/** 获取协议内容 */
export const getAgreementMd = (params?: any) => {
  return request.get('/api/user/agent_user/getAgentAgreement', params)
}

/** 申请内测 */
export const applyAiChat = (params?: any) => {
  return request.post('/api/user/chat/applyAiChat', params)
}

/** 生成对话主题 */
export const generateTopic = (params?: any) => {
  return request.get('/chat-api/chat/initChatConversationByConversationId', params)
}
