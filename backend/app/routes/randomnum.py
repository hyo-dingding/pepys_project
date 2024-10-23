from fastapi import APIRouter
import random

randomnum = APIRouter()

@randomnum.get("/random-number/")
async def get_random_number(length: int = None):
    # 쿼리 파라미터가 없을 경우, 4~6 사이의 랜덤 값을 설정
    if length is None:
        length = random.randint(4, 6)
    
    if length < 4 or length > 6:
        return {"error": "Length must be between 4 and 6"}

    random_number = ''.join([str(random.randint(0, 9)) for _ in range(length)])
    return {"random_number": random_number}