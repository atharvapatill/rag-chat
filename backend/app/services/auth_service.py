import uuid

from fastapi import HTTPException

from app.database.models import User
from app.utils.security import hash_password, verify_password, create_access_token

def register_user(db, user_data):
    try:
        existing = db.query(User).filter(User.email == user_data.email).first()

        if existing:
            raise HTTPException(status_code=409, detail="User already exists")

        new_user = User(
            user_id=str(uuid.uuid4()),
            email=user_data.email,
            password=hash_password(user_data.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "User registered"}

    except HTTPException:
        # let FastAPI handle it normally
        raise

    except Exception as e:
        db.rollback()
        print("ERROR OCCURRED:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

def login_user(db, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": str(user.user_id)}) # "sub" is usally prefered.

    return token

