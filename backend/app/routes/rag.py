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
