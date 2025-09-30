<script lang="ts" setup>
import * as api from '@/apis'
import coachIcon1 from '@/assets/images/coach/1.png'
import coachIcon2 from '@/assets/images/coach/2.png'
import coachIcon3 from '@/assets/images/coach/3.png'
import coachIcon4 from '@/assets/images/coach/4.png'
import { useHomeRouteList } from '@/constants/home'
import { openMoodCorveModal } from '~/components/modal/mood-corve/open'

defineOptions({
  name: 'AIChat',
})

const homeRouteList = useHomeRouteList({
  'mood-curve': () => {
    openMoodCorveModal()
  },
  'Knowledge': () => {
    isCollapsed.value = isCollapsedknowledge.value
    isCollapsedknowledge.value = !isCollapsedknowledge.value
  },
})

useHead({
  title: 'Chat',
})

const route = useRoute()
const router = useRouter()
// 会话管理 - 支持分页
const currentConversationId = ref(route.params.id as string)
const useChatConversations = (type: 'bot' | 'coach') => {
  // 分页相关状态
  const currentPage = ref(1)
  const pageSize = ref(20) // 每页数量，可根据需要调整
  const totalCount = ref(0)
  const hasMore = ref(true)
  const allConversations = ref<any[]>([]) // 存储所有已加载的对话
  const isLoadingMore = ref(false) // 防止重复加载

  // 防抖定时器
  let debounceTimer: NodeJS.Timeout | null = null
  const debounceDelay = 100 // 防抖延迟时间（毫秒）

  // 加载对话数据
  const {
    data,
    pending,
    refresh: refreshCurrentPage,
  } = useAsyncData(
    `chat-sessions-${type}-${currentPage.value}`,
    () => {
      return api.getChatSession({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        prydiaChatType: type === 'bot' ? 'CHAT_BOT' : 'COACH',
      })
    },
    {
      watch: [currentPage], // 监听页码变化
    },
  )

  // 处理分页数据
  watch(
    data,
    (newData) => {
      if (newData) {
        totalCount.value = newData.totalElements || 0

        if (currentPage.value === 1) {
          // 第一页，直接替换
          allConversations.value = newData.content || []
        }
        else {
          // 后续页，追加数据
          const newList = newData.content || []
          allConversations.value = [...allConversations.value, ...newList]
        }

        // 检查是否还有更多数据
        const currentTotal = allConversations.value.length
        hasMore.value = currentTotal < totalCount.value
        isLoadingMore.value = false
      }
    },
    { immediate: true },
  )

  // 计算属性：当前可用的对话列表
  const conversations = computed(() => {
    return allConversations.value
  })

  // 清除防抖定时器
  const clearDebounceTimer = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  // 加载下一页
  const loadMore = async () => {
    if (!hasMore.value || pending.value || isLoadingMore.value) return

    isLoadingMore.value = true
    currentPage.value += 1
    // useAsyncData 会自动触发重新请求
  }

  // 防抖版本的加载更多
  const debouncedLoadMore = () => {
    clearDebounceTimer()
    debounceTimer = setTimeout(() => {
      loadMore()
    }, debounceDelay)
  }

  // 滚动到底部检测函数
  const checkScrollToBottom = (scrollElement: HTMLElement, threshold = 100) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollElement
    const distanceToBottom = scrollHeight - scrollTop - clientHeight

    // 当距离底部小于阈值时，触发加载更多
    if (distanceToBottom <= threshold) {
      debouncedLoadMore()
    }
  }

  // 创建滚动监听器
  const createScrollListener = (
    scrollElement: HTMLElement,
    threshold = 100,
  ) => {
    const handleScroll = () => {
      if (type !== activeTab.value) return
      checkScrollToBottom(scrollElement, threshold)
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })

    // 返回清理函数
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
      clearDebounceTimer()
    }
  }

  // 重置并重新加载第一页
  const getConversationData = async () => {
    currentPage.value = 1
    allConversations.value = []
    hasMore.value = true
    isLoadingMore.value = false
    clearDebounceTimer()
    await refreshCurrentPage()
  }

  // 刷新当前页面数据
  const refreshConversations = () => {
    return refreshCurrentPage()
  }

  // 重置分页状态
  const resetPagination = () => {
    currentPage.value = 1
    allConversations.value = []
    hasMore.value = true
    totalCount.value = 0
    isLoadingMore.value = false
    clearDebounceTimer()
  }

  // 组件卸载时清理
  onBeforeUnmount(() => {
    clearDebounceTimer()
  })

  return {
    conversations,
    pending,

    // 分页相关
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSize),
    totalCount: readonly(totalCount),
    hasMore: readonly(hasMore),
    isLoadingMore: readonly(isLoadingMore),

    // 方法
    getConversationData,
    loadMore,
    debouncedLoadMore,
    checkScrollToBottom,
    createScrollListener,
    refreshConversations,
    resetPagination,
  }
}

