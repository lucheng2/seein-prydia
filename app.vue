<script setup lang="ts">
import en from 'element-plus/dist/locale/en.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import '@/components/ui/Icon/offlineIcon'

// if (import.meta.client) {
//   import('amfe-flexible')
// }

const language = ref('en')
const locale = computed(() => (language.value === 'zh-cn' ? zhCn : en))
// defineOgImageComponent('NuxtSeo')
const projectName = import.meta.env.VITE_NAME
useHead({
  titleTemplate: (suffix) => {
    return suffix ? `${suffix} | ${projectName}` : projectName
  },
})

const keepalive = {
  include: ['AIChat'],
}
const getPageKey = (route) => {
  return route.name
}
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <ElConfigProvider size="large" :locale="locale" :message="{ max: 2, grouping: true }">
    <NuxtPage :page-key="getPageKey" :keepalive="keepalive" />
  </ElConfigProvider>
</template>

<style lang="scss">
@use '@/assets/styles/index.scss';
</style>
