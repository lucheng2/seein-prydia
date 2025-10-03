<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import * as api from '@/apis'
import bgImg from '@/assets/images/bg.png'
import closeIcon from '@/assets/images/icon/close.png'
import cardImg from '@/assets/images/login/login-bg.png'
import loginDescImg from '@/assets/images/login/login-desc.png'
import emailIcon from '@/assets/svg/email.svg'
import passwordIcon from '@/assets/svg/password.svg'
import prydiaText from '@/assets/svg/prydia.svg'
import { useHead } from '@unhead/vue'
import { useEnterLogic } from '~/hooks'
import { useUserStore } from '~/stores/user'

defineOptions({
  name: 'HomeIndex',
})

useHead({
  title: '',
})

const { login, loginByToken } = useUserStore()

const imageData = ref<ImageData | null>(null)

onMounted(async () => {
  try {
    const response = await fetch(prydiaText)
    const blob = await response.blob()
    const file = new File([blob], 'logo.svg', { type: blob.type })
    const { imageData: processedImageData } = await parseImage(file)
    imageData.value = processedImageData
  }
  catch (err) {
    console.error('Error loading image:', err)
  }
})

const emailRule = [
  { required: true, message: 'Please input email', trigger: 'blur' },
  {
    type: 'email',
    message: 'Please input correct email address',
    trigger: ['blur', 'change'],
  },
]

const passwordRule = [
  { required: true, message: 'Please input password', trigger: 'blur' },
  // 6-20位，只能包含大小写字母、数字、特殊字符
  // {
  //   pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{6,20}$/,
  //   message: 'Please input correct password',
  //   trigger: ['blur', 'change'],
  // },
]

const captchaRule = [
  { required: true, message: 'Please input captcha', trigger: 'blur' },
]

const loginForm0 = ref()
const loginForm0Rules = ref<any>({
  email: emailRule,
  password: passwordRule,
})

