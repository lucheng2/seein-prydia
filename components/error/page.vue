<script setup lang="ts">
import { homeRouteList } from '@/constants/home'
</script>

<template>
  <ClientOnly>
    <NuxtLayout :route-list="homeRouteList">
      <template #content>
        <div pt="84px" min-h="100vh" relative z-99 flex="~ col justify-center items-center">
          <ErrorCode />
        </div>
      </template>
    </NuxtLayout>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.a {
   position: relative;
}
</style>
