// // `nuxt/kit` 是一个辅助子路径导入，您可以在定义本地模块时使用，
// // 这意味着您不需要将 `@nuxt/kit` 添加到项目的依赖项中
import { createResolver, defineNuxtModule, addServerHandler } from 'nuxt/kit'
import { IncomingMessage } from 'http'
import { createProxyServer } from 'httpxy'

export default defineNuxtModule({
  // defaults: {
  //   target: 'ws://localhost:8080/seein',
  //   path: '/ws-api',
  // },
  // meta: {
  //   configKey: 'websocketProxy',
  //   name: 'Websocket proxy',
  // },
  // setup(resolvedOptions, nuxt) {
  //   console.log(resolvedOptions)
  //   if (!nuxt.options.dev || !resolvedOptions.target) {
  //     return
  //   }
  //   nuxt.hook('listen', (server) => {
  //     const proxy = createProxyServer({
  //       ws: true,
  //       secure: false,
  //       changeOrigin: true,
  //       target: resolvedOptions.target,
  //     })
  //     const proxyFn = (req: IncomingMessage, socket: any, head: Buffer) => {
  //       console.log(req.url)
  //       if (req.url && req.url.startsWith(resolvedOptions.path)) {
  //         req.url = req.url.replace(resolvedOptions.path, '')
  //         proxy.ws(req, socket, head)
  //       }
  //     }
  //     server.on('upgrade', proxyFn)
  //     nuxt.hook('close', () => {
  //       server.off('upgrade', proxyFn)
  //       proxy.close()
  //     })
  //   })
  // },
})
