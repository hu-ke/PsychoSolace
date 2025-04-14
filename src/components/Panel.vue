<template>
  <div class="chat-container">
    <div v-if="!introHidden" class="intro">
      <p>亲爱的朋友，欢迎来到心灵港湾🌙</p>
      <p>
        这里是基于<a href="https://github.com/scutcyr/SoulChat2.0" target="_blank">SoulChat2.0</a>情感引擎与<a href="https://github.com/RVC-Boss/GPT-SoVITS" target="_blank">GPT_SoVITS</a> AI语音克隆技术打造的温暖空间。我不仅能用最懂你的方式文字交流，还能用治愈声线给予回应，让每次对话都像老友重逢般亲切自然。
      </p>
      <div>
        您可以随时对我说：
        <a v-for="msg in sampleMessages" @click="onClickSampleMessage(msg)" style="display: block; cursor: pointer;">
          {{ msg }}
        </a>
        让我们从一句"你好"开始，书写属于我们的治愈故事吧❤️
      </div>
      <span style="position: absolute;right: 30px; top: 30px; cursor: pointer; text-decoration: underline;" @click="closeIntro">
        关闭
      </span>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="msg.sender === MESSAGE_TYPES.USER ? 'user-message' : 'bot-message'"
      >
        <div v-if="msg.sender === MESSAGE_TYPES.ROBOT" class="bot-message-box">
          <img class="photo" :src="robotPhoto" alt="" />
          <div>
            <div class="voice-bar" :style="{width: msg.duration ? `${msg.duration * 20}px`: '200px'}">
              <div @click="playUrls(msg)" v-if="msg.duration" style="width: 100%;display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
                <svg t="1744441693665" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1478" width="28" height="28"><path d="M729.6 512c0 131.2-51.2 256-144 352l22.4 22.4 22.4 22.4c105.6-105.6 163.2-246.4 163.2-396.8S736 224 630.4 118.4l-3.2-3.2-22.4 22.4-22.4 22.4 3.2 3.2c92.8 92.8 144 217.6 144 348.8z" fill="#707070" p-id="1479"></path><path d="M483.2 761.6s-3.2 0 0 0l22.4 22.4 22.4 22.4c163.2-163.2 163.2-425.6 0-585.6l-3.2-3.2-22.4 22.4-22.4 22.4 3.2 3.2c134.4 137.6 134.4 358.4 0 496z" fill="#707070" p-id="1480"></path><path d="M380.8 659.2c0 3.2 0 3.2 0 0l22.4 22.4 22.4 22.4c105.6-105.6 105.6-278.4 0-387.2l-3.2-3.2-22.4 22.4-22.4 22.4 3.2 3.2c83.2 86.4 83.2 217.6 0 297.6zM316.8 595.2c44.8-44.8 44.8-118.4 0-163.2l-3.2-3.2L230.4 512l86.4 83.2c-3.2 0-3.2 0 0 0z" fill="#707070" p-id="1481"></path></svg>
                <Playing v-if="msg.isPlaying" />
                <span>{{ msg.duration }}"</span>
              </div>
              <div v-else style="margin-top: -6px; flex: 1;"><LoadingDots /></div>
            </div>
            <div class="bubble bot-bubble">{{ msg.text }}</div>
          </div>
        </div>
        <div v-else class="bubble user-bubble">{{ msg.text }}</div>
      </div>
    </div>

    <div class="voice-tip" v-show="showVoiceTip">录音中...松开发送</div>
    <div class="input-container">
      <img @click="toggleInputMode" :src="inputMode === INPUT_MODE.TEXT ? microphoneImg : inputTextImg" style="width: 40px; height: 40px; cursor: pointer;"/>
      <input
        v-if="inputMode === INPUT_MODE.TEXT"
        v-model="inputMessage"
        type="text"
        class="input-box"
        placeholder="说点什么吧..."
        @keyup.enter="sendMessage"
      >
      <div v-else class="input-box" style="cursor: pointer;user-select: none;" @touchstart="startVoice" @mousedown="startVoice" @touchend="endVoice" @mouseup="endVoice">按住说话</div>
      <button v-if="inputMode === INPUT_MODE.TEXT" class="voice-btn" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted, computed } from 'vue';
