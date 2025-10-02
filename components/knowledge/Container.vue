<script setup lang="ts">
import type { Article } from '~/components/knowledge'
import * as api from '~/apis'

// Page settings
useHead({
  title: 'Knowledge Base - Articles & Learning',
})

// Data type definitions have been extracted to ~/components/knowledge/types.ts

// Reactive state
const articles = ref<Article[]>([])
const selectedArticle = ref<Article>()
const loading = ref(false)

// Knowledge base functionality Hook
const useKnowledgeBase = () => {
  // Fetch articles
  const {
    data,
    pending,
    execute: loadArticles,
  } = useAsyncData(
    `chat-knowledge`,
    () => {
      return api.getKnowledgeList()
    },
    { lazy: true },
  )

  // Watch for changes and update state
  watchEffect(() => {
    articles.value = data.value || []
    loading.value = pending.value
  })

  return {
    loadArticles,
  }
}

const { loadArticles } = useKnowledgeBase()

// 事件处理
const handleSelectArticle = (article: Article) => {
  selectedArticle.value = article
}

// 生命周期
onMounted(() => {
  if (import.meta.client) {
    loadArticles()

    // 默认选择第一篇文章（非移动端）
    nextTick(() => {
      if (articles.value.length > 0) {
        selectedArticle.value = articles.value[0]
      }
    })
  }
})
</script>

<template>
  <div class="knowledge-page">
    <div class="knowledge-desktop">
      <!-- 左侧：文章列表 -->
      <div class="knowledge-sidebar">
        <KnowledgeArticleList :articles="articles" :selected-id="selectedArticle?.id" :loading="loading"
          @select="handleSelectArticle" />
      </div>

      <!-- 右侧：文章详情 -->
      <div class="knowledge-main">
        <KnowledgeArticleDetail :article="selectedArticle" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-page {
  height: 100%;
  background-color: #1E1F25;

  border-radius: 30px 30px 30px 30px;
  overflow: hidden;
  background:
        linear-gradient(#1E1F25, #1E1F25) padding-box,
        linear-gradient(135deg, rgba(112, 62, 219, 1), rgba(255, 209, 42, 1)) border-box;
  border: 1px solid transparent;
}

// PC端布局
.knowledge-desktop {
  display: flex;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;

  .knowledge-sidebar {
    width: 213px;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: sticky;
    top: 0;
  }

  .knowledge-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}

// 滚动条样式
.knowledge-sidebar,
.knowledge-main {
  @include no-arrow-scrollbar;
}
</style>
