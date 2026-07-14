from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime
import uuid

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    user_id = Column(
        String, 
        primary_key=True, 
        index=True
    )

    email = Column(
        String, 
        unique=True, 
        index=True, 
        nullable=False
    )
    
    password = Column(
        String, 
        nullable=False
    )

    # One user can have many files
    files = relationship("File", back_populates="user")


class File(Base):
    __tablename__ = "files"

    # UUID generated automatically
    file_id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()) #create id in backend
    )

    filename = Column(String, nullable=False)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        String,
        ForeignKey("users.user_id"),
        nullable=False
    )

    # Each file belongs to one user
    user = relationship("User", back_populates="files")