import { useAudioDownloader } from '../composables/useAudioDownloader';
import { useAudioPlayer } from '../composables/useAudioPlayer';
import { playAudioUrls, punctuationIndex, calculateDurations, downloadAudio } from '../utils';
import robotPhoto from '../assets/robot-photo.png';
import inputTextImg from '../assets/input_text.png';
import microphoneImg from '../assets/static-microphone.jpg';
import { MESSAGE_TYPES, TEMPERATURE, TOP_P, INPUT_MODE, BASE_URL } from '../utils/constants';
import LoadingDots from './LoadingDots.vue';
import Playing from './Playing.vue';
import { useASR } from '../composables/useASR';
const sessionId = ref(Date.now().toString());
const preText = ref('我可以帮你聊聊心理学相关的问题，比如情绪管理、人际关系、个人成长等。你最近有什么困扰吗？')

const sampleMessages = ref([
  '今天上司否定了我的方案，好挫败…',
  '能陪我聊聊童年那棵老槐树吗？',
  '今天受老师批评了，不开心'
])

const introHidden = ref(localStorage.getItem('intro-hidden'))
const messages = reactive([
  {
    text: preText.value,
    sender: MESSAGE_TYPES.ROBOT,
    audioUrls: []
  }
])
const inputMessage = ref('')
const showVoiceTip = ref(false)
const messagesContainer = ref(null)
const isAnswering = ref(false)
const buffer = ref('');
const textChunks = ref([])
const inputMode = ref(INPUT_MODE.VOICE)

const { audioUrls, finished: downloadingFinished, reset: resetDownloader } = useAudioDownloader({
  textList: textChunks
})

// 按序轮询检测播放，不必等audioUrls全部加载完
const { finished: audioPlayingFinished, reset: resetAudioPlayer } = useAudioPlayer({
  audioUrls,
  downloadingFinished
})

const { transcribedText, startRecording, stopRecording } = useASR()

onMounted(async() => {
  const audioUrl = await downloadAudio(preText.value)
  if (audioUrl) {
    messages[0].audioUrls = [audioUrl]
    messages[0].duration = await calculateDurations([audioUrl])
  }
})

watch(downloadingFinished, async(finished) => {
  if (finished) {
    await nextTick()
    await updateLastMessageAudioUrls({
      sender: MESSAGE_TYPES.ROBOT,
      audioUrls: audioUrls.value
    })
  }
})

watch(audioPlayingFinished, (finished) => {
  if (finished) {
    resetAudioPlayer()
    textChunks.value = []
    resetDownloader()
  }
})

const lastRobotText = computed(() => {
  const robotMessages = messages.filter(m => m.sender === MESSAGE_TYPES.ROBOT);
  if (robotMessages.length > 0) {
    const lastMessage = robotMessages[robotMessages.length - 1];
    return lastMessage?.text || ''
  }
  return ''
})

watch(buffer, bf => {
  if (bf) {
    let prevStr = textChunks.value.join('')
    let currentStr = bf.slice(prevStr.length)
    let idx = punctuationIndex(currentStr)
    const str = currentStr.slice(0, idx + 1)
    if (idx > -1 && str) {
      textChunks.value.push(str)
    }
    updateLastMessageText({
      sender: MESSAGE_TYPES.ROBOT,
      text: bf
    });
  }
})

watch(isAnswering, anwsering => {
  // 本轮回答已经结束，将剩余的消息append到textChunks里面
  if (!anwsering) {
    const remainString = lastRobotText.value.slice(textChunks.value.join('').length)
    if (remainString) {
      textChunks.value.push(remainString)
    }
  }
})

// 自动滚动到底部
watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})
console.log('[messages]', messages)

const playUrls = async(msg) => {
  let message = messages.find(mg => mg.text === msg.text)
  message.isPlaying = true
  await playAudioUrls(message.audioUrls)
  message.isPlaying = false
}

