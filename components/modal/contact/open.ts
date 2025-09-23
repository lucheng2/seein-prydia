import { useCreatedComponent } from '@/hooks/use-created-component'

import Modal from './index.vue'

export const openContactModal = (cb: (...args: any[]) => any) => {
  const instance = useCreatedComponent(Modal, {
    onChange: cb,
  })

  instance.open()

  return instance
}
