import { onMounted, type ComputedRef, ref, computed } from "vue";
import { playAudio } from "../utils";
type AudioPlayerProps = {
  audioUrls: ComputedRef<string[]>;
  downloadingFinished: ComputedRef<boolean>;
}

export const useAudioPlayer = ({audioUrls, downloadingFinished}: AudioPlayerProps) => {
  const audioRef = ref(new Audio())
  const playedCount = ref(0)
  let timer = null as any

  const checkAndPlayAudioIndex = (index: number) => {
    // 每0.5秒轮训看audioUrls数组里对应的index是否有值
    timer = setInterval(async() => {
      console.log('urls.value?.[index]', JSON.stringify(audioUrls.value), index)
      if (audioUrls.value?.[index]) {
        clearInterval(timer)
        await playAudio(audioRef.value, audioUrls.value[index])
        playedCount.value += 1
        checkAndPlayAudioIndex(index+1)
      }
    }, 500)
    return timer
  }

  // TO BE FIXED
  const finished = computed(() => {
    return playedCount.value === audioUrls.value.length && downloadingFinished.value
  })

  const reset = () => {
    console.log('[reset]')
    playedCount.value = 0
    clearInterval(timer)
    checkAndPlayAudioIndex(0)
  }

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