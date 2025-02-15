import os
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from faster_whisper import WhisperModel
import shutil
from datetime import datetime
from config.db import conn
import random
from uuid import uuid4


os.environ["KMP_DUPLICATE_LIB_OK"] = "True"

audio = APIRouter()

from routes.llm import get_summary


def generate_room_code():
    return str(random.randint(1000, 9999))  # 1000에서 9999 사이의 무작위 숫자를 생성


async def process_audio_complete(file: UploadFile, room_code: str):
    print("process_audio_complete", "file", file, "room_code", room_code)
    """오디오 파일 처리: STT 및 요약 통합 처리"""
    file_location = None
    try:
        # 1. 파일 저장
        save_dir = "../uploaded_files"
        
        os.makedirs(save_dir, exist_ok=True)
        file_location = os.path.join(save_dir, file.filename)

        with open(file_location, "wb") as buffer:
            try:
                shutil.copyfileobj(file.file, buffer)
            except Exception as e:
                print(f"Error saving file: {e}")
                raise e

        try:
            # STT 및 언어 감지 실행
            stt_result, detected_language = await perform_stt(file_location)
        except Exception as e:
            print(f"Error performing STT: {e}")
            raise e

        # 3. 요약 생성
        try:
            # 감지된 언어를 바탕으로 메인 요약 생성
            main_summary = await get_summary(stt_result, detected_language)
            summaries = {detected_language: main_summary["summary"]}

            # 감지된 언어를 제외한 다른 언어로 번역된 요약 생성
            for language in ["en", "ko", "zh", "ja"]:
                if (
                    language != detected_language
                ):  # 이미 메인 요약으로 생성된 언어는 제외
                    translated_summary = await get_summary(
                        main_summary["summary"], language
                    )
                    summaries[language] = translated_summary["summary"]

            # MongoDB에 저장
            document = {
                "room_code": room_code,
                "stt_text": stt_result,
                "summary": summaries,
                "detected_language": detected_language,
            }
            conn.audio.audio_file.insert_one(document)

            print("document", document)

            return {
                "room_code": room_code,
                "stt_text": stt_result,
                "summary": summaries,
                "detected_language": detected_language,
            }

        except Exception as e:
            print(f"Error generating summary or translation: {e}")
            raise e

    except Exception as e:
        if file_location and os.path.exists(file_location):
            os.remove(file_location)
        raise e


@audio.post("/upload-audio-complete")
async def upload_audio_complete(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")
        room_code = generate_room_code()
        result = await process_audio_complete(file, room_code)

        return {
            "status": "success",
            "message": "Audio processing completed",
            "data": result,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@audio.get("/get-results/{room_code}")
async def get_results(room_code: str, language: str):
    """STT와 요약 결과를 함께 가져오기"""
    try:
        result = conn.audio.audio_file.find_one({"room_code": room_code})

        if not result:
            raise HTTPException(
                status_code=404, detail=f"No results found for room code: {room_code}"
            )

        return {
            "stt_text": result["stt_text"],
            "summary": result["summary"].get(language, "Summary not available"),
            "room_code": room_code,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# STT 처리 함수 (faster_whisper 사용)
async def perform_stt(audio_path):
    model = WhisperModel("base", device="cpu", compute_type="float32")
    segments, info = model.transcribe(audio_path)

    detected_language = info.language
    print(f"감지된 언어: {detected_language}")

    stt_text = ""
    for segment in segments:
        stt_text += segment.text + " "

    return stt_text, detected_language


# 백엔드 코드 (FastAPI 예시)
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import requests
from pydantic import BaseModel
from fastapi.responses import FileResponse

XI_API_KEY = os.getenv("XI_API_KEY")

VOICE_ID = os.getenv("VOICE_ID")


# 클로닝된 오디오 파일을 저장할 폴더
VOICE_FILE_PATH = "./upload_voice"


class TTSRequest(BaseModel):
    text: str


if not os.path.exists(VOICE_FILE_PATH):
    os.makedirs(VOICE_FILE_PATH)


# background_tasks: BackgroundTasks
@audio.post("/convert-text-to-speech/")
async def convert_text_to_speech(
    request: TTSRequest,
):
    print("request", request)
    print("request.json()", request.json())
    tts_url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream"
    headers = {"Accept": "application/json", "xi-api-key": XI_API_KEY}
    data = {
        "text": request.text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.0,
            "use_speaker_boost": True,
        },
    }
    response = requests.post(tts_url, headers=headers, json=data, stream=True)

    if response.status_code == 200:
        audio_file_name = f"{uuid4()}.mp3"
        audio_file_path = os.path.join(VOICE_FILE_PATH, audio_file_name)

        with open(audio_file_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=1024):
                file.write(chunk)
                FileResponse(audio_file_name, media_type="audio/mpeg")
        return {"audio_file_name": audio_file_name}

    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@audio.get("/get-voice-audio/{filename}")
async def get_audio(filename: str):
    # 저장된 오디오 파일 경로 설정
    # file_path = f"../../voice_files/output_{filename}.mp3"
    file_path = os.path.join(VOICE_FILE_PATH, filename)
    print("file_path", file_path)

    # 파일이 존재하지 않는 경우 에러 반환
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    # 파일이 존재하면 클라이언트에 파일 반환
    return FileResponse(file_path, media_type="audio/mpeg", filename=filename)
