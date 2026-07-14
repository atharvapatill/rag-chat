import os
import uuid

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.services.chunk_service import ChunkService
from app.services.pdf_service import extract_text_from_pdf
from app.services.text_cleaner_service import clean_text
from app.services.embedding_service import embed_documents
from app.services.vector_service import add_documents

from app.database.models import File

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def process_pdf(
    upload_file: UploadFile,
    user_id: str,
    db: Session
):
    extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename
    )

    try:
        # Save uploaded PDF temporarily
        with open(file_path, "wb") as file:
            file.write(upload_file.file.read())

        # Extract and clean text
        text = extract_text_from_pdf(file_path)
        text = clean_text(text)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in PDF"
            )

        # Split into chunks
        chunk_service = ChunkService()
        chunks = chunk_service.split_text(text)

        # Generate embeddings
        embeddings = embed_documents(chunks)

        # Generate file id
        file_id = str(uuid.uuid4())

        # Create unique ids for every chunk
        ids = [
            f"{file_id}_{i}"
            for i in range(len(chunks))
        ]

        # Metadata for every chunk
        metadatas = [
            {
                "file_id": file_id,
                "user_id": user_id
            }
            for _ in chunks
        ]

        # Store embeddings in ChromaDB
        add_documents(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )

        # Save file metadata in SQL database
        new_file = File(
            file_id=file_id,
            filename=upload_file.filename,
            user_id=user_id
        )

        db.add(new_file)
        db.commit()
        db.refresh(new_file)

        return {
            "message": "File uploaded successfully.",
            "file_id": file_id,
            "filename": upload_file.filename,
            "chunks": len(chunks)
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to process PDF"
        )

    finally:
        # Delete temporary PDF
        if os.path.exists(file_path):
            os.remove(file_path)