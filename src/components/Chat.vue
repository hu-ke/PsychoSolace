<template>
  <div id="chat-container" class="max-w-4xl mx-auto">
    <div id="history" class="h-96 overflow-y-auto border border-gray-300 p-2 mb-2">
      <div v-for="(message, index) in messages" :key="index" :class="message.role === 'user' ? 'user-message' : 'robot-message'">
        <strong>{{ message.role }}:</strong> {{ message.content }}
      </div>
    </div>
    <input v-model="inputMessage" type="text" placeholder="Input your message..." class="w-4/5 p-2">
    <button @click="sendMessage" class="w-1/5 p-2">Send</button>
    <div>
      <label>Temperature: <input v-model="temperature" type="range" min="0" max="1" step="0.1" value="0.7"></label>
      <label>Top-p: <input v-model="topP" type="range" min="0" max="1" step="0.1" value="0.8"></label>
      <button @click="clearHistory">Clear session</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const sessionId = ref(Date.now().toString());
const messages = ref([]);
const inputMessage = ref('');
const temperature = ref(0.7);
const topP = ref(0.8);
let buffer = '';

const sendMessage = async () => {
  const message = inputMessage.value;
  inputMessage.value = '';

  // 添加用户消息
  appendMessage('robot', message)
  appendMessage('robot', buffer)

  // 获取参数
  const params = {
    message: message,
    session_id: sessionId.value,
    temperature: parseFloat(temperature.value),
    top_p: parseFloat(topP.value)
  };

  try {
    const response = await fetch('http://127.0.0.1:6006/chatapi/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunks = decoder.decode(value).split('\n');
      for (const chunk of chunks) {
        if (!chunk) continue;
        const data = JSON.parse(chunk);
        if (!data.is_final) {
          buffer = data.content;
          updateLastMessage('robot', buffer);
        }
      }
    }
    buffer = '';
  } catch (error) {
    console.error('Error:', error);
  }
};

const appendMessage = (role, content) => {
  messages.value.push({ role, content });
};

const updateLastMessage = (role, content) => {
  const robotMessages = messages.value.filter(m => m.role === role);
  if (robotMessages.length > 0) {
    const lastMessage = robotMessages[robotMessages.length - 1];
    lastMessage.content = content;
  } else {
    appendMessage(role, content);
  }
};

const clearHistory = async () => {
  await fetch(`/sessions/${sessionId.value}/clear`, { method: 'POST' });
  messages.value = [];
};
</script>

<style scoped>
.user-message {
  text-align: right;
}

.robot-message {
  text-align: left;
}
</style>    