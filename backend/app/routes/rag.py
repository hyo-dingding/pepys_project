# import os
# from fastapi import APIRouter, File, UploadFile, HTTPException
# from langchain_community.document_loaders import PyMuPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_community.vectorstores import FAISS
# from langchain_huggingface import HuggingFaceEmbeddings

# from dotenv import load_dotenv
# from faster_whisper import WhisperModel
# import shutil
# from config.db import conn
# from typing import List, Dict, Any

# import pathlib

# load_dotenv()
# rag = APIRouter()
# os.environ["KMP_DUPLICATE_LIB_OK"] = "True"

# multilingual_model = "sentence-transformers/LaBSE"

# # RAG PDF 문서 업로드 및 벡터 DB 생성
# @rag.post("/upload-rag-document")
# async def upload_rag(file: UploadFile = File(...)):
#     try:
#         base_dir = "../running_rag"
#         # file_path = "../running_rag/{file.filename}"
#         os.makedirs(base_dir, exist_ok=True)
#         # 파일 경로 설정
#         file_location = os.path.join(base_dir, file.filename)
#         # file_location = os.path.join(file_path, file.filename)

#         # 파일저장
#         with open(file_location, "wb+") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         print(f"파일이 저장된 위치: {file_location}")

#         try:
#             # RAG 모델 학습 및 벡터 생성
#             embeddings = HuggingFaceEmbeddings(model_name=multilingual_model)
#             text_splitter = RecursiveCharacterTextSplitter(
#                 chunk_size=1000,
#                 chunk_overlap=50
#             )
#             print("embeddings", embeddings)
#             print("text_splitter", text_splitter)
#             print("임베딩 모델 로드 완료")

#             # 문서 내용을 벡터 DB에 저장

#             loader = PyMuPDFLoader(file_location) # pdf 파일 로드
#             documents = loader.load()  # PDF 파일의 경우
#             print(f"문서 로드 완료: {len(documents)} 페이지")

#             # 문서 분할
#             split_docs = text_splitter.split_documents(documents)
#             print(f"문서 분할 완료: {len(split_docs)} 청크")

#             # 몽고DB에 벡터 데이터 저장
#             for i, doc in enumerate(split_docs):
#                 # 텍스트를 벡터로 변환
#                 doc_embedding = embeddings.embed_query(doc.page_content)

#                 # 몽고DB에 저장
#                 mongo_doc = {
#                     "filename": file.filename,
#                     "chunk_index": i,
#                     "page_content": doc.page_content,
#                     "embedding": doc_embedding,
#                     "metadata": doc.metadata
#                 }

#                 conn.rag_db.rag_data.insert_one(mongo_doc)

#             print("몽고DB 저장 완료")

#             # 임시 파일 삭제
#             os.remove(file_location)

#             return {
#                 "status": "RAG document uploaded and vector DB created.",
#                 "chunks_processed": len(split_docs)
#             }

#         except Exception as e:
#             print(f"처리 중 에러 발생: {str(e)}")
#             # 에러 발생 시 임시 파일 삭제
#             if os.path.exists(file_location):
#                 os.remove(file_location)
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"문서 처리 중 에러 발생: {str(e)}"
#             )

#     except Exception as e:
#         print(f"에러 발생: {e}")
#         raise HTTPException(
#             status_code=500, detail=f"파일 업로드 중 에러 발생: {str(e)}"
#         )

#########################2
# import os
# from fastapi import APIRouter, File, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from langchain_community.document_loaders import PyMuPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_community.vectorstores import FAISS
# from langchain_huggingface import HuggingFaceEmbeddings
# import shutil
# from config.db import conn
# from typing import List, Dict, Any

# import sys

# rag = APIRouter()
# os.environ["KMP_DUPLICATE_LIB_OK"] = "True"


# def debug_print(message: str):
#     """디버그 메시지 출력 함수"""
#     print(f"[DEBUG] {message}")
#     sys.stdout.flush()  # 즉시 출력을 위한 버퍼 플러시


