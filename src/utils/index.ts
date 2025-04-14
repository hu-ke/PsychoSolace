import { BASE_URL, PUNCTUATION } from "./constants"

export const calculateDurations = async(audioUrls: string[]) => {
  return new Promise((resolve) => {
    const durations = [] as number[]
    for (let i = 0; i < audioUrls.length; i++) {
      const url = audioUrls[i]
      const audio = new Audio(url)
      audio.onloadedmetadata = function() {
        durations.push(audio.duration)
        if (durations.length === audioUrls.length) {
          const total = durations.reduce((accu, current) => {
            if (typeof current === 'number' && current > 0) {
              return accu + current
            }
            return accu
          }, 0)
          resolve(Math.ceil(total))
        }
        // 如果需要释放资源，记得在合适的时机调用 URL.revokeObjectURL(audioUrl);
        // URL.revokeObjectURL(audioUrl); 
      }
    }
  })
}

export const punctuationIndex = (str: string) => {
  for (let i = 0; i < PUNCTUATION.length; i++) {
    let punct = PUNCTUATION[i]
    let idx = str.indexOf(punct)
    if (idx > -1) {
      return idx
    }
  }
  return -1
}

export const playAudio = async(audio: HTMLAudioElement, url: string) => {
  audio.src = url
  audio.play()
  return new Promise((resolve) => {
    const onEnded = () => {
      console.log(`${audio.src} played.`)
      audio.removeEventListener('ended', onEnded)
      resolve('')
    }
    audio.addEventListener('ended', onEnded)
  })
}

export const playAudioUrls = async(audioUrls: string[]) => {
  console.log('[playAudioUrls]', audioUrls)
  const audio = new Audio('')
  for (let i = 0; i < audioUrls.length; i++) {
    await playAudio(audio, audioUrls[i])
  }
}

export const downloadAudio = async(text: string): Promise<string> => {
  // const media_type = 'wav' // 616kb 4.15s
  const media_type = 'aac' // 153kb 8.52s
  const url = `${BASE_URL}/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=${media_type}&streaming_mode=true`
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
      resolve(audioUrl)
      // 
    } catch (error) {
      console.error('Error fetching or playing audio:', error);
      reject(error)
    }
  })
}