import { useCreatedComponent } from '@/hooks/use-created-component'

import Modal from './index.vue'

export const openAgreementModal = (cb: (...args: any[]) => any) => {
  const instance = useCreatedComponent(Modal, {
    onChange: cb,
  })

  instance.open()

  return instance
}

export const openAgreementModal2 = () => {
  const instance = useCreatedComponent(Modal)

  instance.open(1)

  return instance
}
