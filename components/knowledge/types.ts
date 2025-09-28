// 知识库相关类型定义

/** 知识库文章类型 */
export interface Article {
    id: string
    title: string
    summary?: string
    content: string
    createTime?: string
    updateTime?: string
}

/** 文章列表组件 Props */
export interface ArticleListProps {
    articles: Article[]
    selectedId?: string
    loading?: boolean
}

/** 文章列表组件 Emits */
export interface ArticleListEmits {
    (e: 'select', article: Article): void
    (e: 'loadMore'): void
}

/** 文章详情组件 Props */
export interface ArticleDetailProps {
    article?: Article
    loading?: boolean
}

/** 文章详情组件 Emits */
export interface ArticleDetailEmits {
    (e: 'back'): void
}

/** 搜索栏组件 Props */
export interface SearchBarProps {
    placeholder?: string
    loading?: boolean
}

/** 搜索栏组件 Emits */
export interface SearchBarEmits {
    (e: 'search', keyword: string): void
    (e: 'clear'): void
}

/** API 请求参数类型 */
export interface KnowledgeListParams {
    page?: number
    pageSize?: number
}

export interface KnowledgeSearchParams {
    keyword: string
    page?: number
    pageSize?: number
}

/** API 响应类型 */
export interface KnowledgeListResponse {
    data: Article[]
    total: number
    page: number
    pageSize: number
}

export interface KnowledgeDetailResponse {
    data: Article
}

export interface KnowledgeSearchResponse {
    data: Article[]
    total: number
    page: number
    pageSize: number
}
