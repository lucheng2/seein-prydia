import { server } from '@/apis/utils/http'

/** 获取词云数据 */
export const getWordCloudData = (params?: any) => {
    return server.get('/chat-api/wordcloud/list', params)
}
