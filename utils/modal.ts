import UiModal from '@/components/ui/Modal/index.vue'
import { createVNode, render, type VNode } from 'vue'

interface ModalResult {
  loadingConfirm: (status: boolean) => void
  closeModal: () => void
}

interface ModalOptions {
  type?: 'warning'
  confirmButtonText?: string
  cancelButtonText?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  autoClose?: boolean
  slots?: {
    title?: (res: { text: string }) => VNode
    content?: (res: { text: string }) => VNode
    footer?: (res: ModalResult) => VNode
  }
}

export const modal = (
  title: string,
  content: string,
  options: ModalOptions = {},
) => {
  const defaultOptions: ModalOptions = {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    closeOnPressEscape: false,
    showClose: true,
    autoClose: true,
    ...options,
  }

  const slots = defaultOptions.slots ?? {}

  return new Promise<ModalResult>((resolve, reject) => {
    // 创建一个专属容器
    const container = document.createElement('div')
    container.style.position = 'relative'
    container.style.zIndex = '9999999'
    document.body.appendChild(container)

    // 创建 VNode
    const vnode = createVNode(
      UiModal,
      {
        title,
        content,
        ...defaultOptions,
        onClosed: () => {
          // 清理逻辑
          cleanup()
        },
        onConfirm: (res: ModalResult) => {
          resolve(res)
        },
        onCancel: () => {
          reject(new Error('Modal canceled'))
        },
      },
      slots,
    )

    // 定义清理函数
    const cleanup = () => {
      // 卸载 VNode
      render(null, container)
      // 移除容器
      document.body.removeChild(container)
    }

    // 渲染到独立容器
    render(vnode, container)
  })
}
