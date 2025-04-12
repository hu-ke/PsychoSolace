import { ref } from 'vue';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

export const useASR = () => {
  const isRecording = ref(false);
  let mediaRecorder = ref<MediaRecorder>();
  const transcribedText = ref('');
  const error = ref('');

  // const toggleRecording = async () => {
  //   if (isRecording.value) {
  //     stopRecording();
  //   } else {
  //     startRecording();
  //   }
  //   isRecording.value = !isRecording.value;
  // };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.value = new MediaRecorder(stream);
      const audioChunks = [] as any;

      mediaRecorder.value.ondataavailable = (event: { data: any; }) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.value.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendAudioToAPI(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.value.start();
      isRecording.value = true
    } catch (err: any) {
      error.value = '无法访问麦克风: ' + err.message;
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.value) {
      mediaRecorder.value.stop();
      isRecording.value = false
    }
  };

  const sendAudioToAPI = async (audioBlob: any) => {
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
    } catch (err: any) {
      error.value = '转录失败: ' + (err.response?.data?.detail || err.message);
    }
  };

  return {
    transcribedText,
    startRecording,
    stopRecording,
    isRecording
  }
}