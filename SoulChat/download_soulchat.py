#SDK模型下载
from modelscope import snapshot_download
model_dir = snapshot_download('YIRONGCHEN/SoulChat2.0-Llama-3.1-8B', cache_dir='.')
