from fastapi import APIRouter, WebSocket
from fastapi.responses import HTMLResponse
from faster_whisper import WhisperModel
import asyncio
from config.db import conn  # MongoDB 연결

ws = APIRouter()
model = WhisperModel("base")  # Whisper 모델 로드

@ws.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()  # 클라이언트로부터 음성 데이터 수신
            print(f"Received audio data: {len(data)} bytes")  # 수신한 데이터 크기를 로그에 출력
            
            stt_text = await perform_stt(data)  # STT 수행
            print(f"STT 결과: {stt_text}") 
            await websocket.send_text(stt_text)  # 클라이언트에 STT 결과 전송
    except Exception as e:
        print(f"WebSocket error: {str(e)}") 
        # await websocket.close()
    finally:
        # 연결을 닫는 동작은 finally에서 수행하여 중복된 close 호출을 방지
        await websocket.close()

async def perform_stt(audio_data):
    segments, _ = model.transcribe(audio_data)  # 음성 데이터 STT
    stt_text = "".join([segment.text for segment in segments])  # 텍스트 변환
    print(f"Transcribed text: {stt_text}")  # 변환된 텍스트 로그
    return stt_text


