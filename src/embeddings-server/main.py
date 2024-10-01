import os
from fastapi import FastAPI, HTTPException, Request, Body, Header
from starlette.datastructures import Headers
from llama_index.core.text_splitter import TokenTextSplitter
from llama_index.core.readers.file.base import SimpleDirectoryReader
from sentence_transformers import SentenceTransformer
import chromadb
import httpx
import asyncio
from typing import Optional, List, Dict, Any

from config import settings

# Initialize FastAPI app
app = FastAPI()

# Initialize the Hugging Face embedding model
embedding_model = SentenceTransformer(model_name_or_path=settings.embedding_model_name, 
                                      cache_folder=settings.models_dir)
# Initialize the ChromaDB client
client = chromadb.PersistentClient(path=settings.store_dir)


# Helper function to notify app server
async def notify_app_server(agent_name: str) -> None:
    # set the url and headers
    url = f"http://{settings.api_server}:{settings.api_server_port}/api/agents/{agent_name}/update-embeddings-status"
    headers = {settings.header_name: settings.header_key}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url=url, data=None, headers=headers)
            if response.status_code == 200:
                print(f"Successfully notified app-server for agent {agent_name}")
            else:
                print(f"Failed to notify app-server: {response.status_code}")
    except Exception as e:
        print(f"Error notifying app server: {str(e)}")

# To verify api key when called from api-server
def verify_x_api_key(headers: Headers) -> str:
    x_api_key: Optional[str] = headers.get(settings.header_name)
    if x_api_key is None:
        raise HTTPException(status_code=400, detail="X-API-Key header missing")
    if x_api_key != settings.header_key:
        raise HTTPException(status_code=401, detail="Invalid X-API-Key")
    return x_api_key


# function to generate document chunks and save in chromadb
@app.post("/generate")
async def generate_embeddings(request: Request, body: Dict[str, Any] = Body(...)) -> Dict[str, str]:
    try:
        # verify request is from api-server
        verify_x_api_key(headers=request.headers)
        # set agent dir
        agent_name: str = body.get("agent_name")
        agent_dir: str = os.path.join(settings.agents_dir, agent_name)
        
        # check if dir exists
        if not os.path.exists(agent_dir):
            raise HTTPException(status_code=404, detail=f"Directory for agent {agent_name} not found")
        
        # Delete collection in Store if it exists
        collection_name = f"agent_{agent_name}"
        # Get the list of all collections
        all_collections = client.list_collections()
        # Check if the collection exists
        if any(col.name == collection_name for col in all_collections):
            # If the collection exists, delete it
            client.delete_collection(collection_name)
            print(f"Collection '{collection_name}' deleted successfully.")
        else:
            print(f"Collection '{collection_name}' does not exist. No action taken.")

        # check if dir empty
        if os.listdir(agent_dir):  
            # read all documents
            directory_reader = SimpleDirectoryReader(input_dir=agent_dir)
            documents = directory_reader.load_data()

            # split it
            text_splitter = TokenTextSplitter(chunk_size=512, chunk_overlap=50)

            # create chunked documents
            chunked_documents: List[str] = []
            for doc in documents:
                chunks = text_splitter.split_text(doc.text)
                chunked_documents.extend(chunks)

            # create embeddings
            embeddings: List[Any] = []
            for chunk in chunked_documents:
                vector = embedding_model.encode(chunk)
                embeddings.append(vector)

            # create collection
            collection = client.get_or_create_collection(name=collection_name)
            # add embeddings to collection
            for i, chunk in enumerate(chunked_documents):
                document_id = f"doc_chunk_{i}"
                collection.add(
                    documents=[chunk],
                    embeddings=[embeddings[i].tolist()],
                    ids=[document_id]
                )
        else:
            print("no files found in dir")

        asyncio.create_task(notify_app_server(agent_name=agent_name))
        return {"message": f"Embeddings creation initiated for agent {agent_name}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")


# function that returns document chunks based on user prompt
@app.post("/query")
async def query_embeddings(
    request: Request,
    agent_name: str = Body(...),
    prompt: str = Body(...),
    top_k: int = Body(5)
) -> Dict[str, Any]:

    try:
        verify_x_api_key(headers=request.headers)

        prompt_embedding = embedding_model.encode(prompt)
        collection_name = f"agent_{agent_name}"
        collection = client.get_or_create_collection(name=collection_name)

        results = collection.query(
            query_embeddings=[prompt_embedding.tolist()],
            n_results=top_k
        )

        document_chunks = results['documents']
        return {
            "status": "success",
            "agent_name": agent_name,
            "prompt": prompt,
            "results": document_chunks
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query for agent {agent_name}: {str(e)}")