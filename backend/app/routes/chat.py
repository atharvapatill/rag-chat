from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.chat import ChatRequest
from app.services.embedding_service import embed_query
from app.services.vector_service import query_documents
from app.services.llm_service import generate_answer
from app.database.db import get_db
from app.database.models import User
from app.routes.auth import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/query")
def chat_query(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Extract request data
    query = request.query
    history = request.history or []

    # Keep only last 4 messages
    context_history = history[-4:]

    # Build retrieval query
    improved_query = query

    if context_history:
        improved_query = f"""
User Question:
{query}

Recent Conversation:
{chr(10).join(context_history)}
"""

    # Create embedding
    query_embedding = embed_query(improved_query)

    # Search user documents only
    results = query_documents(
        query_embedding=query_embedding,
        user_id=current_user.user_id
    )

    documents = results.get("documents", [])

    if documents:
        documents = documents[0]
    else:
        documents = []

    # Limit retrieved chunks
    documents = documents[:5]

    # Generate answer
    answer = generate_answer(
        query=query,
        context=documents
    )

    return {
        "answer": answer
    }