from pydantic import BaseModel

class AudioModel(BaseModel):
    stt_text: str
    summary: str
