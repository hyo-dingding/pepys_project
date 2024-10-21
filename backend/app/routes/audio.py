from fastapi import APIRouter, FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import shutil
import os
from config.db import conn  # MongoDB 연결

audio = APIRouter()

# 오디오 파일 업로드 및 STT 후 MongoDB에 저장하는 API
@audio.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    save_dir = "../uploaded_files"  # 서버에 임시로 파일 저장할 디렉터리 경로
    os.makedirs(save_dir, exist_ok=True)  # 디렉터리가 없으면 생성
    
    file_location = os.path.join(save_dir, file.filename)  # 파일 저장 경로 설정
    
    # 파일을 서버에 저장
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # STT 변환 실행
    stt_result = await perform_stt(file_location)

    # STT 결과를 MongoDB에 저장
    save_stt_to_mongo(stt_result)
    print("file", file)

    return {"message": "STT 작업 완료 및 저장됨", "stt_text": stt_result}

# STT 처리 함수 (faster_whisper 사용)
async def perform_stt(audio_path):
    model = WhisperModel("base")  # Whisper 모델을 로드
    segments, _ = model.transcribe(audio_path)  # 오디오 파일에서 텍스트로 변환
    
    stt_text = ""
    for segment in segments:
        stt_text += segment.text + " "  # 변환된 텍스트를 하나의 문자열로 합치기
    
    return stt_text  # STT 결과 반환

# MongoDB에 STT 결과 저장하는 함수
def save_stt_to_mongo(stt_result):
    document = {
        "stt_text": stt_result,  # STT 결과를 MongoDB에 저장할 데이터 구조
    }
    conn.audio.audio_file.insert_one(document)  # MongoDB의 audio_file 컬렉션에 데이터 삽입
