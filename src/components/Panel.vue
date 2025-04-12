<template>
  <div class="chat-container">
    <div class="intro">
      <p>亲爱的朋友，欢迎来到心灵港湾🌙</p>
      <p>
        这里是基于<a href="https://github.com/scutcyr/SoulChat2.0" target="_blank">SoulChat2.0</a>情感引擎与<a href="https://github.com/RVC-Boss/GPT-SoVITS" target="_blank">GPT_SoVITS</a> AI语音克隆技术打造的温暖空间。我不仅能用最懂你的方式文字交流，还能用治愈声线给予回应，让每次对话都像老友重逢般亲切自然。
      </p>
      <div>
        您可以随时对我说：
        <div>"今天上司否定了我的方案，好挫败…"</div>
        <div>"能陪我聊聊童年那棵老槐树吗？"</div>
        <div>"用妈妈的声音给我读首诗好吗？"</div>
        让我们从一句"你好"开始，书写属于我们的治愈故事吧❤️
      </div>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="msg.sender === 'user' ? 'user-message' : 'bot-message'"
      >
        <div v-if="msg.sender === 'bot'" class="bot-message-box">
          <img class="photo" :src="robotPhoto" alt="" />
          <div>
            <div class="voice-bar">3"</div>
            <div class="bubble bot-bubble">{{ msg.text }}</div>
          </div>
        </div>
        <div v-else class="bubble user-bubble">{{ msg.text }}</div>
      </div>
    </div>

    <div class="voice-tip" v-show="showVoiceTip">按住 说话</div>
    <div class="input-container">
      <input
        v-model="inputMessage"
        type="text"
        class="input-box"
        placeholder="说点什么吧..."
        @keyup.enter="sendMessage"
      >
      <button class="voice-btn" @mousedown="startVoice" @mouseup="endVoice">语音</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import robotPhoto from '../assets/robot-photo.png';

const messages = reactive([
  {
    text: '我可以帮你聊聊心理学相关的问题，比如情绪管理、人际关系、个人成长等。你最近有什么困扰吗？',
    sender: 'bot',
    status: 11
  }
])
const inputMessage = ref('')
const showVoiceTip = ref(false)
const messagesContainer = ref(null)

// 自动滚动到底部
watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

onMounted(() => {
  sendMessage()
  setTimeout(() => {
    sendMessage()
    setTimeout(() => {
      sendMessage()
      setTimeout(() => {
        sendMessage()
        setTimeout(() => {
          sendMessage()
        }, 2000)
      }, 2000)
    }, 2000)
  }, 2000)
})

const generateStatus = () => Math.floor(Math.random() * 12)

const sendMessage = () => {
  const text = inputMessage.value.trim() || '你好'
  if (!text) return

  messages.push({
    text,
    sender: 'user',
    status: generateStatus()
  })

  // 模拟机器人回复
  setTimeout(() => {
    const botResponse = getBotResponse(text)
    messages.push({
      text: botResponse,
      sender: 'bot',
      status: generateStatus()
    })
  }, 1000)

  inputMessage.value = ''
}

const getBotResponse = (userMessage) => {
  const responses = {
    'hello': '你好呀，刚刚说到学习跟不上，你觉得主要是什么原因呢？',
    'default': '学习跟不上确实让人有点焦虑。你觉得是哪个方面的问题呢？是时间管理、学习方法，还是其他原因？'
  }
  return responses[userMessage.toLowerCase()] || responses['default']
}

// 语音功能占位
const startVoice = () => {
  showVoiceTip.value = true
  // 实际应接入语音识别API
}

const endVoice = () => {
  showVoiceTip.value = false
  // 结束语音输入处理
}
</script>

<style lang="scss" scoped>
.intro {
  padding: 20px;
}
/* 保持原有样式不变 */
.chat-container {
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

.status {
  color: #666;
  font-size: 0.8em;
  margin-left: 8px;
  align-self: flex-end;
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
    padding: 12px 20px;
    border: 1px solid #007AFF;
    border-radius: 25px;
    background: white;
    color: #007AFF;
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