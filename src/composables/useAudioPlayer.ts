import { onMounted, type ComputedRef, } from "vue";

type AudioPlayerProps = {
  audioUrls: ComputedRef<string[]>;
  audioRef: ComputedRef<any>;
}


export const playAudioUrls = async(audioUrls: string[]) => {
  const audio = new Audio('')
  const playAudio = async(url: string) => {
    audio.src = url
    audio.play()
    return new Promise((resolve) => {
      audio.addEventListener('ended', () => {
        console.log('audio playing ended')
        resolve('')
      })
    })
  }
  for (let i = 0; i < audioUrls.length; i++) {
    await playAudio(audioUrls[i])
  }
}

export const useAudioPlayer = ({audioUrls, audioRef}: AudioPlayerProps) => {
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
  onMounted(() => {
    start()
  })
}