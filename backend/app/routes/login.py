from fastapi import APIRouter, Depends, HTTPException, status  # FastAPI의 라우터와 의존성 및 예외 처리
from passlib.context import CryptContext  # 비밀번호 해시와 검증을 위한 passlib 사용
from config.db import conn  # MongoDB의 사용자 컬렉션 사용
from models.user import  UserLogin,Token, TokenData, User ,UserMe,UserDataSchema, PhotoUpdate ,UserMe2, Calender #UserCreate  # 스키마 불러오기
from bson import ObjectId
from datetime import datetime, timedelta, timezone  # 토큰의 만료 시간을 설정하기 위한 모듈
from jose import JWTError, jwt  # JWT 토큰을 생성하고 검증하는 라이브러리
from dotenv import load_dotenv
import os
import re
from fastapi.security import OAuth2PasswordBearer
from typing import List
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

# 로그인 엔드포인트 v2.0
@router.post("/login", response_model=Token)
def login(user_login: UserLogin):
    user = conn.rag_db.user.find_one({"email": user_login.email})
    if not user or not verify_password(user_login.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 자격 증명",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 토큰 생성
    access_token = create_access_token(data={"sub": user["email"]})
    refresh_token = create_refresh_token(data={"sub": user["email"]})

    # 유저와 관련된 데이터 가져오기
    # user_data = [
    #     UserDataSchema(**data) for data in conn.rag_db.user.find({"user_email": user["email"]})
    # ]
    user_data = user.get("uploaded_data", [])

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": {
            "email": user["email"],
            "name": user.get("name"),
            "uploaded_data": user_data
        }
    }

# 자격증명/ 토큰 예외 정의
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 자격 증명 예외 정의
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

# 인증된유저
async def get_current_user(token: str = Depends(oauth2_scheme))-> UserMe:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="유효하지 않은 자격 증명",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print("토큰 검증 중:", token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            print("토큰에서 이메일을 추출할 수 없습니다.")
            raise credentials_exception
        token_data = TokenData(email=email)
        print("디코딩된 이메일:", email)
    except JWTError as e:
        print("JWT 오류 발생:", str(e))
        raise credentials_exception

    # user = conn.rag_db.user.find_one({"email": email})
    user =  conn.rag_db.user.find_one({"email": token_data.email})
    if user is None:
        print("사용자를 찾을 수 없습니다. 이메일:", email)
        raise credentials_exception
    print("인증된 사용자:", user)
    return user

# 캘린더 이벤트
@router.get("/events", response_model=List[Calender])
async def get_user_events(current_user: dict = Depends(get_current_user)):
    # 현재 사용자의 이벤트 데이터만 반환
    # user_email = current_user["email"]
    # events = conn.rag_db.user.find({"user_email": user_email})
    # return list(events)
    user = conn.rag_db.user.find_one({"email": current_user["email"]})

    # 사용자가 없는 경우 빈 리스트 반환
    if not user:
        return []

    # 사용자의 업로드된 데이터를 가져옴 (예: uploaded_data 필드)
    user_data = user.get("uploaded_data", [])
    return user_data

#로그인한 유저의 업데이트 (파일...)
@router.post("/upload-data")
def upload_data(data: UserDataSchema, current_user: User = Depends(get_current_user)):
    update_result = conn.rag_db.user.update_one(
        {"email": current_user["email"]},
        {"$push": {"uploaded_data": data.dict()}}
    )
    # 업데이트 확인
    if update_result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )

    if update_result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이벤트 데이터를 추가하는 데 실패했습니다."
        )
    return {"status": "데이터 업로드 성공"}

#로그인한 유저의 데이터만 가져올수 있도록
@router.get("/my-data", response_model=List[UserDataSchema])
def get_my_data(current_user: User = Depends(get_current_user)):
    user = conn.rag_db.user.find_one({"user_email": current_user["email"]})
    if not user:
        return []

    # 사용자 문서의 uploaded_data 필드에서 데이터를 가져옴
    user_data = user.get("uploaded_data", [])
    return user_data

# 사용자 정보 엔드포인트
@router.get("/me", response_model=UserMe)
async def read_users_me(current_user: User = Depends(get_current_user)):
    current_user_data = current_user.copy()
    current_user_data['id'] = str(current_user_data.pop('_id'))  # '_id'를 'id'로 변경하고 문자열로 변환
    return current_user_data
    #return current_user

# 사용자 프로필 사진 URL 업데이트 엔드포인트
@router.post("/users/{user_id}/photo")
async def update_user_photo(photo_update: PhotoUpdate, current_user: dict = Depends(get_current_user)):

    user_id = current_user["_id"]
    result = conn.rag_db.user.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"photoURL": photo_update.photoURL}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or photo not updated")
    return {"status": "success", "message": "Photo URL updated successfully"}

# 사용자 정보 엔드포인트
@router.get("/users/me", response_model=UserMe2)
async def read_users_me(current_user: User = Depends(get_current_user)):
    current_user_data = current_user.copy()
    current_user_data['id'] = str(current_user_data.pop('_id'))  # '_id'를 'id'로 변경하고 문자열로 변환
    return current_user_data

# 로그아웃 엔드포인트 (단순 로그아웃 응답)
@router.post("/logout")
def logout():
    return {"message": "로그아웃 성공"}

# 구글 로그인 엔드포인트 (추후 구현)
@router.post("/google-login")
def google_login():
    return {"message": "구글 로그인 성공"}
