from pydantic import BaseModel, Field
 
 
class User(BaseModel):
    email: str
    password: str #= Field(..., min_length=6, max_length=8)
    password_retype: str  # 비밀번호 확인 필드
    name: str
    nationality: str
    work_title: str



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
    token_type: str  # 토큰 타입 (보통 "Bearer")

# 토큰에서 추출되는 데이터 스키마
class TokenData(BaseModel):
    email: str | None = None  # 토큰에 포함된 이메일 정보 (없을 수도 있음)

class EmailRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    random_code: str
    new_password: str