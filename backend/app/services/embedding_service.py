from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-small-en-v1.5")

def embed_documents(chunks: list[str]):
    return model.encode(
        chunks,
        convert_to_numpy=True,
        show_progress_bar=False
    ).tolist()

def embed_query(query: str):
    return model.encode(
        query,
        convert_to_numpy=True
    ).tolist()