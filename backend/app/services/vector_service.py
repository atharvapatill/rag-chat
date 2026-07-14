import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection("documents")

def add_documents(ids:list[str],documents: list[str],embeddings:list[list[float]],metadatas:list[dict]):
    collection.add(
    ids=ids,
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas
)

def query_documents(query_embedding: list[float], user_id: str):
    return collection.query(
        query_embeddings=[query_embedding],
        where={"user_id": user_id},
        n_results=10
    )
    
def delete_documents(file_id:str):
    collection.delete(
	where={"file_id": file_id}
)
    


