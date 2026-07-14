import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from fastapi import FastAPI,Depends
from sqlalchemy import inspect
from app.database.db import engine,get_db

from app.database.models import File, User
from sqlalchemy.orm import Session
from app.routes.auth import router as auth_router
from app.routes.files import router as file_router
from app.routes.chat import router as chat_router

from app.database.models import Base

load_dotenv()  # loads .env automatically

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(file_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"message": "RAG API is running"}


@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "Database connected"}


@app.get("/columns")
def get_columns():
    inspector = inspect(engine)

    return {
        "users": [col["name"] for col in inspector.get_columns("users")],
        "files": [col["name"] for col in inspector.get_columns("files")]
    }

@app.get("/getUserData")
def getUserData(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/getFilesData")
def getUserData(db: Session = Depends(get_db)):
    users = db.query(File).all()
    return users