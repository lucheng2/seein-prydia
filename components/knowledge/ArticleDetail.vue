<script setup lang="ts">
import type { ArticleDetailEmits, ArticleDetailProps } from './types'

const props = withDefaults(defineProps<ArticleDetailProps>(), {
    loading: false,
})

const emit = defineEmits<ArticleDetailEmits>()

// 检测是否为移动端
const isMobile = ref(false)

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

const handleBack = () => {
    emit('back')
}

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
            <el-button v-if="isMobile" type="text" class="back-btn" @click="handleBack">
                <el-icon>
                    <ElIconArrowLeft />
                </el-icon>
                Back to List
            </el-button>

            <div v-if="article" class="article-meta">
                <h1 class="article-title">{{ article.title }}</h1>
                <div class="article-info">
                    <span v-if="article.createTime" class="time">
                        Published: {{ formatTime(article.createTime) }}
                    </span>
                    <span v-if="article.updateTime && article.updateTime !== article.createTime" class="time">
                        Updated: {{ formatTime(article.updateTime) }}
                    </span>
                </div>
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
        padding: 24px 32px 16px;
        border-bottom: 1px solid var(--el-border-color-light);
        background: var(--el-bg-color);

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
        font-size: 28px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        line-height: 1.3;
    }

    .article-info {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .time {
            font-size: 14px;
            color: var(--el-text-color-regular);
        }
    }
}

.loading-state {
    padding: 80px 20px;
    text-align: center;
    color: var(--el-text-color-regular);

    .loading-icon {
        font-size: 32px;
        margin-bottom: 16px;
    }
}

.article-content {
    :deep(.seein-markdown) {
        padding: 32px;
        border: none;
        border-radius: 0;
        background: transparent;

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin-top: 32px;
            margin-bottom: 16px;

            &:first-child {
                margin-top: 0;
            }
        }

        p {
            margin-bottom: 16px;
            line-height: 1.7;
            color: var(--el-text-color-primary);
        }

        code {
            background: var(--el-fill-color);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }

        pre {
            background: var(--el-fill-color-light);
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
        }

        blockquote {
            border-left: 4px solid var(--el-color-primary);
            padding-left: 16px;
            margin: 16px 0;
            color: var(--el-text-color-regular);
            background: var(--el-fill-color-blank);
            padding: 16px;
            border-radius: 0 8px 8px 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;

            th,
            td {
                border: 1px solid var(--el-border-color);
                padding: 8px 12px;
                text-align: left;
            }

            th {
                background: var(--el-fill-color-light);
                font-weight: 600;
            }
        }

        ul,
        ol {
            padding-left: 24px;
            margin: 16px 0;

            li {
                margin: 8px 0;
                line-height: 1.6;
            }
        }
    }
}

.empty-state {
    padding: 120px 32px;
    text-align: center;

    .empty-icon {
        font-size: 72px;
        margin-bottom: 24px;
        opacity: 0.6;
    }

    .empty-title {
        font-size: 20px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
    }

    .empty-subtitle {
        color: var(--el-text-color-regular);
        line-height: 1.5;
    }
}

// 移动端适配
@media (max-width: 768px) {
    .article-detail {
        &__header {
            padding: 16px;
        }
    }

    .article-meta {
        .article-title {
            font-size: 22px;
        }

        .article-info {
            .time {
                font-size: 13px;
            }
        }
    }

    .article-content {
        :deep(.seein-markdown) {
            padding: 20px 16px;

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                margin-top: 24px;
                margin-bottom: 12px;
            }

            p {
                margin-bottom: 12px;
                line-height: 1.6;
            }

            pre {
                padding: 12px;
                font-size: 14px;
            }
        }
    }

    .empty-state {
        padding: 80px 16px;

        .empty-icon {
            font-size: 56px;
        }

        .empty-title {
            font-size: 18px;
        }
    }
}
</style>
