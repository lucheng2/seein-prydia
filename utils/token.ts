export const getToken = () => {
  const userStore = useUserStore()
  const token = userStore.getToken
  if (!token) {
    return null
  }
  return token
}

export const setToken = (token: string) => {
  const userStore = useUserStore()
  userStore.setToken(token)
}

export const removeToken = () => {
  const userStore = useUserStore()
  userStore.removeToken()
}