const { conversations, isLoadingMore, createScrollListener }
  = useChatConversations('bot')

const {
  conversations: conversationsCoach,
  isLoadingMore: isLoadingMoreCoach,
  createScrollListener: createScrollListenerCoach,
} = useChatConversations('coach')

// 聊天历史记录
const useChatHistory = () => {
  const messages = ref<any[]>(
    route.params.id === 'new' || route.query.new === 'true' ? [] : [],
  )
  const historyLoading = ref(false)
  // 缓存已加载的对话数据，避免重复请求
  const conversationCache = new Map()

  // 手动加载历史记录，避免 useAsyncData 的缓存问题
  const loadChatHistory = async (conversationId: string) => {
    if (!conversationId) {
      return []
    }

    // 检查缓存
    if (conversationCache.has(conversationId) && conversationCache.get(conversationId)) {
      return conversationCache.get(conversationId)
    }

    historyLoading.value = true
    try {
      const data = await api.getChatRecord(conversationId)
      // 缓存结果
      const result = data
      conversationCache.set(conversationId, result)
      return result
    }
    catch (error) {
      console.error('加载历史记录失败:', error)
      return []
    }
    finally {
      historyLoading.value = false
    }
  }

  // 初始化消息列表
  const initializeMessages = async (conversationId?: string) => {
    const targetId = conversationId || currentConversationId.value
    if (!targetId) {
      // 新会话显示欢迎消息
      messages.value = []
    }
    else {
      const historyData = await loadChatHistory(targetId)
      if (historyData && historyData.length > 0) {
        chatType.value = historyData[0]?.prydiaChatType === 'CHAT_BOT' ? 'bot' : 'coach'
        activeTab.value = chatType.value
        // 有历史记录，转换格式并显示
        const result: any[] = []
        historyData.forEach((item: any) => {
          const user = {
            id: `user_${item.id}`,
            sender: 'user',
            content: item.prompt,
            state: 'end',
          }
          const ai = {
            id: `${item.id}`,
            sender: 'ai',
            content: item.answer,
            state: 'end',
            attrs: {
              onRegenerate,
            },
          }
          result.push(user, ai)
        })
        messages.value = result.filter(item => item.content)

        router.replace({
          params: { id: targetId },
        })
        isNew.value = false
      }
      else {
        // 没有历史记录但不是新会话
        messages.value = []
      }
    }
  }

  // 监听会话ID变化
  watch(
    () => currentConversationId.value,
    async (newId, oldId) => {
      if (
        !currentConversationId.value
        || currentConversationId.value === 'new'
        || route.params.id === 'new'
      ) {
        isNew.value = true
        await createdChat()
      }
      else if (newId !== oldId && oldId !== 'new') {
        await initializeMessages(newId)
      }
    },
  )

  return {
    messages,
    historyLoading,
    loadChatHistory,
    initializeMessages,
  }
}

