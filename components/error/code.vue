<script setup lang="ts">
const error = useError()

const goHome = () => {
  // 路由跳转逻辑
  window.location.href = '/'
}

const router = useRouter()
const goBack = () => {
  // 路由跳转逻辑
  router.back()
}
</script>

<template>
  <div
    class="relative h-[100%] flex items-center justify-center overflow-hidden"
  >
    <!-- 内容容器 -->
    <div
      class="relative z-10 flex flex-col items-center rounded-xl p-8 text-center"
    >
      <!-- 动态数字 -->
      <div class="mb-6 text-8xl font-bold">
        <span
          class="bg-gradient-to-r bg-clip-text text-transparent"
          style="background-image: linear-gradient(90deg, #00b755, #50a675)"
        >
          {{ error?.statusCode }}
        </span>
      </div>

      <!-- 文字内容 -->
      <h1 class="mb-4 text-2xl text-white font-medium">
        {{ error?.message }}
      </h1>
      <p class="mb-8 max-w-md text-gray-500 leading-6">
        Sorry<br />
        The page has an error
      </p>

      <!-- 简约按钮 -->
      <div>
        <el-button type="primary" size="large" link @click="goHome">
          Back to home page
        </el-button>
        <el-button type="primary" size="large" link @click="goBack">
          Back to previous page
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 更克制的动画 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(0.98);
  }
}

.animate-float {
  animation: float 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
