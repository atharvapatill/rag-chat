from fastapi import (APIRouter, Depends, HTTPException, Request, Response)
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import User
from app.schemas.user import UserCredentials
from app.services.auth_service import (register_user, login_user)
from app.utils.security import verify_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# ----------------------------
# Register
# ----------------------------
@router.post("/register")
def register(user: UserCredentials, db: Session = Depends(get_db)):

    return register_user(db, user)


# ----------------------------
# Login
# ----------------------------
@router.post("/login")
def login(user: UserCredentials, response: Response, db: Session = Depends(get_db)):

    token = login_user(
        db,
        user.email,
        user.password
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,      # True in production
        samesite="lax"
    )

    return {
        "message": "Login successful"
    }


# ----------------------------
# Current User Dependency
# ----------------------------
def get_current_user(request: Request, db: Session = Depends(get_db)):

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# ----------------------------
# Protected Route
# ----------------------------
@router.get("/protected")
def protected(current_user: User = Depends(get_current_user)):

    return {
        "message": "You are authenticated",
        "user": {
            "user_id": current_user.user_id,
            "email": current_user.email
        }
    }


# ----------------------------
# Get Logged-in User
# ----------------------------
@router.get("/me")
def me(current_user: User = Depends(get_current_user)):

    return {
        "user_id": current_user.user_id,
        "email": current_user.email
    }


# ----------------------------
# Logout
# ----------------------------
@router.post("/logout")
def logout(response: Response):

    response.delete_cookie(
        key="access_token"
    )

    return {
        "message": "Logged out successfully"
    }