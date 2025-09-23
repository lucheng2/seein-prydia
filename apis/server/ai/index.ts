import { server } from '@/apis/utils/http'

/** 获取聊天会话记录 */
export const getChatSession = (params?: any) => {
  return server.get('/chat-api/chat/findAllPageByUserId', params)
}

/** 获取聊天记录 */
export const getChatRecord = (conversationId: string) => {
  return server.post(`/chat-api/chat/findMessageByConversationId?conversationId=${conversationId}`)
}
