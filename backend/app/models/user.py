from pydantic import BaseModel, Field
from typing import Optional, List

#임시 예시모델
class UploadedData(BaseModel):
    title: str
    description: str
    audio_url: Optional[str] = None

class User(BaseModel):
    email: str
    password: str #= Field(..., min_length=6, max_length=8)
    password_retype: str  # 비밀번호 확인 필드
    name: str
    nationality: str
    work_title: str
    uploaded_data: List[UploadedData] = []
    photoURL: Optional[str] = None

class UpdateUser(BaseModel):
    email: str
    name: str
    nationality: str
    work_title: str


# 로그인 시 요청되는 정보 (이메일과 비밀번호)
class UserLogin(BaseModel):
    email: str  # 로그인할 때 이메일 필드
    password: str  # 로그인할 때 비밀번호 필드

# 토큰 응답을 위한 스키마 (로그인 후 클라이언트에 반환되는 토큰)
class Token(BaseModel):
    access_token: str  # 액세스 토큰
    token_type: str
    user_info: dict  # 토큰 타입 (보통 "Bearer")

# 토큰에서 추출되는 데이터 스키마
class TokenData(BaseModel):
    email: str | None = None  # 토큰에 포함된 이메일 정보 (없을 수도 있음)

class EmailRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    random_code: str
    new_password: str

class UserMe(BaseModel):
    id: Optional[str]  # 예: 사용자 고유 ID (MongoDB ObjectId를 문자열로 변환하여 사용)
    email: str
    name: str

    # class Config:
    #     orm_mode = True

class UserMe2(BaseModel):
    id: Optional[str]
    email: str
    name: Optional[str] = None
    photoURL: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    connections: Optional[int] = 0
    meetings: Optional[int] = 0
    interests: Optional[List[str]] = []

#임시 예시모델
# class UserDataSchema(BaseModel):
#     title: str
#     description: str
#     audio_url: Optional[str] = None

class Calender(BaseModel):
    year: int
    month: int
    day: int
    title: str
    description: str
    category: str

class UserDataSchema(BaseModel):
    title: str
    description: str
    time: str
    category:str

#프로필
class PhotoUpdate(BaseModel):
    photoURL: str