<template>
  <div>
    <button @click="toggleRecording">
      {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
    </button>
    <p v-if="transcribedText">转录结果: {{ transcribedText }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const isRecording = ref(false);
let mediaRecorder = null;
const transcribedText = ref('');
const error = ref('');

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
  isRecording.value = !isRecording.value;
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      await sendAudioToAPI(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
  } catch (err) {
    error.value = '无法访问麦克风: ' + err.message;
  }
};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
};

const sendAudioToAPI = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  try {
    const response = await axios.post(`${BASE_URL}/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    transcribedText.value = response.data.text;
    error.value = '';
  } catch (err) {
    error.value = '转录失败: ' + (err.response?.data?.detail || err.message);
  }
};
</script>