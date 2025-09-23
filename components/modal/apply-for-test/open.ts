import { useCreatedComponent } from '@/hooks/use-created-component'

import Modal from './index.vue'

export const openApplyForTestModal = (phone?: string) => {
  const instance = useCreatedComponent(Modal)

  instance.open(phone)

  return instance
}
