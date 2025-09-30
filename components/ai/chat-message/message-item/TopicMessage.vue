<script setup lang="ts">
interface Props {
  message: any
}
const props = withDefaults(defineProps<Props>(), {
  message: () => ({}),
})
</script>

<template>
    <div class="w-full rounded-[12px] bg-[#2C2933] p-[16px]" flex="~ items-center">
        <img class="mr-[20px] h-[80px] w-[80px] rounded-[10px]" :src="message.icon" />
        <div>
            <div text="#F5F7FA 24px" font="500" class="mb-[6px]">Topic</div>
            <div text="#CBCACC 18px">{{ message.content }}</div>
        </div>
    </div>
</template>

<style scoped>

</style>
