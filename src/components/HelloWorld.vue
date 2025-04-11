<template>
  <button @click="start">开始</button>

  <ul>
    <li v-for="(txt, i) in texts" @click="choose(txt, i)">
      {{ txt }}
    </li>
  </ul>
  <audio ref="audioPlayer" controls style="display: none;"></audio>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, ref, watch } from "vue";

const texts = ref([
  '首先，我需要回顾之前的对话历史。',
  '用户之前询问了如何实现边逐字回复边语音回答，',
  '涉及到流式文本生成和实时语音合成。',
  '然后他们转向后端使用Python返回流式语音，',
  '并询问Web Audio API的消费方式。',
  '接着讨论了如何处理非MP3格式的音频，',
  '比如PCM、WAV、OPUS等，',
  '并提供了相应的前端代码。',
  '随后用户遇到了字节对齐的问题，',
  '并得到了修复后的代码。',
  '之后用户请求了Vue3的代码示例，',
  '现在用户最新的返回是Ogg格式，',
  '因此需要调整前端代码以适应audio/ogg媒体类型。'
])

const choose = (txt:string, i:number) => {
  textList.value.push(txt)
  downloadAudio(txt)
  texts.value.splice(i, 1)
}

const textList = ref<string[]>([])
const audioUrls = ref<any>([])
// const baseUrl = 'http://127.0.0.1:6006'
const baseUrl = 'https://reader.guru/chatapi'

const audioPlayer = ref()
const isPlaying = ref(false)

const loadModels = () => {
  fetch('https://reader.guru/chatapi/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt')
  fetch('https://reader.guru/chatapi/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth')
}
onMounted(() => {
  loadModels()
})

const checkAndPlayAudioIndex = (index: number) => {
  console.log('[checkAndPlayAudioIndex]', index)
  let timer = setInterval(async() => {
    if (audioUrls.value?.[index]) {
      clearInterval(timer)
      await playAudio(audioUrls.value[index])
      checkAndPlayAudioIndex(index+1)
    }
  }, 500)
}

const start = () => {
  // for (let i = 0; i < textList.value.length; i++) {
  //   let text = textList.value[i]
  //   downloadAudio(text)
  // }
  checkAndPlayAudioIndex(0)
}

watch(audioUrls, urls => {
  console.log('[urls]', urls)
}, {
  deep: true
})

const playAudio = async(url: string) => {
  audioPlayer.value.src = url;
  audioPlayer.value.style.display = 'block';
  audioPlayer.value.play();
  return new Promise((resolve) => {
    audioPlayer.value.addEventListener('ended', () => {
      console.log('current audio playing ended')
      resolve('')
    })
  })
}

const downloadAudio = async(text: string) => {
  const media_type = 'wav'
  const url = `https://reader.guru/chatapi/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=${media_type}&streaming_mode=true`
  try {
    // 替换为实际的后端 API 端点
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }

    const blob = new Blob(chunks, { type: response.headers.get('Content-Type') });
    const audioUrl = URL.createObjectURL(blob);
    console.log('[audioUrl]', audioUrl)
    audioUrls.value.push(audioUrl)
    
  } catch (error) {
      console.error('Error fetching or playing audio:', error);
  }
}

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
