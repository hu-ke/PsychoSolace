import { ref, watch, type ComputedRef, computed } from "vue";
import { downloadAudio } from '../utils/index'

type AudioDownloaderProps = {
  textList: ComputedRef<string[]>;
}

export const useAudioDownloader = ({textList}: AudioDownloaderProps) => {
  const audioIndexUrlMap = ref<{ [key: number]: string }>({})
  const audioUrls = ref<any>([])
  watch(audioIndexUrlMap, mp => {
    audioUrls.value = Object.assign(audioUrls.value, mp)
  }, {
    deep: true
  })

  watch(() => [...textList.value], async(list, prevList) => {
    list.slice(prevList.length)
    for (let i = prevList.length; i < list.length; i++) {
      if (list[i]) {
        const audioUrl = await downloadAudio(list[i])
        audioIndexUrlMap.value[i] = audioUrl
      }
    }
  })

  const finished = computed(() => {
    return textList.value?.length === audioUrls.value?.length && !audioUrls.value.find((url:string) => !url)
  })

  const reset = () => {
    audioIndexUrlMap.value = {}
    audioUrls.value = []
  }

  return {
    audioUrls,
    finished,
    reset,
  }
}