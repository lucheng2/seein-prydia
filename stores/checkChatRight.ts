import * as api from '@/apis'

export const useCheckChatRightStore = defineStore('CheckChatRight', () => {
  // 是否正在请求
  const loading = ref(false)

  // 是否请求过
  const isFetched = ref(false)
  const isChecked = ref(false)

  const user = useCookie('user') as any

  const fetchCheck = async () => {
    const token = user.value?.token
    if (!isFetched.value && token) {
      loading.value = true
      const res = await getData()
      isChecked.value = res
      isFetched.value = true
    }
    return isChecked.value
  }

  const getData = () => {
    return new Promise<boolean>((resolve) => {
      api
        .checkChatRight()
        .then((res: any) => {
          resolve(true)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  return { fetchCheck }
})
