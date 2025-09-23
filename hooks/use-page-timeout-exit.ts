export const usePageTimeoutExit = (timeout: number, onTimeout: () => void) => {
  let timer: NodeJS.Timeout | null = null
  const nowTime = new Date().getTime()

  // timeout传入的是毫秒数
  // 将currentTime与timeout相加，得到一个时间戳
  const timeoutTime = nowTime + timeout
  // 每一分钟检测一次当前时间与timeoutTime的差值，如果差值大于timeout，则调用onTimeout函数
  const checkTimeout = () => {
    const currentTime = new Date().getTime()
    if (currentTime > timeoutTime) {
      onTimeout()
    }
    else {
      timer = setTimeout(checkTimeout, 60000)
    }
  }
  onMounted(() => {
    timer = setTimeout(checkTimeout, 60000)
  })

  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })
}