# # 파일 크기 제한 설정
# MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


# # 파일 크기 체크 함수 추가
# async def check_file_size(file: UploadFile):
#     file_size = 0
#     content = await file.read()
#     file_size = len(content)
#     await file.seek(0)  # 파일 포인터를 다시 처음으로

#     if file_size > MAX_FILE_SIZE:
#         raise HTTPException(
#             status_code=413,
#             detail=f"File size ({file_size} bytes) exceeds maximum allowed size ({MAX_FILE_SIZE} bytes)",
#         )
#     return content


# # 임베딩 모델 초기화 함수
# def initialize_embeddings(model_name: str = "sentence-transformers/LaBSE"):
#     try:
#         debug_print("3. 임베딩 모델 초기화 시작")
#         embeddings = HuggingFaceEmbeddings(model_name=model_name)
#         print("임베딩 모델 초기화 완료")
#         return embeddings
#     except Exception as e:
#         print(f"임베딩 모델 초기화 실패: {str(e)}")
#         raise Exception(f"임베딩 모델 초기화 실패: {str(e)}")


# # PDF 문서 로드 및 분할 함수
# def load_and_split_document(file_path: str) -> List[Any]:
#     try:
#         # PDF 로더 초기화 및 문서 로드
#         debug_print("4. PDF 로드 시작")
#         loader = PyMuPDFLoader(file_path)
#         documents = loader.load()
#         print(f"문서 로드 완료: {len(documents)} 페이지")

#         # 문서 분할
#         text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1000, chunk_overlap=50
#         )
#         split_docs = text_splitter.split_documents(documents)
#         print(f"문서 분할 완료: {len(split_docs)} 청크")

#         return split_docs
#     except Exception as e:
#         print(f"문서 로드/분할 실패: {str(e)}")
#         raise Exception(f"문서 로드/분할 실패: {str(e)}")


# # 벡터 DB 생성 함수
# def create_vector_db(split_docs: List[Any], embeddings: Any) -> Any:
#     try:
#         vectorstore = FAISS.from_documents(documents=split_docs, embedding=embeddings)
#         print("벡터 DB 생성 완료")
#         return vectorstore
#     except Exception as e:
#         print(f"벡터 DB 생성 실패: {str(e)}")
#         raise Exception(f"벡터 DB 생성 실패: {str(e)}")


# # 몽고DB 저장 함수
# def save_to_mongodb(split_docs: List[Any], embeddings: Any, filename: str):
#     try:
#         for i, doc in enumerate(split_docs):
#             doc_embedding = embeddings.embed_query(doc.page_content)
#             mongo_doc = {
#                 "filename": filename,
#                 "chunk_index": i,
#                 "page_content": doc.page_content,
#                 "embedding": doc_embedding,
#                 "metadata": doc.metadata,
#             }
#             conn.rag_db.rag_data.insert_one(mongo_doc)
#         print("몽고DB 저장 완료")
#     except Exception as e:
#         print(f"몽고DB 저장 실패: {str(e)}")
#         raise Exception(f"몽고DB 저장 실패: {str(e)}")


# # 파일 저장 함수
# def save_upload_file(file: UploadFile) -> str:
#     try:
#         # 업로드 디렉토리 생성
#         base_dir = "../running_rag"  # 상대 경로 대신 현재 디렉토리 기준으로 변경
#         os.makedirs(base_dir, exist_ok=True)

#         # 파일 경로 설정
#         file_location = os.path.join(base_dir, file.filename)

#         # 파일 저장
#         with open(file_location, "wb+") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         print(f"파일 저장 완료: {file_location}")
#         return file_location
#     except Exception as e:
#         print(f"파일 저장 실패: {str(e)}")
#         raise Exception(f"파일 저장 실패: {str(e)}")


# # 메인 엔드포인트
# @rag.post("/upload-rag-document")
# async def upload_rag(file: UploadFile = File(...)):
#     file_location = None
#     try:
#         # 1. 파일 저장
#         # 파일 크기 체크
#         await check_file_size(file)

