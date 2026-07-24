from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as UploadFileParam
from sqlalchemy.orm import Session

from app.services.file_service import process_pdf
from app.database.db import get_db
from app.database.models import User, File
from app.routes.auth import get_current_user
from app.services.vector_service import delete_documents

router = APIRouter(prefix="/files", tags=["Files"])


# ----------------------------
# Upload PDF
# ----------------------------
@router.post("/upload")
def upload_pdf(
    file: UploadFile = UploadFileParam(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    return process_pdf(
        file,
        user_id=current_user.user_id,
        db=db
    )


# ----------------------------
# Delete File (SQL + Vector DB)
# ----------------------------
@router.delete("/{file_id}")
def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # 1. Verify file belongs to user
    file_obj = db.query(File).filter(
        File.file_id == file_id,
        File.user_id == current_user.user_id
    ).first()

    if not file_obj:
        raise HTTPException(status_code=404, detail="File not found")

    # 2. Delete from ChromaDB
    delete_documents(file_id)

    # 3. Delete from SQL database
    db.delete(file_obj)
    db.commit()

    return {
        "message": "File deleted successfully",
        "file_id": file_id
    }


# ----------------------------
# Get All User Files
# ----------------------------
@router.get("/")
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(
        File.user_id == current_user.user_id
    ).order_by(File.uploaded_at.desc()).all()

    return [
        {
            "file_id": f.file_id,
            "filename": f.filename,
            "uploaded_at": f.uploaded_at
        }
        for f in files
    ]