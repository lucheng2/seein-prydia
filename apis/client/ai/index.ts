import { request } from '@/apis/utils/http'
import { fetchEventSource } from '@microsoft/fetch-event-source'

interface IChatMessage {
  type?: 'bot' | 'coach'
  round?: number
  scene?: number
  messageId?: string
  prompt?: string
  ctrl: AbortController
  onMessage: (event: any) => void
  onError: (event: any) => void
  onClose: () => void
}

/** 发送消息SSE - 修复500错误无限重试问题 */
export const sendMessageStream = async ({
  type,
  round,
  scene,
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
  const url = type === 'bot' ? '/chat-api/prydia_chat/chatBot' : '/chat-api/prydia_chat/coachChat'
  return fetchEventSource(url, {
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
      scene: type === 'coach' ? scene : undefined,
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

  return fetchEventSource(`/chat-api/prydia_chat/chatRegenerate`, {
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
  return request.post('/chat-api/prydia_chat/startChat', params)
}

/** 点赞 */
export const likeMessage = (params: any) => {
  return request.post('/chat-api/prydia_chat/likeOrDislike', params)
}

/** 生成对话主题 */
export const generateTopic = (params?: any) => {
  return request.get('/chat-api/prydia_chat/initChatConversationByConversationId', params)
}
