<script setup lang="ts">
import type { ArticleDetailProps } from './types'

const props = withDefaults(defineProps<ArticleDetailProps>(), {
    loading: false,
})

// 移动端相关逻辑已移除

// 格式化时间
const formatTime = (time?: string) => {
    if (!time) return ''
    return new Date(time).toLocaleString()
}
</script>

<template>
    <div class="article-detail">
        <!-- 头部 -->
        <div class="article-detail__header">

            <div v-if="article" class="article-meta">
                <h1 class="article-title">{{ article.title }}</h1>
                <!-- <div class="article-info">
                    <span v-if="article.createTime" class="time">
                        Published: {{ formatTime(article.createTime) }}
                    </span>
                    <span v-if="article.updateTime && article.updateTime !== article.createTime" class="time">
                        Updated: {{ formatTime(article.updateTime) }}
                    </span>
                </div> -->
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="article-detail__content">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                <el-icon class="is-loading loading-icon">
                    <ElIconLoading />
                </el-icon>
                <span>Loading...</span>
            </div>

            <!-- 文章内容 -->
            <div v-else-if="article" class="article-content">
                <UiMarkdownPreview :value="article.content" />
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
                <div class="empty-icon">📄</div>
                <div class="empty-title">Please select an article</div>
                <div class="empty-subtitle">Select an article from the list to start reading</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.article-detail {
    height: 100%;
    display: flex;
    flex-direction: column;

    &__header {
        padding: 32px 24px 0;
        background: #1E1F25;

        .back-btn {
            margin-bottom: 16px;
            padding: 8px 0;
            color: var(--el-color-primary);

            .el-icon {
                margin-right: 4px;
            }
        }
    }

    &__content {
        flex: 1;
        overflow-y: auto;
        @include no-arrow-scrollbar;
    }
}

.article-meta {
    .article-title {
        margin: 0 0 12px 0;

        font-weight: 500;
        font-size: 24px;
        color: #FFFFFF;
    }

    .article-info {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .time {
            font-size: 14px;
            color: #9E94A5;
        }
    }
}

.article-content {
    padding: 16px 24px;
    :deep(.seein-markdown) {
        --color-fg-default: #CBCACC;
        font-size: 14px;
    }
}


.loading-state {
    padding: 80px 20px;
    text-align: center;
    color: #9E94A5;

    .loading-icon {
        font-size: 32px;
        margin-bottom: 16px;
    }
}

.empty-state {
    padding: 120px 32px;
    text-align: center;

    .empty-icon {
        font-size: 72px;
        margin-bottom: 24px;
        opacity: 0.6;
        color: #fff;
    }

    .empty-title {
        font-size: 20px;
        font-weight: 500;
        color: #fff;
        margin-bottom: 8px;
    }

    .empty-subtitle {
        color: #9E94A5;
        line-height: 1.5;
    }
}

/* 移动端适配已移除 */
</style>
