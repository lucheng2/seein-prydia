import { openApplyForTestModal } from '~/components/modal/apply-for-test/open'
import { openLoginModal } from '~/components/modal/login/open'

export const useEnterLogic = () => {
  const route = useRoute()
  const router = useRouter()
  const { token } = storeToRefs(useUserStore())
  const { fetchCheck } = useCheckChatRightStore()

  const logicLogin = async () => {
    if (!token.value) openLoginModal()
  }

  const logicApplyForTest = async () => {
    const isChecked = await fetchCheck()
    if (!isChecked) openApplyForTestModal()
  }

  onMounted(async () => {
    if (route.query?.logic) {
      if (route.query.logic === 'login') logicLogin()
      else if (route.query.logic === 'applyForTest') logicApplyForTest()
      // 清除浏览器地址上的query.logic参数,保留其他参数
      router.replace({ query: { ...route.query, logic: undefined } })
    }
  })
}
