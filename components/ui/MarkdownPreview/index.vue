<!-- eslint-disable vue/no-v-html -->
<template>
    <div
        class="seein-markdown"
        v-html="markdown"
    />
</template>

<script setup lang="ts">
import DOMPurity from 'dompurify'
import { marked } from 'marked'

const props = defineProps({
    value: {
        type: String,
        default: '',
    },
})

const useMarkdown = () => {
    const markdown = computed(() => {
        if (!props.value) {
            return ''
        }

        const parsedMarkdown = marked.parse(props.value || '') as string
        return DOMPurity.sanitize(parsedMarkdown)
    })

    return {
        markdown,
    }
}

const { markdown } = useMarkdown()

</script>

<style lang="less">
@import url('./github-theme.less');

.seein-markdown{
    padding: 16px 32px;
    border: var(--apm-border);
    border-radius: var(--apm-border-radius);
    overflow-y: auto;
    background-color: #fff;
}
</style>
