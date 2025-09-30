import path from 'node:path'

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: true,
    componentInspector: false,
  },
  typescript: { strict: false, shim: false },
  imports: { dirs: ['types', 'stores', 'apis'] },
  modules: [
    '@element-plus/nuxt',
    '@nuxt/eslint',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    'dayjs-nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  build: {
    transpile: [/echarts/],
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'iconify-icon',
    },
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
  },
  unocss: {
    nuxtLayers: true,
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
  dayjs: {
    plugins: ['duration', 'relativeTime'],
    locales: ['en', 'zh-cn'],
  },
  css: [
    '@unocss/reset/normalize.css',
    '@unocss/reset/sanitize/sanitize.css',
    '@unocss/reset/sanitize/assets.css',
    '~/assets/styles/element/main.scss',
    '~/assets/styles/index.scss',
    '~/assets/fonts/index.scss',
  ],
  vite: {
    plugins: [
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'assets/svg')],
        symbolId: 'icon-[dir]-[name]',
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData:
            '@use "~/assets/styles/element/index.scss" as element; @use "@/assets/styles/variables.scss" as *;',
        },
      },
    },
    esbuild: {
      drop: ['debugger'],
      pure:
        process.env.VITE_NODE_ENV === 'production'
          ? ['console.log', 'console.info']
          : [], // Use NUXT_ENV to distinct between test and production
    },
    // lamejs 配置
    optimizeDeps: {
      include: ['@breezystack/lamejs'],
    },
    build: {
      commonjsOptions: {
        // lamejs 使用 UMD/CommonJS 格式
        transformMixedEsModules: true,
      },
    },
  },
  postcss: {
    plugins: {
      // 'postcss-px-to-viewport-8-plugin': {
      //   unitToConvert: 'px', // 要转换的单位
      //   viewportWidth: process.env.VITE_PSD, // 视觉稿的设计宽度
      //   unitPrecision: 3, // 指定转换后的单位精度
      //   propList: ['*'], // 要转换的CSS属性列表，'*'表示全部
      //   viewportUnit: 'vw', // 指定转换为目标单位
      //   fontViewportUnit: 'vw', // 字体也可以使用vw单位（可选）
      //   selectorBlackList: [], // 不进行转换的选择器列表
      //   minPixelValue: 0, // 设置小于或等于多少像素时不转换
      //   mediaQuery: true, // 是否在媒体查询中也转换px
      //   replace: true, // 是否直接更换属性值，而不添加备用样式
      //   // exclude: /(\/|\\)(node_modules)(\/|\\)/, // 排除文件路径
      // },
      'postcss-pxtorem': {
        rootValue: 16, // 设计稿宽度的1/10，代表 1rem=37.5px
        viewportUnit: 'rem', // 希望使用的视窗单位
        propList: ['*'], // 需要做转化处理的css属性  * 就是所有属性都要转换，如`hight`、`width`、`margin`等，`*`表示全部
        // exclude: /node_modules/i, // 这里表示不处理node_modules文件下的css
        selectorBlackList: ['ignore-'], // 忽略的选择器前缀；不转换的类名
        mediaQuery: false, // 是否在媒体查询中也转换 px
        minPixelValue: 1, // 最小的 px 值才转换为 rem
        replace: true, // 是否更换属性值，而不是添加一个rem的新属性
        unitPrecision: 5, // 单位转换后的精度
      },
    },
  },
  app: {
    head: {
      title: 'Prydia',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
        },
        {
          name: 'keywords',
          content:
            'AI,心理课程,心理咨询,心理培训,心理服务,心理治疗,抑郁症治疗,焦虑症干预,婚姻家庭咨询',
        },
        { name: 'description', content: '致力于心理咨询领域的技术公司' },
        { name: 'baidu-site-verification', content: 'codeva-1pfbuklHaZ' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      style: [],
      script: [],
    },
  },
  piniaPluginPersistedstate: {
    cookieOptions: {
      domain: 'localhost',
      path: '/',
      sameSite: 'lax',
    },
  },
  robots: {
    groups: [
      {
        userAgent: ['*'],
        disallow: [''],
      },
    ],
  },
  nitro: {
    routeRules: {
      '/prydia-api/**': {
        proxy: `${process.env.VITE_API_BASE}/**`,
        ssr: false,
        robots: false, // 禁止爬取
      },
      '/chat-api/**': {
        proxy: `${process.env.VITE_CHAT_API_BASE}/**`,
        ssr: false,
        robots: false, // 禁止爬取
      },
    },
    devProxy: {
      '/ws-api': {
        target: 'ws://localhost:8080/seein',
        changeOrigin: true,
        ws: true,
        prependPath: false,
      },
    },
  },
})
