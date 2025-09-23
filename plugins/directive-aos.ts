// plugins/aos.client.js

import { defineNuxtPlugin } from '#app'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default defineNuxtPlugin({
  name: 'directive-aos',
  setup(nuxtApp) {
    if (import.meta.client) {
      nuxtApp.vueApp.use({
        install(Vue) {
          Vue.directive('aos', {
            mounted(el, binding) {
              const options = binding.value || {}
              if (typeof options === 'string') {
                el.setAttribute('data-aos', binding.value)
              }
              else if (typeof options === 'object') {
              // 循环获取options的key和val
                for (const key in options) {
                  if (key !== 'aos') {
                    el.setAttribute(`data-aos-${key}`, options[key])
                  }
                  else {
                    el.setAttribute(`data-${key}`, options[key])
                  }
                }
              }
              AOS.init()
            },
          })
        },
      })
    }
    else {
      // 服务端无需初始化AOS
      nuxtApp.vueApp.directive('aos', {})
    }
  },
})
