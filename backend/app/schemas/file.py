from pydantic import BaseModel
from datetime import datetime


class FileCreate(BaseModel):
    filename: str
    content_type: str

class FileResponse(BaseModel):
    id: int
    filename: str
    file_url: str
    content_type: str
    size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True