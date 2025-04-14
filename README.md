# PsychoSolace
PsychoSolace 是一个融合了 [SoulChat2.0](https://github.com/scutcyr/SoulChat2.0) 心理咨询模型与 [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) 语音克隆模型的特色聊天室。
## 1.效果展示
![image](https://github.com/user-attachments/assets/6c63f68c-e6e9-4019-afe2-69e2a7c01af5)


## 2. 功能亮点
* 个性化语音回复：能够使用用户自定义的声音来回答提问，为交流增添独特的情感色彩。
* 高效语音转文字：依托 OpenAI 的 Whisper 模型，实现精准的语音转文字（STT）功能，无缝对接文本交互流程。
* 低延时语音输出：前端智能处理服务端返回的流式文本，实时切割分块并回传服务端生成音频，极大程度地降低语音回答的延时，确保流畅的对话体验。
