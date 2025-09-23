import * as api from '@/apis'

export const useCheckAgreementStore = defineStore('CheckAgreement', () => {
  // 是否正在请求
  const loading = ref(false)

  // 是否请求过
  const isFetched = ref(false)
  const isAgreementChecked = ref(false)

  const user = useCookie('user') as any

  const fetchCheck = async () => {
    const token = user.value?.token
    if ((!isAgreementChecked.value && !isFetched.value) && token) {
      loading.value = true
      const res = await getData()
      isAgreementChecked.value = res
      isFetched.value = true
    }
    return isAgreementChecked.value
  }

  const getData = () => {
    return new Promise<boolean>((resolve) => {
      api
        .checkAgreement()
        .then((res: any) => {
          resolve(res)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  return { isAgreementChecked, fetchCheck }
}, {
  persist: [
    {
      pick: ['isAgreementChecked'],
      storage: piniaPluginPersistedstate.localStorage(),
    },
  ],
})
