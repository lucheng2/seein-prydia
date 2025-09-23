<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/offline'

const props = defineProps<Props>()

interface Props {
  icon: string
}
</script>

<template>
    <Icon :icon="icon" :ssr="true" />
</template>

<style scoped>

</style>
