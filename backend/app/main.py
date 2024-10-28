import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocketState


from routes import login
from routes.randomnum import randomnum

from routes.user import user
from routes.audio import audio
from routes.websocket import ws


app = FastAPI()

app.include_router(login.router)
app.include_router(randomnum)
app.include_router(user)

app.include_router(audio)
app.include_router(ws)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 여기서 필요한 도메인을 제한할 수 있습니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "API is working!"}


# # # Deepgram API 키
# # DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

# from dotenv import load_dotenv

# from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect
# from deepgram import Deepgram
# import os


# load_dotenv()


# # URL = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service"
# DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
# dg_client = Deepgram(DEEPGRAM_API_KEY)
# DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen?model=nova-2"


# @app.websocket("/ws/stt")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("WebSocket 연결 성공")

#     try:
#         dg_connection = await dg_client.transcription.live(
#             {
#                 "punctuate": True,
#                 "language": "en", #"ko-KR",  # "en",
#                 "model": "nova-2",
#                 "encoding": "linear16",
#                 "sample_rate": 16000,
#                 "channels": 1,
#                 "smart_format": True,

#                 # "interim_results": True,
#             }
#         )
#         print("Deepgram 연결 성공")

#         async def handle_transcription_event(result):
#             # print("result", result)
#             # transcript_value = result.get('channel', {}).get('alternatives', [{}])[0].get('transcript', "")
#             # print("transcript_value", transcript_value)
#             # import pdb

#             # pdb.set_trace()
#             transcript_value = result["channel"]["alternatives"][0]["transcript"]
#             # print("transcript_value", transcript_value)

#             try:
#                 # if isinstance(result, str):
#                 #     result = json.loads(result)

#                 # if (
#                 #     "channel" in result
#                 #     and "alternatives" in result["channel"]
#                 #     and result["channel"]["alternatives"]
#                 # ):
#                 #     transcript = result["channel"]["alternatives"][0].get(
#                 #         "transcript", ""
#                 #     )

#                 if transcript_value:
#                     print("transcript", transcript_value)
#                     await websocket.send_text(transcript_value)

#             except Exception as e:
#                 print(f"전사 처리 중 오류: {e}")

#         dg_connection.registerHandler(
#             dg_connection.event.TRANSCRIPT_RECEIVED, handle_transcription_event
#         )

#         # 클라이언트로부터 메시지 수신
#         async for message in websocket.iter_bytes():
#             # print("클라이언트 메세지", message[:50])
#             if not message:
#                 break
#             try:
#                 dg_connection.send(message)
#             except Exception as e:
#                 print(f"오디오 데이터 전송 중 오류: {e}")
#                 break

#         # Deepgram 연결 종료
#         await dg_connection.finish()

#     except WebSocketDisconnect:
#         print("WebSocket 연결이 클라이언트에 의해 종료됨")
#         connection_open = False
#     except Exception as e:
#         print(f"예기치 않은 오류 발생: {e}")
#     finally:
#         if dg_connection in locals():
#             await dg_connection.finish()
#         await websocket.close()
#         print("WebSocket 연결 종료 및 정리 완료")


################
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel
from translate import Translator
from gtts import gTTS
import asyncio
import tempfile
import os
import json

# ws = APIRouter()

# Whisper 모델 초기화 (대기 시간 감소)
model_size = "small"  # 모델 크기 설정
model = WhisperModel(model_size, device="cpu", compute_type="int8")


# 번역 함수
def translate_text(text, target_language):
    try:
        translator = Translator(from_lang="en", to_lang=target_language)
        return translator.translate(text)
    except Exception as e:
        print(f"번역 오류: {e}")
        return None


# 음성 합성 함수
def synthesize_speech(text, language):
    try:
        # 텍스트를 음성으로 변환 후 임시 파일에 저장
        tts = gTTS(text=text, lang=language, slow=False)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
            temp_path = f.name
            tts.save(temp_path)
        return temp_path
    except Exception as e:
        print(f"음성 합성 오류: {e}")
        return None


# WebSocket 엔드포인트
@app.websocket("/ws/stt")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # 클라이언트 연결 수락
    print("WebSocket 연결 성공")

    try:
        # 클라이언트로부터 언어 설정 받기
        data = await websocket.receive_bytes()
        print("data", data)
        language_settings = json.loads(data)
        source_language = language_settings.get("source", "en")
        target_language = language_settings.get("target", "ko")
        print(f"언어 설정 - 원본: {source_language}, 타겟: {target_language}")

        # 음성 데이터를 수신하고 실시간으로 처리
        async for message in websocket.iter_bytes():
            import pdb

            pdb.set_trace()
            try:
                # Whisper 모델로 STT 처리
                segments, _ = model.transcribe(
                    message, beam_size=5, language=source_language
                )

                for segment in segments:
                    transcript = segment.text.strip()
                    print(f"STT 결과: {transcript}")

                    # 번역 처리
                    translated_text = translate_text(transcript, target_language)
                    print(f"번역 결과 ({target_language}): {translated_text}")

                    # 합성된 음성 파일 생성
                    if translated_text:
                        synthesized_audio_path = synthesize_speech(
                            translated_text, target_language
                        )

                        # WebSocket으로 텍스트 및 번역된 오디오 파일 경로 전송
                        if synthesized_audio_path:
                            response = {
                                "transcription": transcript,
                                "translation": translated_text,
                                "translatedAudio": synthesized_audio_path,
                            }
                            await websocket.send_text(json.dumps(response))
                            os.remove(synthesized_audio_path)  # 임시 파일 삭제

            except Exception as e:
                print(f"오디오 처리 중 오류: {e}")
                await websocket.send_text(json.dumps({"error": str(e)}))

    except WebSocketDisconnect:
        print("WebSocket 연결이 종료되었습니다.")
    finally:
        await websocket.close()
        print("WebSocket 연결 닫힘")