// 聊天重新生成
const useChatRegenerate = () => {
  const reAbortController = ref()

  // 流式消息处理
  const onMessage = (res) => {
    const data = JSON.parse(res.data)
    if (data.messageId) {
      const findMsg = messages.value.find(
        item => item.id === currentMessageId.value,
      )
      if (findMsg) {
        findMsg.id = data.messageId
        currentMessageId.value = data.messageId
      }
      return
    }
    aiChatMessageRef.value
      ?.getMessageRef(currentMessageId.value)
      ?.addText(data.content || '')
  }

  const doClose = () => {
    const findMsg = messages.value.find(
      item => item.id === currentMessageId.value,
    )
    if (findMsg) {
      findMsg.state = 'end'
    }
    loading.value = false
  }

  const onClose = () => {
    console.log('close')
    doClose()
    stopStream()
  }

  const onError = (err) => {
    console.log(err)
    doClose()
  }

  const stopStream = () => {
    if (reAbortController.value) {
      reAbortController.value.abort()
    }
    loading.value = false
  }

  const onRegenerate = async (messageItem: any) => {
    const message = messages.value.find(item => item.id === messageItem.id)

    if (!message) return

    currentMessageId.value = message.id

    message.state = 'loading'

    loading.value = true

    reAbortController.value = new AbortController()

    api.regenerateMessage({
      messageId: currentMessageId.value,
      ctrl: reAbortController.value,
      onMessage,
      onClose,
      onError,
    })
  }
  return {
    onRegenerate,
  }
}

const { onRegenerate } = useChatRegenerate()

const useCoach = () => {
  const coachList = ref([
    {
      value: 1,
      label: 'How to tell my family that l\'m coming out?',
      icon: coachIcon1,
    },
    {
      value: 2,
      label: 'How to deal with others\' strange looks and doubts?',
      icon: coachIcon2,
    },
    {
      value: 3,
      label: 'How to help parents accept your sexual orientation?',
      icon: coachIcon3,
    },
    {
      value: 4,
      label: 'How to express love to the same-sex person you like?',
      icon: coachIcon4,
    },
  ])
  const coachScene = ref(1)

  const setCoachScene = (coach: any) => {
    const findIndex = messages.value.findIndex(item => item.sender === 'topic')
    if (findIndex === -1) {
      messages.value.unshift({
        id: new Date().getTime(),
        sender: 'topic',
        content: coach.label,
        icon: coach.icon,
      })
    }
    setChatTypeToCoach()
    coachScene.value = coach.value
    sendMessage(coach.label)
  }

  return {
    coachList,
    coachScene,
    setCoachScene,
  }
}

const { coachList, coachScene, setCoachScene } = useCoach()

type ChatType = 'bot' | 'coach'
// 聊天类型
const useChatType = () => {
  const activeTab = ref<ChatType>('bot')
  const chatType = ref<ChatType>('bot')
  const setChatType = (type: ChatType) => (chatType.value = type)
  const setChatTypeToBot = () => setChatType('bot')
  const setChatTypeToCoach = () => setChatType('coach')
  return {
    activeTab,
    chatType,
    setChatTypeToBot,
    setChatTypeToCoach,
  }
}

const { chatType, activeTab, setChatTypeToBot, setChatTypeToCoach } = useChatType()

