import { onMounted, ref, watch, type ComputedRef, } from "vue";

type AudioProps = {
  audioRef: ComputedRef<any>;
  textList: ComputedRef<string[]>;
}

const baseUrl = 'http://127.0.0.1:6006/chatapi'
const loadModels = async() => {
  await fetch(`${baseUrl}/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt`)
  await fetch(`${baseUrl}/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth`)
}

export const useAudio = ({audioRef, textList}: AudioProps) => {

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

  const playAudio = async(url: string) => {
    audioRef.value.src = url;
    audioRef.value.style.display = 'block';
    audioRef.value.play();
    return new Promise((resolve) => {
      audioRef.value.addEventListener('ended', () => {
        console.log('current audio playing ended')
        resolve('')
      })
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

  const checkAndPlayAudioIndex = (index: number) => {
    console.log('[checkAndPlayAudioIndex]', index)
    // 每0.5秒轮训看audioUrls数组里对应的index是否有值
    let timer = setInterval(async() => {
      if (audioUrls.value?.[index]) {
        clearInterval(timer)
        await playAudio(audioUrls.value[index])
        checkAndPlayAudioIndex(index+1)
      }
    }, 500)
  }

  const start = () => {
    checkAndPlayAudioIndex(0)
  }

  onMounted(async() => {
    await loadModels()
    start()
  })
}