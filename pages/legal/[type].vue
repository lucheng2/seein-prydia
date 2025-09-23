<script setup lang="ts">
import * as api from '@/apis'
import { MdPreview } from 'md-editor-v3'

import 'md-editor-v3/lib/style.css'

const type = ref('')
const endpoint = ref('')
const route = useRoute()
useHead({
  title: computed(() => {
    const currentType = (route.params.type as string) || 'privacy'
    return currentType === 'terms' ? '用户协议' : '隐私政策'
  }),
})
const { data, pending } = useAsyncData(({ _route }) => {
  type.value = (_route.params.type as string) || 'privacy'
  endpoint.value = (_route.query.endpoint as string) || 'WEBSITE'
  if (!['WEBSITE', 'APPLET', 'DONGGUAN_H5'].includes(endpoint.value)) endpoint.value = 'WEBSITE'
  if (type.value === 'terms') {
    return api.getAlgorithmAgreement({ endpoint: endpoint.value })
  }
  if (type.value === 'privacy') {
    return api.getAlgorithmPrivacy({ endpoint: endpoint.value })
  }
  return new Promise(() => {
    return null
  })
})
</script>

<template>
  <NuxtLayout name="legal">
    <template #content>
      <div
        class="bg-[#fff] p-[26px] text-[#292929]"
      >
        <MdPreview
          v-model="data"
          class="w-[1280px]"
          style="background-color: transparent"
          editor-id="markdown-content__legal"
        />
      </div>
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/markdown.scss" as *;
</style>
