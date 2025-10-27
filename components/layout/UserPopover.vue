<script setup lang="ts">
import { storeToRefs } from 'pinia'

const emits = defineEmits(['setting', 'profile', 'logout'])

const { userInfo } = storeToRefs(useUserStore())

const email = computed(() => {
  if (!userInfo.value?.email) return ''
  const emailArr = userInfo.value?.email.split('@')
  return `${emailArr[0].slice(0, 3)}***@${emailArr[1]}`
})

const nickname = computed(() => userInfo.value?.nickname || `${email.value}`)
</script>

<template>
  <div class="flex flex-col">
    <div class="px-[12px] py-[8px]" text="#fff 14px">{{ nickname }}</div>
    <!-- <NuxtLink
      class="cursor-pointer px-[12px] py-[8px] text-[14px] text-[#141414] transition-all"
      rounded="6px"
      hover:bg="#F5F7FA"
      flex="~ items-center"
      @click="emits('setting')"
    >
      <UiIcon icon="settings-1-line" width="16" class="mr-[12px]" />
      账号设置
    </NuxtLink>
    <NuxtLink
      class="cursor-pointer px-[12px] py-[8px] text-[14px] text-[#141414] transition-all"
      rounded="6px"
      hover:bg="#F5F7FA"
      flex="~ items-center"
      @click="emits('contact')"
    >
      <UiIcon icon="telegram-alt" width="16" class="mr-[12px]" />联系我们
    </NuxtLink> -->
    <NuxtLink
      class="cursor-pointer px-[12px] py-[8px] text-[14px] text-[#fff] transition-all"
      rounded="6px"
      hover:bg="gray-600"
      flex="~ items-center"
      to="/profile"
    >
      <UiIcon
        icon="settings-1-line"
        width="16"
        class="mr-[12px]"
      />View Profile
    </NuxtLink>
    <NuxtLink
      class="cursor-pointer px-[12px] py-[8px] text-[14px] text-[#fff] transition-all"
      rounded="6px"
      hover:bg="gray-600"
      flex="~ items-center"
      @click="emits('logout')"
    >
      <UiIcon
        icon="logout-rounded"
        width="16"
        class="mr-[12px]"
      />Logout
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped></style>
