<script setup lang="ts">
import type { Article, ArticleListEmits, ArticleListProps } from './types'

const props = withDefaults(defineProps<ArticleListProps>(), {
    articles: () => [],
    loading: false,
})

const emit = defineEmits<ArticleListEmits>()

const handleSelectArticle = (article: Article) => {
    emit('select', article)
}

// 处理加载更多（滚动到底部）
const listRef = ref<HTMLElement>()
const { arrivedState } = useScroll(listRef)

watch(() => arrivedState.bottom, (isBottom) => {
    if (isBottom && !props.loading) {
        emit('loadMore')
    }
})
</script>

<template>
    <div class="article-list">
        <div class="article-list__header">
            <h3 class="title">Knowledge Base</h3>
            <div class="subtitle">Explore knowledge and discover more</div>
        </div>

        <div ref="listRef" class="article-list__content">
            <div v-for="article in articles" :key="article.id" class="article-item"
                :class="{ 'active': selectedId === article.id }" @click="handleSelectArticle(article)">
                <div class="article-item__title">{{ article.title }}</div>
                <div v-if="article.summary" class="article-item__summary">
                    {{ article.summary }}
                </div>
                <div v-if="article.createTime" class="article-item__time">
                    {{ new Date(article.createTime).toLocaleDateString() }}
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-item">
                <el-icon class="is-loading">
                    <ElIconLoading />
                </el-icon>
                <span>Loading...</span>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && articles.length === 0" class="empty-state">
                <div class="empty-icon">📚</div>
                <div class="empty-text">No articles available</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.article-list {
    height: 100%;
    display: flex;
    flex-direction: column;

    &__header {
        padding: 24px 20px 16px;
        border-bottom: 1px solid var(--el-border-color-dark);

        .title {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 600;
            color: #fff;
        }

        .subtitle {
            font-size: 14px;
            color: var(--el-text-color-regular);
            line-height: 1.4;
        }
    }

    &__content {
        flex: 1;
        overflow-y: auto;
        @include no-arrow-scrollbar;
    }
}

.article-item {
    padding: 16px 20px;
    // border-bottom: 1px solid var(--el-border-color-darker);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        // background-color: #E6E8EB;
    }

    &.active {
        background-color: var(--el-color-primary-dark-9);
        border-left: 4px solid #9E94A5;
    }

    &__title {
        font-size: 16px;
        font-weight: 500;
        color: #E6E8EB;
        margin-bottom: 8px;
        line-height: 1.4;

        // 最多显示2行
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__summary {
        font-size: 14px;
        color: #9E94A5;
        margin-bottom: 8px;
        line-height: 1.4;

        // 最多显示3行
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__time {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
    }
}

.loading-item {
    padding: 20px;
    text-align: center;
    color: var(--el-text-color-regular);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.empty-state {
    padding: 60px 20px;
    text-align: center;

    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .empty-text {
        color: var(--el-text-color-placeholder);
        font-size: 14px;
    }
}

// 移动端适配
@media (max-width: 768px) {
    .article-list {
        &__header {
            padding: 16px;

            .title {
                font-size: 18px;
            }
        }
    }

    .article-item {
        padding: 12px 16px;

        &__title {
            font-size: 15px;
        }

        &__summary {
            font-size: 13px;
        }
    }
}
</style>
