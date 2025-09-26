<script setup lang="ts">
import closeIcon from '@/assets/images/icon/close.png'
import loginDescImg from '@/assets/images/login/login-desc.png'
import prydiaText from '@/assets/svg/prydia.svg'
import { useHead } from '@unhead/vue'
import { useEnterLogic } from '~/hooks'

defineOptions({
  name: 'HomeIndex',
})

useHead({
  title: '',
})

const imageData = ref<ImageData | null>(null)

onMounted(async () => {
  try {
    // Example: Fetch an SVG image and parse it
    // The SVG should have a transparent background and black fill color for the best effect

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

const loginForm1 = ref()
const loginForm2 = ref()
const loginForm3 = ref()

const isClickLogin = ref(false)
// 注册
const registerStep = ref(0)
const useRegister = () => {
  const registerForm = ref<any>({})

  const handleBackLogin = () => {
    registerForm.value = {}
    registerStep.value = 0
  }

  const handleToRegister = () => {
    registerStep.value = 1
  }

  const handleSendCode = () => {
    registerStep.value = 2
  }

  const handleVerifyCode = () => {
    registerStep.value = 3
  }

  const handleRegister = () => {}

  return {
    registerForm,
    handleBackLogin,
    handleToRegister,
    handleRegister,
    handleSendCode,
    handleVerifyCode,
  }
}

const {
  registerForm,
  handleBackLogin,
  handleToRegister,
  handleRegister,
  handleVerifyCode,
  handleSendCode,
} = useRegister()
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
      >
        <UiLaserFlow
          :horizontal-beam-offset="-0.001"
          :vertical-beam-offset="-0.16"
          color="#6633EE"
        />
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
        <div
          class="card absolute overflow-hidden rounded-[32px] bg-[#17171A] p-[20px]"
          border="4px solid #6633EE"
          flex="~"
        >
          <template v-if="isClickLogin">
            <div
              class="absolute right-[32px] top-[32px] cursor-pointer"
              @click="isClickLogin = false"
            >
              <img :src="closeIcon" class="h-[24px] w-[24px]" />
            </div>
            <img class="h-[510px] w-[340px]" :src="loginDescImg" />
            <div class="ml-[62px] mt-[24px]">
              <Transition name="slide-up">
                <div v-if="registerStep === 0" class="form-content">
                  <el-form ref="loginForm1" class="mt-[35px]">
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter email address"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter the password"
                          type="password"
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
                  <el-button class="login-btn mt-[28px]"> Login </el-button>
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
                  <el-form ref="loginForm2" class="mt-[35px]">
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter email address"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <el-button
                    class="login-btn mt-[28px]"
                    @click="handleSendCode"
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
                  <el-form ref="loginForm3" class="mt-[35px]">
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter email address"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter Verification Code"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <el-button
                    class="login-btn mt-[28px]"
                    @click="handleVerifyCode"
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
                  <el-form ref="loginForm3" class="mt-[35px]">
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter email address"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter Verification Code"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter your password"
                        />
                      </div>
                    </el-form-item>
                    <el-form-item>
                      <div
                        class="h-[60px] w-[376px] rounded-[12px]"
                        flex="~ items-center"
                        :style="{ background: 'rgba(255,255,255,0.05)' }"
                      >
                        <div
                          class="ml-[20px] mr-[16px] h-[20px] w-[20px]"
                        ></div>
                        <input
                          text="#fff 16px"
                          class="h-[24px]"
                          placeholder="Enter your password again"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                  <el-button class="login-btn mt-[28px]">
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
            <div flex="~ justify-center" class="w-full">
              <el-button
                class="login-btn mt-[80px]"
                @click="isClickLogin = true"
              >
                Start Chat Now
              </el-button>
            </div>
          </template>
        </div>
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
    transition: all 0.8s ease-out;
    .logo-desc {
      transition: all 0.8s ease-out;
    }
    .metallic-paint {
      transition: all 0.8s ease-out;
    }
  }
  .card {
    transition: all 0.8s ease-out;
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
    top: 25%;
    width: 300px;
    .metallic-paint {
      top: -120px;
      width: 100%;
    }
  }
  .card {
    width: 860px;
    height: 574px;
  }
}

.not-login-click {
  .logo-text {
    left: 50%;
    transform: translateX(-50%);
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
    transform: translateY(430px);
    width: 1280px;
    height: 574px;
  }
}
</style>
