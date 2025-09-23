<script setup lang="ts">
interface Props {
  content?: string
}

const props = defineProps<Props>()
</script>

<template>
    <div v-text-visible class="js-visible" data-shown="0">
        <span class="out">
            <span class="text">
                <template v-if="!$slots.default">
                    {{ content }}
                </template>
                <slot v-else />
            </span>
        </span>
    </div>
</template>

<style lang="scss" scoped>

</style>