// 聊天功能
const useChat = () => {
  const sendCount = ref(0)
  const loading = ref(false)
  const aiChatMessageRef = ref()
  const currentMessageId = ref()
  const abortController = ref()
  const inputMessage = ref('')
  const isNew = ref(route.params.id === 'new' || route.query.new === 'true')
  // 从历史记录模块获取消息
  const { messages, historyLoading, loadChatHistory, initializeMessages }
    = useChatHistory()

  const haveUser = computed(() =>
    messages.value.some(item => item.sender === 'user'),
  )

  // 监听用户消息，移除欢迎消息
  watch(
    () => haveUser.value,
    (val) => {
      if (val) {
        const findIndex = messages.value.findIndex(
          item => item.sender === 'hello',
        )
        if (findIndex !== -1) messages.value.splice(findIndex, 1)
      }
    },
  )

  // 流式消息处理
  const onMessage = (res) => {
    const data = JSON.parse(res.data)
    if (data.messageId) {
      const findMsg = messages.value.find(
        item => item.id === currentMessageId.value,
      )
      if (findMsg) {
        findMsg.id = data.messageId
        currentMessageId.value = data.messageId
      }
      return
    }
    aiChatMessageRef.value
      ?.getMessageRef(currentMessageId.value)
      ?.addText(data.content || '')
    scrollToBottom()
  }

  const doClose = () => {
    const findMsg = messages.value.find(
      item => item.id === currentMessageId.value,
    )
    if (findMsg) {
      findMsg.state = 'end'
    }
    loading.value = false
  }

  const onClose = () => {
    console.log('close')
    doClose()
    stopStream()
  }

  const onError = (err) => {
    console.log(err)
    doClose()
  }

  const stopStream = () => {
    if (abortController.value) {
      abortController.value.abort()
    }
    loading.value = false
  }

  // 创建新会话
  const createdChat = async () => {
    try {
      const data = await api.createChat()
      currentConversationId.value = String(data)
      // 重新初始化消息（新会话）
      // await initializeMessages(data)

      router.replace({
        query: { new: 'true' },
        params: { id: data },
      })
    }
    catch (error) {
      console.log(error)
      if (error.response?.data?.code === 2005) {
        navigateTo('/info')
      }
    }
  }

  // 发送消息
  const sendMessage = (content = inputMessage.value.trim()) => {
    try {
      if (!content || loading.value) return

      const userMsg = {
        id: Date.now(),
        sender: 'user',
        content,
      }
      messages.value.push(userMsg)
      doSendMessage(content)
    }
    catch (error) {
      message(error.message, { type: 'error' })
    }
  }

  const doSendMessage = async (content = inputMessage.value.trim()) => {
    loading.value = true
    const aiMsg = {
      id: Date.now() + 2,
      sender: 'ai',
      content: '',
      state: 'loading',
      attrs: {
        onScrollToBottom: () => scrollToBottom(),
        onRegenerate,
      },
    }

    abortController.value = new AbortController()

    api
      .sendMessageStream({
        type: chatType.value,
        round: Number(currentConversationId.value),
        scene: coachScene.value,
        prompt: content,
        ctrl: abortController.value,
        onMessage,
        onClose,
        onError,
      })
      .then(() => {
        sendCount.value++
        watchConversationRound()
        if (isNew.value) {
          isNew.value = false
        }
      })
    if (conversationRound.value === 1) {
      unshiftNewConversationTheme(currentConversationId.value, chatType.value)
    }
    messages.value.push(aiMsg)
    inputMessage.value = ''
    currentMessageId.value = aiMsg.id
    scrollToBottom(true)
  }

  const init = async () => {
    currentConversationId.value = route.params.id as string
    // 如果是新会话且没有会话ID，创建新会话
    if (
      !currentConversationId.value
      || currentConversationId.value === 'new'
      || route.params.id === 'new'
    ) {
      isNew.value = true
      await createdChat()
    }
    else {
      // 现有会话，检查可用性并加载历史记录
      await initializeMessages(currentConversationId.value)
    }
  }

  watch(
    () => route.params.id,
    () => {
      currentConversationId.value = route.params.id as string
    },
  )

  // 组件挂载时的初始化
  onActivated(init)

  return {
    isNew,
    aiChatMessageRef,
    currentMessageId,
    haveUser,
    messages,
    inputMessage,
    loading,
    historyLoading,
    sendMessage,
    createdChat,
  }
}

const {
  isNew,
  aiChatMessageRef,
  currentMessageId,
  haveUser,
  messages,
  loading,
  inputMessage,
  historyLoading,
  sendMessage,
  createdChat,
} = useChat()

