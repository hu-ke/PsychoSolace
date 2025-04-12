import { onMounted, type ComputedRef, ref, computed, watch } from "vue";
import { playAudio } from "../utils";
type AudioPlayerProps = {
  audioUrls: ComputedRef<string[]>;
}

export const useAudioPlayer = ({audioUrls}: AudioPlayerProps) => {
  const audioRef = ref(new Audio())
  const playedCount = ref(0)
  const urls = ref<string[]>([])
  let timer = null as any

  watch(audioUrls, list => {
    urls.value = list
  }, {
    deep: true
  })
  const checkAndPlayAudioIndex = (index: number) => {
    // 每0.5秒轮训看audioUrls数组里对应的index是否有值
    timer = setInterval(async() => {
      console.log('urls.value?.[index]', JSON.stringify(urls.value), index)
      if (urls.value?.[index]) {
        clearInterval(timer)
        await playAudio(audioRef.value, urls.value[index])
        playedCount.value += 1
        checkAndPlayAudioIndex(index+1)
      }
    }, 500)
    return timer
  }

  const finished = computed(() => {
    return playedCount.value === audioUrls.value.length
  })

  const reset = () => {
    playedCount.value = 0
    clearInterval(timer)
    checkAndPlayAudioIndex(0)
  }

  // watch(finished, flag => {
  //   if (flag) {
  //     playedCount.value = 0
  //     clearInterval(timer)
  //     checkAndPlayAudioIndex(0)
  //   }
  // })

  const start = () => {
    checkAndPlayAudioIndex(0)
  }
  onMounted(() => {
    start()
  })

  return {
    finished,
    reset
  }
}