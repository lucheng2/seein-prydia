<script setup lang="ts">
import en from 'element-plus/dist/locale/en.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

defineProps<PageProps>()
const language = ref('zh-cn')
const locale = computed(() => (language.value === 'zh-cn' ? zhCn : en))
// defineOgImageComponent('NuxtSeo')
interface PageProps {
  error: any
}
const error = useError()
const projectName = import.meta.env.VITE_NAME

onMounted(() => {
  useHead({
    title: String(error.value.statusCode),
    titleTemplate: (suffix) => {
      return suffix ? `${suffix} | ${projectName}` : projectName
    },
  })
})
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <ElConfigProvider
    size="large"
    :locale="locale"
    :message="{ max: 2, grouping: true }"
  >
    <ErrorPage />
  </ElConfigProvider>
</template>

<style lang="scss"></style>
