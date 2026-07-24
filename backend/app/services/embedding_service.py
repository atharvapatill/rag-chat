import os
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-small-en-v1.5"

def _load_model() -> SentenceTransformer:
    """
    Load the embedding model.
    - First tries local cache only (no network) — works even when HuggingFace is unreachable.
    - Falls back to downloading if not cached yet.
    """
    try:
        return SentenceTransformer(MODEL_NAME, local_files_only=True)
    except Exception:
        # Model not cached yet — download it (happens only on first run)
        print(f"[embedding] Cached model not found, downloading {MODEL_NAME}...")
        return SentenceTransformer(MODEL_NAME, local_files_only=False)

model = _load_model()

def embed_documents(chunks: list[str]) -> list:
    return model.encode(
        chunks,
        convert_to_numpy=True,
        show_progress_bar=False
    ).tolist()

def embed_query(query: str) -> list:
    return model.encode(
        query,
        convert_to_numpy=True
    ).tolist()