<script setup lang="ts">
import { homeRouteList } from '@/constants/home'
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'
import { useEnterLogic } from '~/hooks'

defineOptions({
  name: 'HomeIndex',
})

useHead({
  title: '',
})

// 表单元素引用
const loginForm = ref<HTMLElement | null>(null)
// 上方区域引用
const upperSection = ref<HTMLElement | null>(null)
// 记录上一次滚动位置
const lastScrollTop = ref(0)
// 防止滚动事件频繁触发的锁
const isScrolling = ref(false)

const mainContentRef = ref<HTMLElement | null>(null)

// 滚动到登录表单
const scrollToLoginForm = () => {
  if (loginForm.value) {
    isScrolling.value = true
    loginForm.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    // 滚动完成后解锁
    setTimeout(() => {
      isScrolling.value = false
    }, 1000)
  }
}

// 滚动到上方区域
const scrollToUpperSection = () => {
  if (upperSection.value) {
    isScrolling.value = true
    upperSection.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    // 滚动完成后解锁
    setTimeout(() => {
      isScrolling.value = false
    }, 1000)
  }
}
</script>

<template>
  <NuxtLayout name="login" :route-list="homeRouteList">
    <template #content>
      <div ref="mainContentRef" class="main relative z-99 h-screen overflow-scroll">
        <!-- 上方标题区域 - 添加引用 -->
        <div ref="upperSection" class="main-view min-h-screen">
          <div
            text="80px #fff"
            class="absolute w-full flex justify-center pt-[120px] transition-all duration-500"
          >
            Serein
          </div>

          <!-- 中间区域 -->
          <div class="z-1 min-h-screen flex flex-col items-center justify-center">
            <div text="80px #fff" class="mb-[80px] transition-all duration-500">GENTLE RAIN FOR THE SOUL</div>

            <!-- 上方Login按钮，点击滚动到表单 -->
            <div class="to-login-btn cursor-pointer" @click="scrollToLoginForm">
              <el-button class="w-full" link> Login </el-button>
            </div>
          </div>
        </div>

        <!-- 登录表单区域 -->
        <div class="main-view z-1 min-h-screen flex items-center justify-center pt-20">
          <div ref="loginForm" class="glass-effect rounded-[40px]" border="1px solid #7f7f7f">
            <div class="p-[26px]">
              <div class="mb-[12px]" text="#FFFFFF 34px">
                Serein<br />Gentle rain for the soul
              </div>
              <el-form class="mb-[12px]">
                <el-form-item>
                  <el-input
                    class="h-[60px]"
                    placeholder="Enter email address"
                    border="none"
                    size="large"
                  >
                    <template #prefix>
                      <div></div>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-input
                    class="h-[60px]"
                    placeholder="Enter the password"
                    border="none"
                    size="large"
                  >
                    <template #prefix>
                      <div></div>
                    </template>
                  </el-input>
                </el-form-item>
              </el-form>
              <div class="mb-[12px] flex justify-end">
                <nuxt-link to="/login" class="text-[12px] text-[#F0F0F0]">
                  Forgot password
                </nuxt-link>
              </div>
              <div class="login-btn">
                <el-button class="w-full" link> Login </el-button>
              </div>
              <el-button class="sign-btn w-full" link> Sign up </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="fixed top-0 z-0 h-full w-full">
        <UiPrism />
      </div>
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.main {
  scroll-snap-type: y mandatory;
  &-view {
    scroll-snap-align: start;
  }
}
::-webkit-scrollbar {
  display: none;
}
:deep(.el-form-item) {
  margin-bottom: 0 !important;
}
:deep(.el-form-item + .el-form-item) {
  margin-top: 12px !important;
}
.to-login-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 260px;
  height: 60px;
  background: linear-gradient(
    90deg,
    #703edb 0%,
    #ee3942 36%,
    #ffd12a 66%,
    #24e243 100%
  );
  border-radius: 100px;
}
.login-btn {
  background: linear-gradient(
    90deg,
    #703edb 0%,
    #ee3942 36%,
    #ffd12a 66%,
    #24e243 100%
  );
  border-radius: 12px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

:deep(.login-btn .el-button) {
  color: #ffffff;
}
:deep(.sign-btn.el-button) {
  height: 60px;
  color: #ffffff;
}

:deep(.to-login-btn .el-button) {
  color: #ffffff;
}

// 确保页面可以滚动到足够远
.relative.z-99 {
  overflow-x: hidden;
}
</style>
