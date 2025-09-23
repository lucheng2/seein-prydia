<script setup lang="ts"></script>

<template>
  <div class="bouncing-loader small-loader">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</template>

<style scoped>
.small-loader .dot {
  width: 8px;
  height: 8px;
  background: #e0e0e0;
  margin: 0 4px;
}
/* 跳动加载动画 */
.bouncing-loader {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bouncing-loader .dot {
  border-radius: 50%;
  background-color: #E0E0E0;
  animation: bounce 1.2s infinite ease-in-out;
}

.bouncing-loader .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.bouncing-loader .dot:nth-child(2) {
  animation-delay: -0.16s;
}

.bouncing-loader .dot:nth-child(3) {
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-18px);
  }
}
</style>
