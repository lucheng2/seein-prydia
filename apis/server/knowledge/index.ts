import { server } from '@/apis/utils/http'

/** 获取知识库文章列表 */
export const getKnowledgeList = (params?: any) => {
    return server.post('/chat-api/prydiaArticle/findAll', params)
}

/** 根据ID获取知识库文章详情 */
export const getKnowledgeDetail = (id: string) => {
    return server.get(`/chat-api/knowledge/articles/${id}`)
}

/** 搜索知识库文章 */
export const searchKnowledge = (params: { keyword: string, page?: number, pageSize?: number }) => {
    return server.get('/chat-api/knowledge/articles/search', params)
}
