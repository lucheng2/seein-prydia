/** 词云数据项接口 */
export interface WordCloudItem {
    /** 词语文本 */
    text: string
    /** 词语权重值，决定显示大小 */
    weight: number
}

/** 词云API响应接口 */
export interface WordCloudResponse {
    /** 词云数据列表 */
    data: WordCloudItem[]
    /** 是否成功 */
    success: boolean
    /** 消息 */
    message?: string
}
