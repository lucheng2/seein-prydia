import * as api from '@/apis'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>(undefined)
    const userInfo = ref<any>({})

    const getToken = computed(() => token.value)

    function setToken(value) {
      token.value = value
    }

    function removeToken() {
      token.value = undefined
    }

    async function login(param) {
      return new Promise((resolve, reject) => {
        api
          .login(param)
          .then((data) => {
            setToken(data.token)
            getUserInfo()
            resolve({})
            // message('登录成功', { type: 'success' })
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    async function loginByToken(param) {
      try {
        await setToken(param.token)
        await getUserInfo()
      }
      catch (error) {
        logout()
      }
    }

    async function logout() {
      try {
        await api.logout()
      }
      finally {
        removeToken()
        userInfo.value = {}
        window.location.reload()
      }
    }

    async function getUserInfo() {
      try {
        const data = await api.getUserInfo()
        userInfo.value = data
      }
      catch (error) {
        logout()
      }
    }

    return {
      token,
      userInfo,
      login,
      loginByToken,
      logout,
      getUserInfo,
      getToken,
      setToken,
      removeToken,
    }
  },
  {
    persist: [
      {
        pick: ['token'],
        storage: piniaPluginPersistedstate.cookies({ maxAge: 604800 }),
      },
      {
        pick: ['userInfo'],
        storage: piniaPluginPersistedstate.localStorage(),
      },
    ],
  },
)
