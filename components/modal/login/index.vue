<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import * as api from '@/apis'

interface Props {
  init?: (...args: any[]) => void
}

const props = defineProps<Props>()

const showModal = ref(false)

const open = () => {
  showModal.value = true
}

const close = () => {
  showModal.value = false
}

defineExpose({
  open,
  close,
})

const handleTo = (path: string) => {
  window.open(path, '_blank')
}

const { login } = useUserStore()

/** 验证码倒计时hook */
const useCountDown = () => {
  const countDown = ref(60)
  const timer = ref()
  const disabled = computed(() => countDown.value !== 60)
  const start = () => {
    countDown.value--
    timer.value = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer.value)
        countDown.value = 60
      }
    }, 1000)
  }
  const stop = () => {
    clearInterval(timer.value)
    countDown.value = 60
  }
  return {
    countDown,
    disabled,
    start,
    stop,
  }
}
const { countDown, disabled, start, stop } = useCountDown()

const useForm = () => {
  const loading = ref(false)
  const captchaLoading = ref(false)
  const ruleFormRef = ref()
  const formData = ref({
    phoneCode: 86,
    phone: '',
    captcha: '',
    check: true,
  })
  const rules = {
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { min: 11, max: 11, message: '请输入11位手机号', trigger: 'blur' },
    ],
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { min: 6, max: 6, message: '请输入6位验证码', trigger: 'blur' },
    ],
  }

  const phoneCode = [{ value: 86, label: '+86' }]

  const getCaptcha = async () => {
    // 获取验证码
    try {
      captchaLoading.value = true
      // 校验手机号正则
      if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
        return message(`请输入正确的手机号`, { type: 'error' })
      }
      await api.getCaptcha({ phone: formData.value.phone })
      message('验证码已发送,请注意查收', { type: 'success' })
      start()
    }
    catch (error) {
    }
    finally {
      captchaLoading.value = false
    }
  }

  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
      if (!valid) return
      try {
        if (!formData.value.check) {
          message('请勾选协议', { type: 'error' })
          return
        }
        loading.value = true
        await login({
          phone: formData.value.phone,
          captcha: formData.value.captcha,
        })
        showModal.value = false
      }
      catch (error) {
      }
      finally {
        loading.value = false
      }
    })
  }

  return {
    loading,
    captchaLoading,
    ruleFormRef,
    formData,
    rules,
    phoneCode,
    submitForm,
    getCaptcha,
  }
}

const {
  loading,
  captchaLoading,
  ruleFormRef,
  phoneCode,
  formData,
  rules,
  submitForm,
  getCaptcha,
} = useForm()
</script>

<template>
  <div class="login-modal">
    <el-dialog
      v-bind="$attrs"
      v-model="showModal"
      class="w-[96%] md:w-[460px]"
      :show-close="false"
      :z-index="2000"
    >
      <template #header />
      <div class="login-modal__content">
        <div class="login-modal__content-title">手机号登录</div>
        <div class="login-modal__content-subtitle">
          首次验证通过即注册夕里账号
        </div>
        <div class="login-modal__content-form">
          <el-form ref="ruleFormRef" :model="formData" :rules="rules">
            <el-form-item
              class="login-modal__content-form-input phone"
              prop="phone"
            >
              <el-input v-model="formData.phone" placeholder="请输入手机号">
                <template #prepend>
                  <el-select
                    v-model="formData.phoneCode"
                    class="login-modal__content-form-input-select"
                    placeholder="区号"
                  >
                    <el-option
                      v-for="item in phoneCode"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item
              class="login-modal__content-form-input code"
              prop="captcha"
            >
              <el-input
                v-model="formData.captcha"
                placeholder="输入验证码"
                :maxlength="6"
              >
                <template #append>
                  <el-button
                    class="login-modal__content-form-input-append"
                    link
                    type="primary"
                    :disabled="disabled"
                    :loading="captchaLoading"
                    @click="getCaptcha"
                  >
                    {{ disabled ? `${countDown}秒后重试` : "获取验证码" }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <div class="mb-[46px]">
              注册登录即代表已阅读并同意
              <NuxtLink class="cursor-pointer text-[#00B755]" @click="handleTo('/legal/terms')"> 用户协议 </NuxtLink> 与
              <NuxtLink class="cursor-pointer text-[#00B755]" @click="handleTo('/legal/privacy')"> 隐私政策 </NuxtLink>，未注册的手机号将自动注册
            </div>
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                :disabled="loading"
                @click="submitForm(ruleFormRef)"
              >
                登录/注册
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.login-modal {
  :deep(.el-dialog) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    border-radius: 24px !important;
  }

  :deep(.el-dialog__header) {
    display: none;
  }

  &__content {
    padding: 15px 25px;

    &-title {
      text-align: center;
      font-weight: 600;
      font-size: 22px;
      color: $color-text-1;
      line-height: 26px;
      margin-bottom: 8px;
    }

    &-subtitle {
      text-align: center;
      font-size: 12px;
      color: #858585;
      line-height: 14px;
      margin-bottom: 26px;
    }

    &-form {
      &-input {
        :deep(.el-input__wrapper) {
          padding: 12px;
          font-size: 16px;
        }
        &-select {
          width: 103px;

          :deep(.el-select__wrapper) {
            box-shadow: 0 0 0 1px $color-fill-5 inset !important;
          }
        }

        &-append {
          width: 120px !important;
          font-size: 16px;
          line-height: 19px;
          color: $brand-1 !important;
        }

        :deep(.el-input) {
          --el-input-border-color: $color-fill-5;
        }

        :deep(.el-input-group__prepend),
        :deep(.el-input-group__append) {
          border: 0;
        }

        :deep(.el-input__wrapper) {
          background: $color-fill-5;

          & input::-webkit-input-placeholder {
            font-weight: 500;
            font-size: 16px;
            color: #b8b8b8;
            line-height: 19px;
          }
        }

        &.phone {
          margin-bottom: 30px;
        }

        &.code {
          margin-bottom: 26px;
        }
      }

      .el-button {
        width: 100%;
        height: auto;
        font-weight: 500;
        font-size: 16px;
        color: #ffffff;
        line-height: 19px;
        padding: 12px 0;
      }

      :deep(.el-form-item) {
        &:last-child {
          margin-bottom: 20px;
        }
      }
    }
  }
}
</style>
