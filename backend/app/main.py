import os
from dotenv import load_dotenv

load_dotenv()  # Must be called before any app imports so env vars are available at module load time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine

from app.database.models import File, User, Base

from app.routes.auth import router as auth_router
from app.routes.files import router as file_router
from app.routes.chat import router as chat_router

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Build allowed origins list — always include localhost fallback
allow_origins = list({frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Set-Cookie"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(file_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"message": "RAG API is running"}