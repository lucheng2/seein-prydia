import * as api from '@/apis'

export const useDevPagesStore = defineStore('devPage', () => {
  // 是否正在请求
  const loading = ref(false)

  const devPages = ref<any>([])
  const devPaths = computed(() => {
    return getListKeys(devPages.value, 'path') as string[]
  })

  const fetchDevPages = async () => {
    if (!devPages.value.length) {
      loading.value = true
      const res = await getDevData()
      devPages.value = res
    }
    return {
      devPaths: getDevPaths(),
      devPages: getDevPages(),
    }
  }

  const getDevPages = () => {
    return devPages.value
  }

  const getDevPaths = () => {
    return devPaths.value
  }

  const getDevPageByPath = (path: string) => {
    return devPages.value.find((item) => {
      const pattern = getRegexPattern(item.path)
      return matchPattern(pattern, path)
    })
  }

  const getDevData = () => {
    return new Promise((resolve, reject) => {
      api
        .getDisabledPages()
        .then((res: any) => {
          const result = res.map(path => ({
            path,
            statusCode: 403,
            message: '即将开放，敬请期待',
          }))
          resolve(result)
        })
        .catch((err) => {
          reject(createError({ statusCode: 500, message: err }))
        })
    })
  }

  return {
    devPages,
    devPaths,
    fetchDevPages,
    getDevPageByPath,
    getDevPaths,
  }
})
