<script setup lang="ts">
import Hls from 'hls.js'

interface Props {
  url: string
}

const props = defineProps<Props>()

const emits = defineEmits(['hlsNetworkError'])

const useHls = () => {
  const videoRef = ref<HTMLVideoElement>()
  const hls = ref<Hls>()

  // 新增：处理用户交互后取消静音
  const handleFirstPlay = () => {
    console.log('用户交互，取消静音')
    if (videoRef.value) {
      videoRef.value.muted = false
      document.removeEventListener('click', handleFirstPlay)
    }
  }

  const setLiveHls = (url: string) => {
    if (!url) return
    handleFirstPlay()
    if (hls.value) {
      hls.value.destroy()
    }

    if (Hls.isSupported()) {
      hls.value = new Hls({
        autoStartLoad: true, // 确保自动开始加载
      })

      hls.value.attachMedia(videoRef.value!)
      hls.value.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.value!.loadSource(url)
      })

      hls.value.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          // 尝试自动播放（静音状态下）
          await videoRef.value!.play()
          // 监听页面点击来取消静音
          document.addEventListener('click', handleFirstPlay)
        }
        catch (error) {
          console.log('自动播放被阻止，需要用户交互')
        }
      })

      hls.value.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && hls.value) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
            // 恢复网络错误
              // hls.value.startLoad()
              emits('hlsNetworkError')
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
            // 恢复媒体错误
              hls.value.recoverMediaError()
              break
            default:
            // 销毁实例
              hls.value.destroy()
              break
          }
        }
      })

      // ...保持原有的错误处理逻辑
    }
    else if (videoRef.value!.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.value!.src = url
      videoRef.value!.play().catch(() => {
        console.log('Safari自动播放被阻止')
      })
    }
  }

  watchEffect(() => {
    const url = props.url
    nextTick(() => {
      if (import.meta.client) {
        setLiveHls(url)
      }
    })
  })

  onMounted(() => {
    document.addEventListener('click', handleFirstPlay)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleFirstPlay)
    hls.value?.destroy()
  })

  return { videoRef, handleFirstPlay, setLiveHls }
}

const { videoRef, handleFirstPlay } = useHls()
</script>

<template>
  <div>
    <!-- 添加 muted 属性实现静音自动播放 -->
    <video
      ref="videoRef"
      class="video-player"
      autoplay
      muted
      controls
      playsinline
    ></video>
  </div>
</template>

<style lang="scss" scoped>
.video-player {
  display: none;
}
</style>
