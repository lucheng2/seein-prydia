<script setup lang="ts">
interface Props {
  type: 'warning'
  title: string
  content: string
  confirmButtonText?: string
  cancelButtonText?: string
  showClose?: boolean
  autoClose?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  content: '内容',
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  showClose: true,
  type: 'warning',
  autoClose: true,
})

const emits = defineEmits(['confirm', 'cancel'])

const showModal = ref(true)
const confirmLoading = ref(false)

const open = () => {
  showModal.value = true
}

const close = () => {
  showModal.value = false
}

const setLoading = (loading: boolean) => {
  confirmLoading.value = loading
}

const confirm = () => {
  emits('confirm', {
    loadingConfirm: setLoading,
    closeModal: close,
  })
  if (props.autoClose) close()
}

const cancel = () => {
  emits('cancel')
  close()
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <div class="seein-ui-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      class="w-[80%] md:w-[27%]"
      :show-close="false"
      :z-index="2000"
    >
      <template #header />
      <div class="seein-ui-modal__content">
        <div class="seein-ui-modal__content--title">
          <template v-if="!$slots.title">
            <UiSvgIcon :name="type" :size="24" />
            {{ title }}
          </template>
          <slot v-else name="title" :text="title" />
        </div>
        <div class="seein-ui-modal__content--content">
          <template v-if="!$slots.content">
            {{ content }}
          </template>
          <slot v-else name="content" :text="content" />
        </div>
        <div class="seein-ui-modal__content--footer">
          <div
            v-if="!$slots.footer"
            class="seein-ui-modal__content--footer-btns"
          >
            <el-button
              v-if="showClose"
              class="seein-ui-modal__content--footer-btns-item"
              bg
              text
              @click="cancel"
            >
              {{ cancelButtonText }}
            </el-button>
            <el-button
              class="seein-ui-modal__content--footer-btns-item"
              type="primary"
              :loading="confirmLoading"
              :disabled="confirmLoading"
              @click="confirm"
            >
              {{ confirmButtonText }}
            </el-button>
          </div>
          <slot
            v-else
            name="footer"
            :loading-confirm="setLoading"
            :close-modal="close"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.seein-ui-modal {
  :deep(.el-dialog) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }

  :deep(.el-dialog__header) {
    display: none;
  }

  &__content {
    padding: 2px;
    &--title {
      font-weight: 500;
      font-size: 20px;
      color: $color-text-1;
      line-height: 21px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &--content {
      font-size: 14px;
      color: $color-text-1;
      line-height: 22px;
      margin-top: 20px;
      margin-bottom: 32px;
    }

    &--footer {
      &-btns {
        display: flex;
        justify-content: flex-end;

        &-item {
          min-width: 72px;
        }
      }
    }
  }
}
</style>
