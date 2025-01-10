from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from faster_whisper import WhisperModel
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from translate import Translator
from gtts import gTTS
import asyncio
import tempfile
import os
import json

ws = APIRouter()
deepgram_key = os.getenv("DEEPGRAM_CLIENT")
deepgram = DeepgramClient(deepgram_key)
# Whisper 모델 초기화 (대기 시간 감소)
model_size = "distil-medium.en"  # 모델 크기 설정
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
@ws.websocket("/ws/stt")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # 클라이언트 연결 수락
    print("WebSocket 연결 성공")

    try:
        # 클라이언트로부터 언어 설정 받기
        data = await websocket.receive_text()
        print("data",data[:30])
        # language_data = await websocket.receive_bytes()  # 텍스트로 수신

        # language_settings = json.loads(language_data)
        language_settings = json.loads(data)
        source_language = language_settings.get("source", "kon")
        target_language = language_settings.get("target", "en")
        print(f"언어 설정 - 원본: {source_language}, 타겟: {target_language}")

        audio_buffer = bytearray()
        
        # 클라이언트로부터 바이너리 오디오 데이터 수신
        async for message in websocket.iter_messages():
            if isinstance(message, bytes):  # 바이너리 데이터 처리
                audio_buffer.extend(message)

                # 충분한 오디오 데이터가 수신되었을 때 처리 (예: 1초 단위)
                if len(audio_buffer) > 16000 * 2:  # 2초 분량
                    print("오디오 데이터 처리 중...")
                    
                    # Whisper 모델로 STT 수행
                    result = model.transcribe(audio_buffer, beam_size=5, language=source_language)
                    transcript = result["text"]
                    print(f"STT 결과: {transcript}")

                    # 번역 수행
                    translated_text = translate_text(transcript, target_language)
                    print(f"번역 결과: {translated_text}")

                    # 번역된 텍스트를 클라이언트에 전송
                    response = {"transcription": transcript, "translation": translated_text}
                    await websocket.send_text(json.dumps(response))

                    # 버퍼 초기화
                    audio_buffer.clear()
            else:
                print("받은 메시지가 바이너리가 아님:", message)
        
        # async for audio_chunk in websocket.iter_bytes():  # 바이너리 데이터 수신
        #     audio_buffer.extend(audio_chunk)  # 오디오 청크를 버퍼에 추가

        #     # 특정 조건에 맞춰 모델에 입력 (임의로 설정한 버퍼 크기 기준으로 예제)
        #     if len(audio_buffer) > 16000 * 10:  # 10초 정도의 데이터가 쌓였을 때
        #         # Whisper 모델로 STT 처리
        #         transcript = WhisperModel.transcribe(
        #             bytes(audio_buffer), beam_size=5, language=source_language
        #         )
        #         audio_buffer.clear()  # 처리 후 버퍼 초기화

        #         # 번역 처리
        #         translated_text = translate_text(transcript, target_language)
        #         print(f"번역 결과 ({target_language}): {translated_text}")

        #         # 번역된 텍스트 음성 합성
        #         if translated_text:
        #             synthesized_audio_path = synthesize_speech(
        #                 translated_text, target_language
        #             )

        #             # WebSocket으로 전송
        #             if synthesized_audio_path:
        #                 response = {
        #                     "transcription": transcript,
        #                     "translation": translated_text,
        #                     "translatedAudio": synthesized_audio_path,
        #                 }
        #                 await websocket.send_text(json.dumps(response))
        #                 os.remove(synthesized_audio_path)  # 임시 파일 삭제

        # # # 음성 데이터를 수신하고 실시간으로 처리
        # async for audio_buffer in websocket.iter_bytes():
        #     import pdb
        #     pdb.set_trace()
        #     print("message", audio_buffer)
        #     try:
        #         # Whisper 모델로 STT 처리
        #         segments, _ = model.transcribe(
        #             audio_buffer, beam_size=5, language=source_language
        #         )

        #         for segment in segments:
        #             transcript = segment.text.strip()
        #             print(f"STT 결과: {transcript}")

        #             # 번역 처리
        #             translated_text = translate_text(transcript, target_language)
        #             print(f"번역 결과 ({target_language}): {translated_text}")

        #             # 합성된 음성 파일 생성
        #             if translated_text:
        #                 synthesized_audio_path = synthesize_speech(
        #                     translated_text, target_language
        #                 )

        #                 # WebSocket으로 텍스트 및 번역된 오디오 파일 경로 전송
        #                 if synthesized_audio_path:
        #                     response = {
        #                         "transcription": transcript,
        #                         "translation": translated_text,
        #                         "translatedAudio": synthesized_audio_path,
        #                     }
        #                     await websocket.send_text(json.dumps(response))
        #                     os.remove(synthesized_audio_path)  # 임시 파일 삭제

            # except Exception as e:
            #     print(f"오디오 처리 중 오류: {e}")
            #     await websocket.send_text(json.dumps({"error": str(e)}))

    except WebSocketDisconnect:
        print("WebSocket 연결이 종료되었습니다.")
    finally:
        await websocket.close()
        print("WebSocket 연결 닫힘")
