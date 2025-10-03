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

watch(
  () => arrivedState.bottom,
  (isBottom) => {
    if (isBottom && !props.loading) {
      emit('loadMore')
    }
  },
)
</script>

<template>
  <div class="article-list">
    <div class="article-list__header">
      <h3 class="title">Knowledge</h3>
    </div>

    <div ref="listRef" class="article-list__content">
      <div
        v-for="article in articles"
        :key="article.id"
        class="article-item"
        :class="{ active: selectedId === article.id }"
        @click="handleSelectArticle(article)"
      >
        <div class="article-item__title">{{ article.title }}</div>
        <!-- <div v-if="article.summary" class="article-item__summary">
                    {{ article.summary }}
                </div>
                <div v-if="article.createTime" class="article-item__time">
                    {{ new Date(article.createTime).toLocaleDateString() }}
                </div> -->
      </div>

      <!-- 加载状态 -->

      <!-- 空状态 -->
      <div v-if="!loading && articles.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-text">No articles available</div>
      </div>

      <div v-else-if="loading" class="loading-item-2">
        <el-icon class="is-loading">
          <ElIconLoading />
        </el-icon>
        <span>Loading...</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0px 0px 0px #302d37;

  &__header {
    padding: 24px 20px 16px;

    .title {
      margin: 0 0 8px 0;
      font-weight: 500;
      font-size: 24px;
      color: #ffffff;
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
  padding: 0 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background-color: var(--el-color-primary-dark-9);
    opacity: 1;

    .article-item__title {
      border-radius: 16px 16px 16px 16px;

      background:
        linear-gradient(#1e1f25, #1e1f25) padding-box,
        linear-gradient(
            to bottom,
            rgba(112, 62, 219, 1),
            rgba(38, 0, 230, 1),
            rgba(255, 209, 42, 1)
          )
          border-box;
      border: 1px solid transparent;

      font-weight: bold;
      color: #ffffff;
    }
  }

  &__title {
    line-height: 1.4;

    // height: 32px;
    font-weight: 400;
    font-size: 14px;
    color: #cbcacc;
    padding: 16px;
  }

  &__summary {
    font-size: 14px;
    color: #9e94a5;
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

.loading-item-2 {
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

/* 移动端适配已移除 */
</style>
