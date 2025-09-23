// plugins/aos.client.js

import { defineNuxtPlugin } from '#app'

const textVisibleDirective = {
  mounted(el) {
    // 判断浏览器是否兼容IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // 不兼容时，直接显示元素
      el.classList.add('js-visible')
      el.setAttribute('data-shown', '1')
      return
    }
    // 设置初始状态
    el.classList.add('js-visible')
    el.setAttribute('data-shown', '0')

    // 创建Intersection Observer实例
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 元素进入视口时
            el.setAttribute('data-shown', '1')
            // 停止观察以避免重复触发
            observer.unobserve(el)
          }
        })
      },
      {
        root: null, // 视口
        // 当元素的10%进入视口时触发
        threshold: 0.1,
      },
    )

    // 开始观察元素
    observer.observe(el)
  },
}
export default defineNuxtPlugin({
  name: 'directive-text-visible',
  setup(nuxtApp) {
    if (import.meta.client) {
      nuxtApp.vueApp.use({
        install(Vue) {
          Vue.directive('text-visible', textVisibleDirective)
        },
      })
    }
    else {
      // 服务端无需初始化
      nuxtApp.vueApp.directive('text-visible', {})
    }
  },
})