const appendMessageText = ({sender, text}) => {
  messages.push({ sender, text });
};

const updateLastMessageText = ({sender, text}) => {
  const rMessages = messages.filter(m => m.sender === sender);
  if (rMessages.length > 0) {
    const lastMessage = rMessages[rMessages.length - 1];
    lastMessage.text = text;
  }
};

const updateLastMessageAudioUrls = async({sender, audioUrls}) => {
  const rMessages = messages.filter(m => m.sender === sender);
  if (rMessages.length > 0) {
    const lastMessage = rMessages[rMessages.length - 1];
    lastMessage.audioUrls = audioUrls;
    lastMessage.duration = await calculateDurations(audioUrls)
  }
};

const sendMessage = async() => {
  const text = inputMessage.value.trim()
  if (!text) return

  // 添加用户消息
  appendMessageText({
    sender: MESSAGE_TYPES.USER,
    text
  })
  appendMessageText({
    sender: MESSAGE_TYPES.ROBOT,
    text: buffer.value
  })

  // 请求参数
  const params = {
    message: text,
    session_id: sessionId.value,
    temperature: TEMPERATURE,
    top_p: TOP_P
  }

  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    isAnswering.value = true
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunks = decoder.decode(value).split('\n');
      for (const chunk of chunks) {
        if (!chunk) continue;
        const data = JSON.parse(chunk);
        if (!data.is_final) {
          buffer.value = data.content;
        }
      }
    }
    buffer.value = '';
  } catch (error) {
    console.error('Error:', error);
  } finally {
    isAnswering.value = false
  }

  inputMessage.value = ''
}

const onClickSampleMessage = (msg) => {
  inputMessage.value = msg
  sendMessage()
}

// 语音功能占位
const startVoice = () => {
  showVoiceTip.value = true
  startRecording()
  // 实际应接入语音识别API
}

watch(transcribedText, text => {
  console.log('[transcribedText]', text)
  inputMessage.value = text
  sendMessage()
})

const toggleInputMode = () => {
  inputMode.value = inputMode.value === INPUT_MODE.TEXT ? INPUT_MODE.VOICE : INPUT_MODE.TEXT
}

const endVoice = () => {
  showVoiceTip.value = false
  stopRecording()
  // 结束语音输入处理
}

const closeIntro = () => {
  localStorage.setItem('intro-hidden', 1)
  introHidden.value = true
}
</script>

<style lang="scss" scoped>
.intro {
  position: relative;
  padding: 20px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 -20px;
}
/* 保持原有样式不变 */
.chat-container {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
  background-color: #fff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.bot-message {
  justify-content: flex-start;
  &-box {
    display: flex;
    & > .photo {
      width: 40px;
      height: 40px;
      border-radius: 100%;
      margin-right: 10px;
    }
    .voice-bar {
      width: 200px;
      height: 40px;
      border-radius: 40px;
      background-color: #F5F5F5;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .bot-bubble {
      background-color: #F5F5F5;
      border-radius: 0 8px 8px 8px;
      text-align: left;
    }
  }
}

.user-message {
  justify-content: flex-end;
  & > .user-bubble {
    background: #4CAF50;
    color: white;
    border-radius: 8px 0 8px 8px;
  }
}

.bubble {
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 18px;
  line-height: 1.5;
  position: relative;
}

.input-container {
  display: flex;
  gap: 10px;
  padding: 15px 0;
  position: sticky;
  bottom: 0;

  & > .input-box {
    flex: 1;
    padding: 12px 20px;
    border: 1px solid #ddd;
    border-radius: 25px;
    font-size: 16px;
  }

  & > .voice-btn {
    border: none;
    padding: 12px 20px;
    // border: 1px solid #007AFF;
    background-color: #007AFF;
    border-radius: 25px;
    color: #fff;
    cursor: pointer;
  }
}

.voice-tip {
  text-align: center;
  color: #666;
  font-size: 0.9em;
  padding: 8px 0;
}
</style>