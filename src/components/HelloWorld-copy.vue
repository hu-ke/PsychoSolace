<template>
  <button @click="() => playAudio('先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。')">播放</button>
  <audio ref="audioPlayer" controls style="display: none;"></audio>
  <input type="text" v-model="inputVal"/>
  <button @click="submit">submit</button>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";

// const baseUrl = 'http://127.0.0.1:6006'
const baseUrl = 'https://reader.guru/chatapi'
// const playAudio = async() => {
//   // let { data } = await axios.get(`${baseUrl}/audio`)
//   const audio = new Audio(`${baseUrl}/audio?text=听起来你现在感觉很沉重。能和我分享是什么让你这么难受吗？`);
//   await audio.play()
//   // console.log('data', data)
//   // return data
// }
const audioPlayer = ref()
const inputVal = ref('')
const loadModels = () => {
  fetch('https://reader.guru/chatapi/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt')
  fetch('https://reader.guru/chatapi/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth')
}
onMounted(() => {
  loadModels()
})

const playAudio = async(text) => {
  const media_type = 'ogg'
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

    console.log('audioPlayer', audioPlayer)
    audioPlayer.value.src = audioUrl;
    audioPlayer.value.style.display = 'block';
    audioPlayer.value.play();
  } catch (error) {
      console.error('Error fetching or playing audio:', error);
  }
}
const submit = async() => {
  playAudio(inputVal.value)
}


defineProps<{ msg: string }>()

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
