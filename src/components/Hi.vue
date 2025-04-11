<template>
  <div>
    <button @click="togglePlay">{{ isPlaying ? '停止' : '开始播放' }}</button>
    <audio ref="audioElement"></audio>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'

const loadModels = () => {
  fetch('https://reader.guru/chatapi/set_gpt_weights?weights_path=/root/GPT-SoVITS/GPT_weights_v2/huke-e5.ckpt')
  fetch('https://reader.guru/chatapi/set_sovits_weights?weights_path=/root/GPT-SoVITS/SoVITS_weights_v2/huke_e4_s36.pth')
}
onMounted(() => {
  loadModels()
})

const audioElement = ref(null)
const mediaSource = ref(null)
const sourceBuffer = ref(null)
const isPlaying = ref(false)
const error = ref(null)
const mimeType = 'audio/ogg; codecs="opus"' // 根据实际编码调整

// 初始化 MediaSource
const initMediaSource = () => {
  mediaSource.value = new MediaSource()
  audioElement.value.src = URL.createObjectURL(mediaSource.value)
  
  mediaSource.value.addEventListener('sourceopen', () => {
    try {
      sourceBuffer.value = mediaSource.value.addSourceBuffer(mimeType)
      sourceBuffer.value.mode = 'sequence'
      sourceBuffer.value.addEventListener('updateend', appendNextChunk)
    } catch (err) {
      error.value = `不支持的格式: ${err.message}`
    }
  })
}

let streamReader = null
let bufferQueue = []

// 处理数据块追加
const appendNextChunk = async () => {
  if (bufferQueue.length > 0 && !sourceBuffer.value.updating) {
    const chunk = bufferQueue.shift()
    try {
      sourceBuffer.value.appendBuffer(chunk)
    } catch (err) {
      error.value = `数据追加失败: ${err.message}`
    }
  }
}

// 启动音频流
const startStream = async () => {
  try {
    const text = '先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。'
    const media_type = 'ogg'
    const url = `https://reader.guru/chatapi/tts?text=${text}&text_lang=zh&ref_audio_path=huke-sample.m4a&prompt_lang=zh&prompt_text=新昌AI,新昌小程序所需材料,精修,小程序代码,资讯信息&text_split_method=cut5&batch_size=1&media_type=${media_type}&streaming_mode=true`
 
    const response = await fetch(url)
    streamReader = response.body.getReader()
    
    while (true) {
      const { done, value } = await streamReader.read()
      if (done) break
      
      bufferQueue.push(value.buffer)
      appendNextChunk()
    }
  } catch (err) {
    error.value = `流式请求失败: ${err.message}`
  }
}

// 播放控制
const togglePlay = async () => {
  if (isPlaying.value) {
    // 停止播放
    mediaSource.value.endOfStream()
    audioElement.value.pause()
    if (streamReader) await streamReader.cancel()
    mediaSource.value = null
  } else {
    // 开始播放
    initMediaSource()
    audioElement.value.play()
    await startStream()
  }
  isPlaying.value = !isPlaying.value
}

// 清理资源
onUnmounted(() => {
  if (mediaSource.value) {
    mediaSource.value.endOfStream()
  }
  if (streamReader) {
    streamReader.cancel()
  }
})
</script>

<style scoped>
.error { color: red; }
button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>