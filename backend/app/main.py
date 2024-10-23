from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.user import user
from routes.audio import audio
from routes.websocket import ws

app = FastAPI()
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

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile, File

from faster_whisper import WhisperModel
from pymongo import MongoClient
import shutil
import os

from config.db import conn

# randomnum.py
from routes import randomnum
app.include_router(randomnum.randomnum)

#login.py
from routes import login
app.include_router(login.router)

save_dir = "./uploaded_files"  # 서버 내부 경로
os.makedirs(save_dir, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_name = file.filename
        file_path = os.path.join(save_dir, file_name)
        
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        return {"message": f"'{file_name}' 파일이 성공적으로 저장되었습니다.", "file_path": file_path}
    except Exception as e:
        return {"error": str(e)}