// 聊天主题生成
const useChatConversationsTheme = () => {
  // 最大对话轮次
  const MAX_CONVERSATION_ROUND = 4
  // 计算对话轮次,根据用户和AI的对话数量计算
  const conversationRound = computed(() => {
    return messages.value.filter((item: any) => item.sender === 'user').length
  })

  // 替换对话obj
  const replaceConversationObj = (obj: any) => {
    const current
      = conversations.value.find(
        (item: any) => item.conversationId === obj.conversationId,
      )
      || conversationsCoach.value.find(
        (item: any) => item.conversationId === obj.conversationId,
      )
    if (current) {
      current.theme = obj.theme
      current.userId = obj.userId
    }
  }

  const watchConversationRound = async () => {
    if (
      conversationRound.value > 0
      && conversationRound.value <= MAX_CONVERSATION_ROUND
    ) {
      const data = await api.generateTopic({
        conversationId: currentConversationId.value,
      })
      if (data) {
        replaceConversationObj(data)
      }
    }
  }

  // 修改会话标题
  const changeConversationTheme = async (
    conversationId: string,
    theme: string,
  ) => {
    const current = conversations.value.find(
      (item: any) => item.conversationId === conversationId,
    )
    if (current) {
      current.theme = theme
    }
  }

  const unshiftNewConversationTheme = async (
    conversationId: string,
    type: ChatType,
  ) => {
    const now = Date.now()
    const obj = {
      id: now,
      theme: 'New Conversation',
      userId: '',
      conversationId,
      createTime: now,
    }
    if (type === 'bot') {
      conversations.value.unshift(obj)
    }
    else if (type === 'coach') {
      conversationsCoach.value.unshift(obj)
    }
  }

  return {
    conversationRound,
    unshiftNewConversationTheme,
    changeConversationTheme,
    watchConversationRound,
  }
}

const {
  conversationRound,
  watchConversationRound,
  unshiftNewConversationTheme,
} = useChatConversationsTheme()

// 滚动处理
const useScroll = () => {
  const messagesScrollbarRef = ref()
  const messagesContainerRef = ref()
  const isScrolling = ref(false)
  const scrollTop = ref(0)
  let timer: NodeJS.Timeout | null = null
  let timer2: NodeJS.Timeout | null = null

  const isUserScrolling = computed(() => {
    const container = messagesContainerRef.value
    const scrollbar = messagesScrollbarRef.value
    if (container && scrollbar) {
      const { offsetHeight } = container
      return (
        offsetHeight - scrollTop.value - 200 > scrollbar.offsetHeight
        || isScrolling.value
      )
    }
    return false
  })

  const clearTimer = () => {
    if (timer) clearTimeout(timer)
    if (timer2) clearTimeout(timer2)
  }

  const handleScroll = (e) => {
    isScrolling.value = true
    clearTimer()
    timer = setTimeout(() => {
      isScrolling.value = false
    }, 100)
    scrollTop.value = e.target.scrollTop
  }

  const scrollToBottom = (force = false) => {
    timer2 = setTimeout(() => {
      nextTick(() => {
        const container = messagesContainerRef.value
        if (force || (container && !isUserScrolling.value)) {
          messagesScrollbarRef.value.scrollTop = container.scrollHeight + 100
        }
      })
    }, 100)
  }

  // 当消息更新后自动滚动到底部
  watch(
    () => messages.value.length,
    () => {
      nextTick(() => {
        scrollToBottom(true)
      })
    },
  )

  onBeforeUnmount(() => {
    clearTimer()
  })

  onActivated(() => {
    nextTick(() => {
      scrollToBottom(true)
    })
  })

  return {
    messagesContainerRef,
    messagesScrollbarRef,
    scrollToBottom,
    handleScroll,
  }
}

const {
  messagesContainerRef,
  messagesScrollbarRef,
  scrollToBottom,
  handleScroll,
} = useScroll()

