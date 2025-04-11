<template>
  <button @click="playStreamingAudio">播放</button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Howl } from 'howler';
const loadModels = () => {
  fetch('https://reader.guru/chatapi/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt')
  fetch('https://reader.guru/chatapi/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth')
}
onMounted(() => {
  loadModels()
})
const text = '先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。啦啦啦啦啦啦啊是丹江口市分我发我那次我能成为蔡文姬哦是激动啊是激动'

async function playStreamingAudio() {
  const audio = document.createElement('audio');
  audio.controls = true;
  document.body.appendChild(audio);

  const response = await fetch(`https://reader.guru/chatapi/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=wav&streaming_mode=true`);
  const blob = await response.blob();
  const audioURL = URL.createObjectURL(blob);
  audio.src = audioURL;
  audio.play();

  // const audio = document.createElement('audio');
  // audio.controls = true;
  // document.body.appendChild(audio);

  // const mediaSource = new MediaSource();
  // audio.src = URL.createObjectURL(mediaSource);

  // mediaSource.addEventListener('sourceopen', async () => {
  //   const mimeCodec = 'audio/wav'; // 或者 audio/wav，视后端返回类型
  //   const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

  //   const response = await fetch(`https://reader.guru/chatapi/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=wav&streaming_mode=true`);
  //   const reader = response.body.getReader();

  //   const pump = async () => {
  //     const { done, value } = await reader.read();
  //     if (done) {
  //       mediaSource.endOfStream();
  //       return;
  //     }
  //     sourceBuffer.appendBuffer(value);
  //     sourceBuffer.addEventListener('updateend', pump, { once: true });
  //   };

  //   pump();
  // });

  // const sound = new Howl({
  //   src: [`https://reader.guru/chatapi/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=wav&streaming_mode=true`],
  //   format: ['wav'], // 根据你的媒体类型调整
  //   html5: true // 强制HTML5 Audio以支持流式传输
  // });
  // console.log('play', sound)
  // sound.play();
  // const response = await fetch(`https://reader.guru/chatapi/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=wav&streaming_mode=true`);
  // const context = new (window.AudioContext || window.webkitAudioContext)();
  
  // if (!response.body) {
  //   throw new Error('ReadableStream not supported in this browser');
  // }

  // const reader = response.body.getReader();
  // const mediaType = 'wav'; // 根据你的实际媒体类型调整
  
  // // 创建媒体源
  // const source = context.createBufferSource();
  
  // // 处理流数据
  // const processStream = ({ done, value }) => {
  //   if (done) {
  //     console.log('Stream complete');
  //     return;
  //   }
    
  //   // 这里需要根据你的音频格式进行解码
  //   context.decodeAudioData(value.buffer, (buffer) => {
  //     source.buffer = buffer;
  //     source.connect(context.destination);
  //     source.start(0);
  //   });
    
  //   return reader.read().then(processStream);
  // };
  
  // reader.read().then(processStream);
}

defineProps<{ msg: string }>()

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
