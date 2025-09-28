<script setup lang="ts">
import type { Article } from '~/components/knowledge'
// import * as api from '~/apis' // API to be used when implemented

// Page settings
useHead({
    title: 'Knowledge Base - Articles & Learning',
})

// Data type definitions have been extracted to ~/components/knowledge/types.ts

// Reactive state
const articles = ref<Article[]>([])
const selectedArticle = ref<Article>()
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const isMobile = ref(false)
const showMobileDetail = ref(false)

// Knowledge base functionality Hook
const useKnowledgeBase = () => {
    // Load articles list
    const loadArticles = async (page = 1, reset = false) => {
        try {
            loading.value = true

            // Simulate API call - replace with actual API
            // const response = await api.getKnowledgeList({ page, pageSize: 10 })

            // Mock data (to be replaced with real API)
            const mockArticles: Article[] = [
                {
                    id: '1',
                    title: 'Understanding Artificial Intelligence: From Machine Learning to Deep Learning',
                    summary: 'This article explores the development of artificial intelligence, from basic machine learning algorithms to modern deep learning technologies, helping readers build a correct AI cognitive framework.',
                    content: '# Understanding Artificial Intelligence\n\nArtificial intelligence, as one of the most important technologies of the 21st century...',
                    createTime: '2024-01-15T10:30:00Z',
                    updateTime: '2024-01-15T10:30:00Z',
                },
                {
                    id: '2',
                    title: 'Climate Change and Environmental Protection: Scientific Facts We Need to Know',
                    summary: 'Climate change is one of the major challenges facing the world today. Based on the latest scientific research, this article introduces the causes, impacts, and countermeasures of climate change.',
                    content: '# Climate Change and Environmental Protection\n\nGlobal climate change has become a severe challenge facing humanity...',
                    createTime: '2024-01-12T14:20:00Z',
                },
                {
                    id: '3',
                    title: 'Quantum Computing: Scientific Principles of Next-Generation Computing Technology',
                    summary: 'Quantum computing represents the future direction of computing technology. Learn how quantum mechanics principles are applied to the computing field and how quantum computers work.',
                    content: '# Quantum Computing Technology\n\nQuantum computing utilizes the special properties of quantum mechanics...',
                    createTime: '2024-01-08T09:45:00Z',
                },
                {
                    id: 'placeholder',
                    title: 'Simple Word Cloud Library Guide',
                    summary: 'This is a simple word cloud library tutorial, including installation, usage methods, and complete API documentation.',
                    content: '# Simple Word Cloud Library Guide\n\nThis is a simple word cloud library tutorial, including installation, usage methods, and complete API documentation.\n\n## Installation\n\n```bash\nnpm i simple-word-cloud\n```\n\n## Usage\n\n```html\n<div id="container"></div>\n```\n\n```js\nimport SimpleWordCloud from \'simple-word-cloud\'\n\nconst wordCloud = new SimpleWordCloud({\n  el: document.getElementById(\'container\')\n})\nwordCloud.render([\n  [\'text\', 12, {}]\n])\n```',
                    createTime: '2024-01-01T00:00:00Z',
                },
            ]

            if (reset) {
                articles.value = mockArticles
                currentPage.value = 1
            }
            else {
                articles.value.push(...mockArticles)
            }

            hasMore.value = false
        }
        catch (error) {
            console.error('Failed to load articles:', error)
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

const handleLoadMore = () => {
    if (!loading.value && hasMore.value) {
        currentPage.value++
        loadArticles(currentPage.value)
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
                    @select="handleSelectArticle" @load-more="handleLoadMore" />
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
                    @select="handleSelectArticle" @load-more="handleLoadMore" />
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
    background: var(--el-bg-color-page);
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
        background: var(--el-bg-color);
        border-right: 1px solid var(--el-border-color-light);
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: sticky;
        top: 0;
    }

    .knowledge-main {
        flex: 1;
        background: var(--el-bg-color);
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
        background: var(--el-bg-color);
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
        background: var(--el-bg-color);
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
        background: var(--el-bg-color-page);
    }

    .knowledge-sidebar,
    .knowledge-main,
    .mobile-list-view,
    .mobile-detail-view {
        background: var(--el-bg-color);
    }
}
</style>
