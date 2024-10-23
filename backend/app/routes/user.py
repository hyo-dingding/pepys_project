from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from models.user import User, UpdateUser, EmailRequest, ResetPasswordRequest
from config.db import conn, mail_conf
from schemas.user import userEntity, usersEntity
from bson import ObjectId
from fastapi_mail import FastMail, MessageSchema
import random
import re
from passlib.hash import bcrypt
from routes.randomnum import get_random_number
# import subprocess
# import requests

from dotenv import load_dotenv
import os

# .env 파일에서 환경 변수 로드
load_dotenv()

user = APIRouter()

# 비밀번호 해시와 검증을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호가 맞는지 검증하는 함수
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 비밀번호를 해시하는 함수
def get_password_hash(password):
    return pwd_context.hash(password)

# 모든 사용자 조회 
@user.get("/user")
async def find_all_users():
    print(conn.rag_db.user.find())
    print(usersEntity(conn.rag_db.user.find()))
    return usersEntity(conn.rag_db.user.find())

# email를 통한 사용자 조회
@user.get("/find-id/{email}")
async def find_user_id(email: str):
    user_data = conn.rag_db.user.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 사용자 이메일을 기반으로 사용자 ID 반환
    return userEntity(user_data)
 
# 특정 사용자 조회
@user.get("/user/{id}")
async def find_one_user(id):
    user_data = conn.rag_db.user.find_one({"_id": ObjectId(id)})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return userEntity(user_data)
 
# 사용자 생성 (회원가입)
@user.post("/user")
async def create_users(user: User):
    # 이메일 중복 확인
    if conn.rag_db.user.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # 비밀번호 유효성 검사 (영어 소문자와 숫자 포함, 6~8자리)
    if not re.match("^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{6,8}$", user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be 6-8 characters long, and include both letters and numbers"
        )
    # 비밀번호와 비밀번호 확인 일치 여부 확인
    if user.password != user.password_retype:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # 비밀번호 암호화
    hashed_password = get_password_hash(user.password)

    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,
        "name": user.name,
        "nationality": user.nationality,
        "work_title": user.work_title
    }
    
    # conn.rag_db.user.insert_one(dict(user))
    # conn.rag_db.user.insert_one(user_data)
    # return usersEntity(conn.rag_db.user.find())
    # 사용자 정보 삽입
    inserted_user = conn.rag_db.user.insert_one(user_data)

    # 방금 삽입된 사용자 정보 가져오기
    new_user = conn.rag_db.user.find_one({"_id": inserted_user.inserted_id})

    # ObjectId를 문자열로 변환
    new_user["_id"] = str(new_user["_id"])

    # 마지막으로 추가된 사용자만 반환
    return usersEntity([new_user])

# 사용자 정보 수정
@user.put("/user/{id}")
async def update_users(id, user: UpdateUser):
    conn.rag_db.user.find_one_and_update({"_id":ObjectId(id)}, {"$set":dict(user)})
    return userEntity(conn.rag_db.user.find_one({"_id":ObjectId(id)}))
   
# 사용자 계정 삭제
@user.delete("/user/{id}")
async def delete_users(id):
    return userEntity(conn.rag_db.user.find_one_and_delete({"_id":ObjectId(id)}))

# 1. 이메일 주소 입력 -> 랜덤 비밀번호 전송
@user.post("/forgot-password/")
async def send_reset_code(email_request: EmailRequest):
    email = email_request.email

    # 데이터베이스에서 해당 이메일을 가진 사용자 검색
    user_data = conn.rag_db.user.find_one({"email": email})
    
    if user_data is None:
        raise HTTPException(status_code=404, detail="User not found")

    # 랜덤 코드 생성
    # random_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    random_code_response = await get_random_number(length=6)  # 6자리 랜덤 코드 생성
    random_code = random_code_response["random_number"]
    
    # MongoDB에 랜덤 코드 업데이트
    conn.rag_db.user.update_one(
        {"_id": user_data["_id"]},
        {"$set": {"reset_code": random_code}}
    )
    
    # 이메일 전송
    message = MessageSchema(
        subject="비밀번호 재설정 코드",
        recipients=[email],
        body=f"비밀번호 재설정을 위한 코드는 {random_code}입니다.",
        subtype="plain"
    )

    fm = FastMail(mail_conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이메일 전송 실패: {str(e)}")
    
    return {"message": "비밀번호 재설정 코드가 이메일로 전송되었습니다."}

# 2. 랜덤 코드 입력 -> 비밀번호 재설정
@user.post("/reset-password/")
async def reset_password(request: ResetPasswordRequest):
    email, random_code, new_password = request.email, request.random_code, request.new_password

    # 데이터베이스에서 해당 이메일을 가진 사용자 검색
    user_data = conn.rag_db.user.find_one({"email": email})
    if user_data is None or user_data.get("reset_code") != random_code:
        raise HTTPException(status_code=400, detail="잘못된 이메일 또는 인증 코드입니다.")
    
    # 비밀번호 해싱
    hashed_password = get_password_hash(new_password)

    # 새 비밀번호 업데이트 및 reset_code 삭제
    conn.rag_db.user.update_one(
        {"_id": user_data["_id"]},
        {"$set": {"hashed_password": hashed_password, "reset_code": None}}
    )

    return {"message": "비밀번호가 성공적으로 재설정되었습니다."}