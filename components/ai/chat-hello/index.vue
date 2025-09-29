<script setup lang="ts">
interface Props {
  coachList?: any[]
}

const props = defineProps<Props>()

const emits = defineEmits(['handleSend', 'handleSelect'])
const textVal = ref('')
const handleSend = () => {
  emits('handleSend', textVal.value)
  textVal.value = ''
}
const handleSelect = (val: any) => {
  emits('handleSelect', val)
}
</script>

<template>
  <div class="chat-hello-content hello pt-[12px]" flex="~ col items-center">
    <div text="100px #FFFFFF center">SEREIN</div>
    <div text="60px #FFFFFF center" class="mb-[40px]">
      GENTLE RAIN FOR THE SOUL
    </div>
    <UiCard class="mb-[12px]" rotating-height="1000%" rotating-width="1000%">
      <AiChatInput
        v-model="textVal"
        class="w-[900px]"
        :coach-list="coachList"
        @handle-send="handleSend"
        @handle-select="handleSelect"
      />
    </UiCard>
    <div flex="~" class="w-[900px] flex-wrap gap-[12px]" text="18px #F5F7FA">
      <UiCard
        v-for="coach in coachList"
        :key="coach.value"
        class="w-[444px] cursor-pointer"
        border-color="linear-gradient(135deg, rgba(112, 62, 219, 1), rgba(255, 209, 42, 1))"
        rotating-height="100%"
        rotating-width="100%"
        @click="handleSelect(coach)"
      >
        <div p="20px 16px" flex="~ items-center">
          <img
            :src="coach.icon"
            class="mr-[24px] h-[50px] w-[50px] flex-shrink-0 rounded-[6px]"
          />
          <div>{{ coach.label }}</div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-hello-content {
  height: calc(100vh - 94px - 24px);
}
</style>
