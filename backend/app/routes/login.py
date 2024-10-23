from fastapi import APIRouter, Depends, HTTPException, status  # FastAPI의 라우터와 의존성 및 예외 처리
from passlib.context import CryptContext  # 비밀번호 해시와 검증을 위한 passlib 사용
from config.db import conn  # MongoDB의 사용자 컬렉션 사용
from models.user import  UserLogin, Token, User #, UserCreate  # 스키마 불러오기
from bson import ObjectId
from datetime import datetime, timedelta, timezone  # 토큰의 만료 시간을 설정하기 위한 모듈
from jose import JWTError, jwt  # JWT 토큰을 생성하고 검증하는 라이브러리
from dotenv import load_dotenv
import os
import re

load_dotenv()

router = APIRouter(
    prefix="/auth",  # 라우터 경로 앞에 자동으로 "/auth"를 추가
    tags=["auth"]  # 해당 라우터에 태그 추가 (Swagger에서 보기 좋게 하기 위해)
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# 비밀번호 해시와 검증을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호가 맞는지 검증하는 함수
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 비밀번호를 해시하는 함수
def get_password_hash(password):
    return pwd_context.hash(password)

# JWT Access 토큰 생성 함수
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# JWT Refresh 토큰 생성 함수
def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 로그인 엔드포인트
@router.post("/login", response_model=Token)
def login(user_login: UserLogin):
    user = conn.rag_db.user.find_one({"email": user_login.email})  # MongoDB에서 이메일로 사용자 찾기
    if not user or not verify_password(user_login.password, user["hashed_password"]):    
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 자격 증명",  # 이메일 또는 비밀번호가 틀린 경우 예외 발생
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 토큰 생성
    access_token = create_access_token(data={"sub": user["email"]})
    refresh_token = create_refresh_token(data={"sub": user["email"]})
    
    return {"access_token": access_token, "token_type": "bearer"}

# 회원가입 엔드포인트
# @router.post("/signup")
# def signup(user: UserCreate):
#     user_in_db = conn.rag_db.user.find_one({"email": user.email})
#     if user_in_db:
#         raise HTTPException(status_code=400, detail="이미 존재하는 사용자입니다.")  # 이미 등록된 사용자일 경우 예외 발생
    
#     # 비밀번호 해싱 후 MongoDB에 새 사용자 삽입
#     hashed_password = get_password_hash(user.password)
#     new_user = {
#         "email": user.email,
#         "hashed_password": hashed_password,
#         "name": user.name,
#         "nationality": user.nationality,
#         "work_title": user.work_title,
#     }
#     conn.rag_db.user.insert_one(new_user)
#     return {"message": "회원가입 성공"}

# 로그아웃 엔드포인트 (단순 로그아웃 응답)
@router.post("/logout")
def logout():
    return {"message": "로그아웃 성공"}

# 구글 로그인 엔드포인트 (추후 구현)
@router.post("/google-login")
def google_login():
    return {"message": "구글 로그인 성공"}