#         file_location = save_upload_file(file)
#         print(f"파일이 저장된 위치: {file_location}")

#         # 2. 임베딩 모델 초기화
#         embeddings = initialize_embeddings()
#         print("임베딩완료")

#         # 3. 문서 로드 및 분할
#         split_docs = load_and_split_document(file_location)

#         # 4. 벡터 DB 생성
#         vectorstore = create_vector_db(split_docs, embeddings)

#         # 5. 몽고DB 저장
#         save_to_mongodb(split_docs, embeddings, file.filename)

#         # 6. 임시 파일 삭제
#         if file_location and os.path.exists(file_location):
#             os.remove(file_location)
#             print("임시 파일 삭제 완료")

#         return JSONResponse(
#             status_code=200,
#             content={
#                 "status": "success",
#                 "message": "RAG document uploaded and vector DB created.",
#                 "chunks_processed": len(split_docs),
#             },
#         )
#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         print(f"처리 중 에러 발생: {str(e)}")
#         # 임시 파일 정리
#         if file_location and os.path.exists(file_location):
#             os.remove(file_location)

#         return JSONResponse(
#             status_code=500, content={"status": "error", "detail": str(e)}
#         )


##############3 테스트

import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import sys

# 프로젝트 루트 디렉토리를 Python 경로에 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
if project_root not in sys.path:
    sys.path.append(project_root)

from config.db import conn
from dotenv import load_dotenv

load_dotenv()
# rag = APIRouter()
os.environ["KMP_DUPLICATE_LIB_OK"] = "True"

def test_pdf_processing():
    try:
        print("=== PDF 처리 테스트 시작 ===")

        # 1. 파일 경로 설정
        pdf_path = "../../running_rag/EO Brochuse(ENG)_compressed 1.pdf"
        if not os.path.exists(pdf_path):
            raise Exception(f"파일을 찾을 수 없습니다: {pdf_path}")
        print(f"파일 확인 완료: {pdf_path}")

        # 2. 임베딩 모델 초기화
        print("임베딩 모델 초기화 시작...")
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/LaBSE")
        print("임베딩 모델 초기화 완료")

        # 3. PDF 문서 로드
        print("PDF 로드 시작...")
        loader = PyMuPDFLoader(pdf_path)
        documents = loader.load()
        print(f"PDF 로드 완료: {len(documents)} 페이지")

        # 4. 문서 분할
        print("문서 분할 시작...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=50
        )
        split_docs = text_splitter.split_documents(documents)
        print(f"문서 분할 완료: {len(split_docs)} 청크")

        # 5. 벡터화 및 MongoDB 저장
        print("벡터화 및 MongoDB 저장 시작...")
        saved_count = 0
        
        for i, doc in enumerate(split_docs):
            try:
                # 벡터화
                doc_embedding = embeddings.embed_query(doc.page_content)
                
                # MongoDB에 저장
                mongo_doc = {
                    "filename": "EO Brochuse(ENG)_compressed 1.pdf",
                    "chunk_index": i,
                    "page_content": doc.page_content,
                    "embedding": doc_embedding,
                    "metadata": doc.metadata
                }
                
                result = conn.rag_db.rag_data.insert_one(mongo_doc)
                if result.inserted_id:
                    saved_count += 1
                    if saved_count % 5 == 0:  # 5개마다 진행상황 출력
                        print(f"진행 상황: {saved_count}/{len(split_docs)} 청크 처리됨")
                
            except Exception as e:
                print(f"청크 {i} 처리 중 에러: {str(e)}")
                continue

        print("=== 처리 완료 ===")
        print(f"총 처리된 청크: {len(split_docs)}")
        print(f"MongoDB 컬렉션 크기: {conn.rag_db.rag_data.count_documents({})}")

    except Exception as e:
        print(f"에러 발생: {str(e)}")
        raise e


if __name__ == "__main__":
    test_pdf_processing()
