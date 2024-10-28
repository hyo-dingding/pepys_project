import os
from fastapi import APIRouter, UploadFile, File
from faster_whisper import WhisperModel
import shutil

from config.db import conn
import random
os.environ['KMP_DUPLICATE_LIB_OK']='True'

audio = APIRouter()

def generate_room_code():
    return str(random.randint(1000, 9999))  # 1000에서 9999 사이의 무작위 숫자를 생성


# 오디오 파일 업로드 및 STT 후 MongoDB에 저장하는 API
@audio.post("/upload-audio")
async def upload_audio( file: UploadFile = File(...)):
    try:
        room_code = generate_room_code()
        save_dir = "../uploaded_files"  
        os.makedirs(save_dir, exist_ok=True)  
    
        file_location = os.path.join(save_dir, file.filename)  
    
        # 파일을 서버에 저장
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
        # STT 변환 실행
        stt_result = await perform_stt(file_location)

        # STT 결과를 MongoDB에 저장
        save_stt_to_mongo(stt_result, room_code)

        return {"message": "STT 작업 완료 및 저장됨", "stt_text": stt_result, "roomCode": room_code }
    except Exception as e:
        print(f"에러 발생: {e}")
        return {"error": "파일 업로드 중 오류가 발생했습니다.", "details": str(e)}


# STT 처리 함수 (faster_whisper 사용)
async def perform_stt(audio_path):
    model = WhisperModel("base", device="cpu")
    segments, _ = model.transcribe(audio_path) 
    
    stt_text = ""
    for segment in segments:
        stt_text += segment.text + " "  
    
    return stt_text 


# MongoDB에 STT 결과 저장하는 함수
def save_stt_to_mongo(stt_result, room_code):
    document = {
        "stt_text": stt_result,  
        "room_code": room_code,
        
    }
    conn.audio.audio_file.insert_one(document)  


# MongoDB에서 STT 데이터 GET API
@audio.get("/upload-audio/get-stt/{room_code}")
async def get_stt_by_room_code(room_code: str):
    result = conn.audio.audio_file.find_one({"room_code": room_code})
    
    if result:
        print("result 데이터 잘가져왔는지",result["stt_text"])
        return {"stt_text": result["stt_text"]}
    else:
        return {"detail": f"오류 발생: {room_code}에 대한 STT 결과를 찾을 수 없습니다."}
