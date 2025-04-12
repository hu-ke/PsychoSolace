import { onMounted, ref, watch, type ComputedRef, computed } from "vue";

type AudioDownloaderProps = {
  textList: ComputedRef<string[]>;
}

const baseUrl = 'http://127.0.0.1:6006/chatapi'
const loadModels = async() => {
  await fetch(`${baseUrl}/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt`)
  await fetch(`${baseUrl}/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth`)
}

export const useAudioDownloader = ({textList}: AudioDownloaderProps) => {

  const audioIndexUrlMap = ref<{ [key: number]: string }>({})
  const audioUrls = ref<any>([])

  watch(audioIndexUrlMap, mp => {
    audioUrls.value = Object.assign(audioUrls.value, mp)
  }, {
    deep: true
  })

  // tts
  const downloadAudio = async(text: string): Promise<string> => {
    const media_type = 'wav'
    const url = `${baseUrl}/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=${media_type}&streaming_mode=true`
    return new Promise(async(resolve, reject) => {
      try {
        // 替换为实际的后端 API 端点
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const reader = response?.body?.getReader();
        const chunks = [];
        
        if (!reader) {
          return Promise.reject(new Error('reader is empty'))
        }
    
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value);
        }
    
        const blob = new Blob(chunks, { type: response.headers.get('Content-Type') || '' });
        const audioUrl = URL.createObjectURL(blob);
        console.log('[audioUrl]', audioUrl)
        resolve(audioUrl)
        // 
      } catch (error) {
        console.error('Error fetching or playing audio:', error);
        reject(error)
      }
    })
  }

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
  })

  const finished = computed(() => {
    console.log('audioUrls', audioUrls.value)
    console.log('textList.value', textList.value)
    return textList.value?.length === audioUrls.value?.length && !audioUrls.value.find((url:string) => !url)
  })

  const reset = () => {
    audioIndexUrlMap.value = {}
    audioUrls.value = []
  }

  return {
    audioUrls,
    finished,
    reset
  }
}