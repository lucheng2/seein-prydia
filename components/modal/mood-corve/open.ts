import { useCreatedComponent } from '@/hooks/use-created-component'

import Modal from './index.vue'

export const openMoodCorveModal = () => {
  const instance = useCreatedComponent(Modal)

  instance.open()

  return instance
}