const isCollapsed = ref(false)
watch(isCollapsed, (val) => {
  if (!isCollapsed.value) {
    isCollapsedknowledge.value = true
  }
})
const isCollapsedknowledge = ref(true)
const bgRef = ref()
</script>

<template>
  <NuxtLayout
    v-model:is-collapsed="isCollapsed"
    v-model:is-collapsedknowledge="isCollapsedknowledge"
    nav-bar-logo="none"
    bg-color="white"
    name="chat-text"
    nav-bar-width="100%"
    :route-list="homeRouteList"
    :is-new="isNew"
    :bg-ref="bgRef"
  >
    <template #conversations>
      <AiChatConversations
        v-model:active-tab="activeTab"
        v-model:is-collapsed="isCollapsed"
        style="height: calc(100vh - 94px - 24px);"
        :is-new="isNew"
        :conversation-id="currentConversationId"
        :conversations="conversations"
        :conversations-coach="conversationsCoach"
        :create-scroll-listener="createScrollListener"
        :create-scroll-listener-coach="createScrollListenerCoach"
      />
    </template>
    <template #content>
      <AiChatHello
        v-if="isNew && messages.length === 0"
        :coach-list="coachList"
        @handle-select="setCoachScene"
        @handle-send="sendMessage"
      />
      <UiCard
        v-else
        border-color="conic-gradient(
          from 0deg at 50% 50%,
          #703EDB 0%,
          #FFD12A 25%,
          #703EDB 50%,
          #FFD12A 100%
        )"
        rotating-height="100vw"
        rotating-width="100vw"
      >
        <div class="chat-content" flex="~ col justify-center items-center">
          <div
            ref="messagesScrollbarRef"
            flex="~ 1"
            class="my-[20px] w-[900px] overflow-y-auto"
            @scroll="handleScroll"
          >
            <div ref="messagesContainerRef" class="w-full">
              <AiChatMessage ref="aiChatMessageRef" :round="conversationRound" :message-list="messages" />
            </div>
          </div>

          <div class="shadow-box">
            <UiCard
              class="mb-[12px]"
              rotating-height="100%"
              rotating-width="100%"
              border-color="linear-gradient(136deg, rgba(112, 62, 219, 1), rgba(38, 0, 230, 1), rgba(255, 209, 42, 1))"
            >
              <AiChatInput
                v-model="inputMessage"
                class="w-[900px]"
                :coach-list="coachList"
                @handle-select="setCoachScene"
                @handle-send="sendMessage"
              />
            </UiCard>
          </div>
        </div>
      </UiCard>
    </template>
    <template #knowledge>
      <KnowledgeContainer />
    </template>
    <template #bg>
      <UiDynamicsBg ref="bgRef" />
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
:deep(.el-scrollbar__bar.is-vertical) {
  display: none !important;
}
.seein-ai-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  &__nav {
    background: #ffffff;
    border-radius: 50px;
    padding: 4px;
    display: flex;
    margin-bottom: 8px;
    &--item {
      padding: 6px 20px;
      border-radius: 60px;
      cursor: pointer;
      font-weight: 400;
      font-size: 14px;
      color: #00b755;
      line-height: 16px;
      transition: background 0.2s ease-in-out;
      & + & {
        margin-left: 4px;
      }
      &.active {
        font-weight: 500;
        background: #e9f7ee;
      }
      &:hover {
        background: #e9f7ee;
      }
    }
  }
  &__content {
    width: 100%;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    :deep(.el-scrollbar) {
      height: unset !important;
    }
    &--messages {
      width: 100%;
      overflow: auto;
      @include no-arrow-scrollbar;
    }
    &--input {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      .input {
        width: 800px;
      }
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.chat-content {
  height: calc(100vh - 94px - 24px);
  padding: 0 24px;
}

.shadow-box {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 75%;
    height: 20%;
    background: linear-gradient(179deg, #703EDB 0%, #703EDB 63%, #703EDB 100%);
    filter: blur(120px);
  }
}
</style>
