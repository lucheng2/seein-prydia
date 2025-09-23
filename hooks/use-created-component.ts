import { createApp } from 'vue'

export const useCreatedComponent = (el: globalThis.Component, attar?: any) => {
  // 创建容器
  const container = document.createElement('div')
  container.style.position = 'relative'
  container.style.zIndex = '1999'
  document.body.appendChild(container)

  // 创建应用实例并挂载
  const app = createApp(el, {
    ...attar,
    onClosed: () => {
      app.unmount() // 卸载应用
      document.body.removeChild(container) // 移除容器
    },
  })

  // 获取组件实例并调用open方法
  const instance = app.mount(container) as any

  // 返回实例以便外部调用close等方法
  return instance
}
