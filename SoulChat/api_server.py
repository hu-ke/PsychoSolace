import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import torch
from typing import Generator
from dataclasses import asdict

# 复用原有的模型处理代码
from web_Llama3 import (
    GenerationConfig,
    generate_interactive,
    load_model,
    combine_history,
    user_prompt,
    robot_prompt,
    cur_query_prompt
)

app = FastAPI(title="EmoLLM API Server")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局模型实例
global_model = None
global_tokenizer = None

class ChatRequest(BaseModel):
    message: str
    session_id: str  # 客户端管理的会话ID
    max_length: int = 32768
    top_p: float = 0.8
    temperature: float = 0.8
    repetition_penalty: float = 1.005

class SessionManager:
    def __init__(self):
        self.sessions = {}  # {session_id: messages}

    def get_messages(self, session_id: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        return self.sessions[session_id]

    def add_message(self, session_id: str, role: str, content: str):
        self.get_messages(session_id).append({
            "role": role,
            "content": content
        })

session_manager = SessionManager()

@app.on_event("startup")
async def load_models():
    global global_model, global_tokenizer
    print("Loading model...")
    global_model, global_tokenizer = load_model()
    print("Model loaded!")

def stream_generator(prompt: str, config: GenerationConfig, session_id: str):
    messages = session_manager.get_messages(session_id)
    full_prompt = combine_history(prompt, messages)  # 修改combine_history使其接受外部消息
    
    generation_config = GenerationConfig(
        max_length=config.max_length,
        top_p=config.top_p,
        temperature=config.temperature,
        repetition_penalty=config.repetition_penalty
    )

    for response in generate_interactive(
        model=global_model,
        tokenizer=global_tokenizer,
        prompt=full_prompt,
        additional_eos_token_id=128009,
        **asdict(generation_config)
    ):
        yield json.dumps({"content": response, "is_final": False}) + "\n"
    # 添加robot消息到历史
    session_manager.add_message(
        session_id, 
        "robot", 
        response
    )
    yield json.dumps({"content": "", "is_final": True}) + "\n"

@app.post("/chatapi/chat")
async def chat_stream(request: ChatRequest):
    print('request>', request)
    try:
        # 添加用户消息到历史
        session_manager.add_message(
            request.session_id, 
            "user", 
            request.message
        )

        print('sessions', session_manager.get_messages(request.session_id))
        config = GenerationConfig(
            max_length=request.max_length,
            top_p=request.top_p,
            temperature=request.temperature,
            repetition_penalty=request.repetition_penalty
        )

        return StreamingResponse(
            stream_generator(request.message, config, request.session_id),
            media_type="text/event-stream"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chatapi/sessions/{session_id}/clear")
async def clear_history(session_id: str):
    if session_id in session_manager.sessions:
        del session_manager.sessions[session_id]
    return {"status": "success"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6006)
