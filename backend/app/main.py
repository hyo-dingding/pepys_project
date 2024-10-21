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
