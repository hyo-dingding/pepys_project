# from fastapi import FastAPI

# app = FastAPI()


from fastapi import FastAPI
from routes.user import user
 
app = FastAPI()
app.include_router(user)
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile, File

import os

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
