import os
from fastapi import APIRouter, UploadFile, File
from faster_whisper import WhisperModel
import shutil
from fastapi import APIRouter, HTTPException
from langchain_openai import AzureChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

from config.db import conn

# 환경 변수 로드
load_dotenv()

# Azure OpenAI 설정
llm = AzureChatOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("OPENAI_API_VERSION"),
    deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    temperature=0,
)


get_llm = APIRouter()

# LLM 초기화
llm = AzureChatOpenAI(deployment_name="gpt-4o", temperature=0)

# 원래 언어로 요약을 위한 프롬프트 템플릿
summary_prompt = PromptTemplate(
    template="""You are an assistant for determining the processing flow based on audio length. When an audio file is uploaded or live streaming, first check the length of the recording. If it contains a single speaker and is approximately 30 seconds or shorter, proceed directly with a simple translation in the requested languages: English, Korean, Chinese, and Japanese.

Conversation:
{text}
Translation in {language} (Do not add any labels like "Summary:", just provide the summary):""",
    input_variables=["text", "language"],
)


# 요약 체인 생성
summary_chain = summary_prompt | llm | StrOutputParser()
# translation_chain = translation_prompt | llm | StrOutputParser()


async def get_summary(stt_text: str, language: str):
    # 원래 언어로 요약 생성
    summary = await summary_chain.ainvoke({"text": stt_text, "language": language})
    print("***** Summary *****", summary)
    return {"summary": summary}
