import { server } from '@/apis/utils/http'

/** 获取心情折线图 */
export const getMoodCorve = (params: any) => {
  return server.get('/chat-api/prydia_chat/queryRecentEmotion', params)
}