const loginForm1 = ref()
const loginForm1Rules = ref<any>({
  email: emailRule,
})
const loginForm2 = ref()
const loginForm2Rules = ref<any>({
  email: emailRule,
  captcha: captchaRule,
})
const loginForm3 = ref()
const loginForm3Rules = ref<any>({
  email: emailRule,
  captcha: captchaRule,
  password: passwordRule,
  password2: [
    ...passwordRule,
    {
      // 校验两次密码是否一致
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please input the password again'))
        }
        else if (value !== loginForm3.value.password) {
          callback(new Error('The two passwords do not match'))
        }
        else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

const useLogin = () => {
  const loadingLogin = ref(false)
  const loginForm = ref<any>({
    email: '',
    password: '',
  })

  const handleLogin = async (formEl: FormInstance | undefined) => {
    await verifyForm(formEl)
    await doLogin()
  }

  const doLogin = async () => {
    try {
      loadingLogin.value = true
      await login({
        email: loginForm.value.email,
        password: loginForm.value.password,
      })
      window.location.href = '/ai/chat/new?new=true'
    }
    catch (error) {
      throw new Error(error)
    }
    finally {
      loadingLogin.value = false
    }
  }

  return {
    loadingLogin,
    loginForm,
    handleLogin,
  }
}

const { handleLogin, loadingLogin, loginForm } = useLogin()

const isClickLogin = ref(false)
// 注册
const registerStep = ref(0)
const useRegister = () => {
  const loading = ref({
    sendCode: false,
    verifyCode: false,
    register: false,
  })
  const registerForm = ref<any>({
    email: '',
    password: '',
    password2: '',
    captcha: '',
  })

  const handleBackLogin = () => {
    registerForm.value = {}
    registerStep.value = 0
  }

  const handleToRegister = () => {
    registerStep.value = 1
  }

  const handleSendCode = async (formEl: FormInstance | undefined) => {
    await verifyForm(formEl)
    await doSendCode()
    registerStep.value = 2
  }

  const doSendCode = async () => {
    // TODO: 发送验证码
    try {
      loading.value.sendCode = true
      await api.getCaptcha({
        email: registerForm.value.email,
      })
      message('Success send code!', { type: 'success' })
    }
    catch (error) {
      throw new Error(error)
    }
    finally {
      loading.value.sendCode = false
    }
  }

  const handleVerifyCode = async (formEl: FormInstance | undefined) => {
    await verifyForm(formEl)
    await doVerifyCode()
    registerStep.value = 3
  }

  const doVerifyCode = async () => {
    // TODO: 校验验证码
    try {
      loading.value.verifyCode = true
      const data = await api.checkCaptcha({
        email: registerForm.value.email,
        captcha: registerForm.value.captcha,
      })
      if (!data) {
        message('error verify code!', { type: 'error' })
        throw new Error('error verify code!')
      }
    }
    catch (error) {
      throw new Error(error)
    }
    finally {
      loading.value.verifyCode = false
    }
  }

  const handleRegister = async (formEl: FormInstance | undefined) => {
    await verifyForm(formEl)
    await doRegister()
    handleBackLogin()
  }

  const doRegister = async () => {
    // TODO: 注册
    try {
      loading.value.register = true
      const { token } = await api.register({
        email: registerForm.value.email,
        captcha: registerForm.value.captcha,
        password: registerForm.value.password,
      })
      await loginByToken(token)
      message('Success register!', { type: 'success' })
      setTimeout(() => {
        window.location.href = '/ai/chat/new?new=true'
      }, 1000)
    }
    catch (error) {
      throw new Error(error)
    }
    finally {
      loading.value.register = false
    }
  }

  return {
    loading,
    registerForm,
    handleBackLogin,
    handleToRegister,
    handleRegister,
    handleSendCode,
    handleVerifyCode,
  }
}

const {
  loading,
  registerForm,
  handleBackLogin,
  handleToRegister,
  handleRegister,
  handleVerifyCode,
  handleSendCode,
} = useRegister()

const useBg = () => {
  const revealImgRef = useTemplateRef<any>('revealImgRef')
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const el = revealImgRef.value
    if (el) {
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
    }
  }

  const handleMouseLeave = () => {
    const el = revealImgRef.value
    if (el) {
      el.style.setProperty('--mx', '-9999px')
      el.style.setProperty('--my', '-9999px')
    }
  }

  return {
    revealImgRef,
    handleMouseMove,
    handleMouseLeave,
  }
}

const { revealImgRef, handleMouseMove, handleMouseLeave } = useBg()
</script>

<template>
  <NuxtLayout name="login">
    <template #content>
      <div
        class="main relative z-99 h-screen overflow-hidden"
        flex="~ col"
        :class="{
          'not-login-click': !isClickLogin,
          'is-login-click': isClickLogin,
        }"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <UiLaserFlow
          :horizontal-beam-offset="-0.001"
          :vertical-beam-offset="-0.16"
          color="#6633EE"
        />

        <div
          class="card absolute rounded-[32px] bg-[#17171A] p-[20px]"
          border="4px solid #6633EE"
          flex="~"
        >
          <div v-if="registerStep !== 3" class="logo-text absolute">
            <div class="logo-title relative h-[74px]">
              <UiMetallicPaint
                class="metallic-paint absolute"
                :image-data="imageData"
                :params="{
                  patternScale: 3,
                  refraction: 0.07,
                  edge: 0,
                  patternBlur: 0,
                  liquid: 0,
                  speed: 0.3,
                }"
              />
            </div>
            <div class="logo-desc">Find Your Light and Share Your Pride</div>
          </div>
          <template v-if="isClickLogin">
            <div
              class="absolute right-[32px] cursor-pointer"
              @click="isClickLogin = false"
            >
              <img :src="closeIcon" class="h-[24px] w-[24px]" />
            </div>
            <img class="h-[510px] w-[340px]" :src="loginDescImg" />
            <div class="ml-[62px] mt-[24px]">
              <Transition name="slide-up">
                <div v-if="registerStep === 0" class="form-content">
                  <el-form
                    ref="loginForm0"
                    :rules="loginForm0Rules"
                    :model="loginForm"
                    class="mt-[35px]"
                    @submit.prevent
                  >
                    <el-form-item prop="email">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                          <img :src="emailIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="loginForm.email"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter email address"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item prop="password">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="passwordIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="loginForm.password"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter the password"
                          type="password"
                          @keyup.enter="handleLogin(loginForm0)"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <div flex="~ justify-end" class="mt-[12px]">
                    <el-button
                      flex="~"
                      :style="{
                        fontSize: '13px',
                      }"
                      color="#7f7f7f"
                      link
                    >
                      Forgot password
                    </el-button>
                  </div>
                  <el-button
                    class="login-btn mt-[28px]"
                    :loading="loadingLogin"
                    @click="handleLogin(loginForm0)"
                  >
                    Login
                  </el-button>
                  <div flex="~ justify-center" class="mt-[30px]">
                    <el-button
                      flex="~"
                      :style="{
                        fontSize: '16px',
                      }"
                      color="#7f7f7f"
                      link
                      @click="handleToRegister"
                    >
                      Sign up
                    </el-button>
                  </div>
                </div>
                <div v-else-if="registerStep === 1" class="form-content">
                  <el-form
                    ref="loginForm1"
                    :rules="loginForm1Rules"
                    :model="registerForm"
                    class="mt-[35px]"
                    @submit.prevent
                  >
                    <el-form-item prop="email">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="emailIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.email"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter email address"
                          @keyup.enter="handleSendCode(loginForm1)"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <el-button
                    class="login-btn mt-[28px]"
                    :loading="loading.sendCode"
                    @click="handleSendCode(loginForm1)"
                  >
                    Send Verification Code
                  </el-button>
                  <div flex="~ justify-center" class="mt-[30px]">
                    <el-button
                      flex="~"
                      :style="{
                        fontSize: '16px',
                      }"
                      color="#7f7f7f"
                      link
                      @click="handleBackLogin"
                    >
                      Back to Login
                    </el-button>
                  </div>
                </div>
                <div v-else-if="registerStep === 2" class="form-content">
                  <el-form
                    ref="loginForm2"
                    :rules="loginForm2Rules"
                    :model="registerForm"
                    class="mt-[35px]"
                    @submit.prevent
                  >
                    <el-form-item prop="email">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="emailIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.email"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter email address"
                          disabled
                        />
                      </div>
                    </el-form-item>
                    <el-form-item prop="captcha">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="passwordIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.captcha"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter Verification Code"
                          @keyup.enter="handleVerifyCode(loginForm2)"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <el-button
                    class="login-btn mt-[28px]"
                    :loading="loading.verifyCode"
                    @click="handleVerifyCode(loginForm2)"
                  >
                    Verify
                  </el-button>
                  <div flex="~ justify-center" class="mt-[30px]">
                    <el-button
                      flex="~"
                      :style="{
                        fontSize: '16px',
                      }"
                      color="#7f7f7f"
                      link
                      @click="handleBackLogin"
                    >
                      Back to Login
                    </el-button>
                  </div>
                </div>
                <div v-else-if="registerStep === 3">
                  <el-form
                    ref="loginForm3"
                    :rules="loginForm3Rules"
                    class="mt-[35px]"
                    @submit.prevent
                  >
                    <el-form-item prop="email">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="emailIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.email"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter email address"
                          disabled
                        />
                      </div>
                    </el-form-item>
                    <el-form-item prop="captcha">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="passwordIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.captcha"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter Verification Code"
                          disabled
                        />
                      </div>
                    </el-form-item>
                    <el-form-item prop="password">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="passwordIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.password"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter your password"
                          type="password"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item prop="password2">
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <img :src="passwordIcon" class="ml-[20px] mr-[16px] h-[20px] w-[20px]" />
                        <input
                          v-model="registerForm.password2"
                          text="#fff 16px"
                          class="h-[24px] flex-1 pr-[20px]"
                          placeholder="Enter your password again"
                          type="password"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <el-button
                    class="login-btn mt-[28px]"
                    @click="handleRegister(loginForm3)"
                  >
                    Complete Registration
                  </el-button>
                  <div flex="~ justify-center" class="mt-[30px]">
                    <el-button
                      flex="~"
                      :style="{
                        fontSize: '16px',
                      }"
                      color="#7f7f7f"
                      link
                      @click="handleBackLogin"
                    >
                      Back to Login
                    </el-button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <div flex="~ justify-center" class="z-99 w-full">
              <el-button
                class="login-btn mt-[80px]"
                @click="isClickLogin = true"
              >
                Start Chat Now
              </el-button>
            </div>
            <img :src="cardImg" class="absolute right-0 top-0" />
          </template>
        </div>

        <ClientOnly>
          <img
            ref="revealImgRef"
            :src="bgImg"
            alt="Reveal effect"
            style="
              position: absolute;
              width: 100%;
              z-index: 5;
              mix-blend-mode: lighten;
              opacity: 1;
              pointer-events: none;
              --mx: -9999px;
              --my: -9999px;
              -webkit-mask-image: radial-gradient(
                circle at var(--mx) var(--my),
                rgba(255, 255, 255, 1) 0px,
                rgba(255, 255, 255, 0.95) 60px,
                rgba(255, 255, 255, 0.6) 120px,
                rgba(255, 255, 255, 0.25) 180px,
                rgba(255, 255, 255, 0) 240px
              );
              mask-image: radial-gradient(
                circle at var(--mx) var(--my),
                rgba(255, 255, 255, 1) 0px,
                rgba(255, 255, 255, 0.95) 60px,
                rgba(255, 255, 255, 0.6) 120px,
                rgba(255, 255, 255, 0.25) 180px,
                rgba(255, 255, 255, 0) 240px
              );
              -webkit-mask-repeat: no-repeat;
              mask-repeat: no-repeat;
            "
          />
        </ClientOnly>
      </div>
      <!-- <div class="fixed top-0 z-0 h-full w-full">
        <UiPrism />
      </div> -->
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  justify-content: center;
  align-items: center;

  transition: all 0.25s ease-out;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item + .el-form-item) {
    margin-top: 12px;
  }

  .logo-text {
    color: #fff;
    .logo-title {
      font-size: 60px;
      font-weight: 600;
    }
    .logo-text {
      font-size: 16px;
    }
  }

  .login-btn {
    width: 376px;
    height: 60px;
    background:
      linear-gradient(90deg, #703edb 0%, #ea8cff 60%, #0c76ff 100%), #37303f;
    border-radius: 20px;
    border: unset;
    font-weight: bold;
    font-size: 24px;
    color: #ffffff;
    line-height: 24px;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.main {
  .logo-text {
    z-index: 2;
    transition: all 0.6s ease-out;
    .logo-desc {
      white-space: nowrap;
      transition: all 0.6s ease-out;
    }
    .metallic-paint {
      transition: all 0.6s ease-out;
    }
  }
  .card {
    transition: all 0.6s ease-out;
    .form-content {
      padding-top: 104px;
      z-index: 3;
      position: relative;
    }
  }
}

.is-login-click {
  .logo-text {
    left: 50%;
    top: 8%;
    width: 200px;
    .metallic-paint {
      top: -60px;
      width: 100%;
    }
    .logo-desc {
      width: 100%;
    }
  }
  .card {
    width: 860px;
    height: 558px;
  }
}

.not-login-click {
  .logo-text {
    left: 50%;
    transform: translateX(-50%) translateY(-45vh);
    top: 35%;
    width: 680px;
    .logo-desc {
      font-size: 40px;
      width: 100%;
      text-align: center;
    }
    .metallic-paint {
      top: -370px;
      width: 100%;
    }
  }
  .card {
    transform: translateY(76%);
    width: 86%;
    height: 60%;
  }
}
</style>
