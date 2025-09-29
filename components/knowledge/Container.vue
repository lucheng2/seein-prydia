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
const isMobile = ref(false)
const showMobileDetail = ref(false)

// Knowledge base functionality Hook
const useKnowledgeBase = () => {
    // Load articles list
  const loadArticles = async () => {
        try {
            loading.value = true

            // Get all articles at once
            const response = await api.getKnowledgeList()
            articles.value = response
        }
        catch (error) {
            ElMessage.error('Failed to load articles, please try again later')
        }
        finally {
            loading.value = false
        }
    }

    return {
        loadArticles,
    }
}

const { loadArticles } = useKnowledgeBase()

// 事件处理
const handleSelectArticle = (article: Article) => {
    selectedArticle.value = article
    if (isMobile.value) {
        showMobileDetail.value = true
    }
}

const handleMobileBack = () => {
    showMobileDetail.value = false
}

// 响应式检测
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
}

// 生命周期
onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    loadArticles()

    // 默认选择第一篇文章（非移动端）
    nextTick(() => {
        if (!isMobile.value && articles.value.length > 0) {
            selectedArticle.value = articles.value[0]
        }
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})
</script>

<template>
    <div class="knowledge-page">
        <!-- PC端布局 -->
        <div v-if="!isMobile" class="knowledge-desktop">
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

        <!-- 移动端布局 -->
        <div v-else class="knowledge-mobile">
            <!-- 文章列表视图 -->
            <div v-if="!showMobileDetail" class="mobile-list-view">
                <KnowledgeArticleList :articles="articles" :selected-id="selectedArticle?.id" :loading="loading"
                    @select="handleSelectArticle" />
            </div>

            <!-- 文章详情视图 -->
            <div v-else class="mobile-detail-view">
                <KnowledgeArticleDetail :article="selectedArticle" :loading="loading" @back="handleMobileBack" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.knowledge-page {
    min-height: 100vh;
    background-color: #1E1F25;
}

// PC端布局
.knowledge-desktop {
    display: flex;
    height: 100vh;
    max-width: 1400px;
    margin: 0 auto;

    .knowledge-sidebar {
        width: 400px;
        min-width: 320px;
        max-width: 480px;
        background: #1E1F25;
        border-right: 1px solid var(--el-border-color-light);
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: sticky;
        top: 0;
    }

    .knowledge-main {
        flex: 1;
        background: #1E1F25;
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
    }
}

// 移动端布局
.knowledge-mobile {

    .mobile-list-view,
    .mobile-detail-view {
        min-height: 100vh;
        background: #1E1F25;
    }

    .mobile-list-view {
        display: flex;
        flex-direction: column;
    }

    .mobile-detail-view {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        background: #1E1F25;
        display: flex;
        flex-direction: column;
    }
}

// 响应式适配
@media (max-width: 1200px) {
    .knowledge-desktop {
        .knowledge-sidebar {
            width: 350px;
            min-width: 300px;
        }
    }
}

@media (max-width: 992px) {
    .knowledge-desktop {
        .knowledge-sidebar {
            width: 320px;
            min-width: 280px;
        }
    }
}

// 平板适配
@media (max-width: 768px) {
    .knowledge-page {
        padding: 0;
    }
}

// 过渡动画
.mobile-detail-view {
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}

// 滚动条样式
.knowledge-sidebar,
.knowledge-main {
    @include no-arrow-scrollbar;
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
    .knowledge-page {
        background: #1E1F25;
    }

    .knowledge-sidebar,
    .knowledge-main,
    .mobile-list-view,
    .mobile-detail-view {
        background: #1E1F25;
    }
}
</style>
