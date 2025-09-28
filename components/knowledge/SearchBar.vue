<script setup lang="ts">
import type { SearchBarEmits, SearchBarProps } from './types'

const props = withDefaults(defineProps<SearchBarProps>(), {
    placeholder: 'Search articles...',
})

const emit = defineEmits<SearchBarEmits>()

const keyword = ref('')
const searchLoading = ref(false)

// 搜索防抖
const triggerSearch = useDebounceFn(() => {
    if (keyword.value.trim()) {
        emit('search', keyword.value.trim())
    }
    else {
        emit('clear')
    }
}, 300)

// 监听输入变化
watch(keyword, () => {
    triggerSearch()
})

// 清空搜索
const handleClear = () => {
    keyword.value = ''
    emit('clear')
}

// 暴露方法
defineExpose({
    clear: handleClear,
})
</script>

<template>
    <div class="search-bar">
        <div class="search-input-wrapper">
            <el-input v-model="keyword" :placeholder="placeholder" clearable class="search-input" @clear="handleClear">
                <template #prefix>
                    <el-icon v-if="!loading" class="search-icon">
                        <ElIconSearch />
                    </el-icon>
                    <el-icon v-else class="search-icon is-loading">
                        <ElIconLoading />
                    </el-icon>
                </template>
            </el-input>
        </div>

        <!-- 搜索提示 -->
        <div v-if="keyword" class="search-hint">
            <span class="hint-text">Search results for "{{ keyword }}"</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.search-bar {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);

    .search-input-wrapper {
        position: relative;

        .search-input {
            :deep(.el-input__wrapper) {
                border-radius: 24px;
                padding: 8px 16px;
                background: var(--el-fill-color-blank);
                border: 1px solid var(--el-border-color-light);
                transition: all 0.2s ease;

                &:hover {
                    border-color: var(--el-color-primary-light-5);
                }

                &.is-focus {
                    border-color: var(--el-color-primary);
                    box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
                }
            }

            :deep(.el-input__inner) {
                font-size: 14px;
                height: 20px;
                line-height: 20px;
            }

            :deep(.el-input__prefix) {
                color: var(--el-text-color-placeholder);
            }
        }

        .search-icon {
            font-size: 16px;
            transition: color 0.2s ease;
        }
    }

    .search-hint {
        margin-top: 8px;

        .hint-text {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
            padding-left: 16px;
        }
    }
}

// 移动端适配
@media (max-width: 768px) {
    .search-bar {
        padding: 12px 16px;

        .search-input-wrapper {
            .search-input {
                :deep(.el-input__wrapper) {
                    padding: 6px 12px;
                }

                :deep(.el-input__inner) {
                    font-size: 13px;
                }
            }
        }
    }
}
</style>
