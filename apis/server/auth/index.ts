import { server } from '@/apis/utils/http'

/** 获取禁用的开发页面 */
export const getDisabledPages = () => {
  return server.get('/api/user/common/getDisabledUrl')
}

/** 检查聊天权益 */
export const checkChatRight = () => {
  return server.post('/api/user/chat/checkChatRight')
}
