import { onMounted, ref, watch, type ComputedRef, computed } from "vue";
import { BASE_URL } from '../utils/constants'
import { downloadAudio } from '../utils/index'

type AudioDownloaderProps = {
  textList: ComputedRef<string[]>;
}

const loadModels = async() => {
  await fetch(`${BASE_URL}/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt`)
  await fetch(`${BASE_URL}/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth`)
}

export const useAudioDownloader = ({textList}: AudioDownloaderProps) => {

  const audioIndexUrlMap = ref<{ [key: number]: string }>({})
  const audioUrls = ref<any>([])
  const ttsModelLoaded = ref(false)
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

  onMounted(async() => {
    await loadModels()
    ttsModelLoaded.value = true
  })

  const finished = computed(() => {
    return textList.value?.length === audioUrls.value?.length && !audioUrls.value.find((url:string) => !url)
  })

  const reset = () => {
    audioIndexUrlMap.value = {}
    audioUrls.value = []
  }

  return {
    // audioUrls: computed(() => audioUrls.value.filter((url: string) => url)),
    audioUrls,
    finished,
    reset,
    ttsModelLoaded
  }
}