from fastapi import FastAPI, HTTPException, Request, Body
from starlette.datastructures import Headers
from typing import List, Optional
import os
import httpx
import asyncio
from typing import Optional, List, Dict, Any
import chromadb
from sentence_transformers import SentenceTransformer

from config import settings
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter, TokenTextSplitter

# Initialize FastAPI
app = FastAPI()

# Helper function to notify app server
async def notify_api_server(agent_name: str) -> None:
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

# define model_path
model_path = os.path.join(settings.models_dir, settings.embedding_model_name)

# Initialize the embedding_model
embedding_model = SentenceTransformer(model_name_or_path=model_path, local_files_only=True)

# Initialize the ChromaDB client
client = chromadb.PersistentClient(path=settings.store_dir)

# 1. Route to generate chunks and save them in the vector store
@app.post("/generate")
async def generate(
    request: Request, 
    body: Dict[str, Any] = Body(...)
    ) -> Dict[str, str]:

    # verify request is from api-server
    verify_x_api_key(headers=request.headers)
    
    # set agent dir
    agent_name: str = body.get("agent_name")
    agent_dir: str = os.path.join(settings.agents_dir, agent_name)

    # check dir existance
    if not os.path.exists(agent_dir):
        raise HTTPException(status_code=404, detail="Agent directory not found")

    # set collection name
    collection_name = f"agent_{agent_name}"

    # Delete collection in Store if it exists
    collection_name = f"agent_{agent_name}"
    # Get the list of all collections
    all_collections = client.list_collections()
    # Check if the collection exists
    if any(col.name == collection_name for col in all_collections):
        # If the collection exists, delete it
        client.delete_collection(collection_name)
        if settings.DEBUG:
            print(f"Collection '{collection_name}' deleted successfully.")
    else:
        if settings.DEBUG:
            print(f"Collection '{collection_name}' does not exist. No action taken.")

    # Create a new collection for the agent with the embedding function
    collection = client.get_or_create_collection(collection_name)

    # Read all files in the agent's directory
    directory_reader = SimpleDirectoryReader(input_dir=agent_dir, required_exts=settings.file_types)
    documents = directory_reader.load_data()

    # create chunked documents
    chunked_documents: List[str] = []
    for doc in documents:
        # for future assume chunk strategy can be per document
        # hence inside loop
        # set the parser
        node_parser = None
        if settings.chunk_strategy == "fixed":
            node_parser = TokenTextSplitter(chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap)
        else:
            # by default "sentence"
            node_parser = SentenceSplitter(chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap)

        chunks = node_parser.split_text(doc.text)
        # append it to chunked documents
        chunked_documents.extend(chunks)
    
    # create embeddings
    embeddings: List[Any] = []
    for chunk in chunked_documents:
        vector = embedding_model.encode(chunk)
        embeddings.append(vector)

    # add embeddings to collection
    for i, chunk in enumerate(chunked_documents):
        document_id = f"doc_chunk_{i}"
        collection.add(
            documents=[chunk],
            embeddings=[embeddings[i].tolist()],
            ids=[document_id]
        )


    # notify api server
    asyncio.create_task(notify_api_server(agent_name=agent_name))

    # return message
    return {"status": "Chunks generated and saved in vector store", "chunks_count": len(chunked_documents)}

# 2. Route to query the vector store based on input query and agent
@app.post("/query")
async def query(
    request: Request,
    agent_name: str = Body(...), 
    prompt: str  = Body(...)
    ):

    # verify headers
    verify_x_api_key(headers=request.headers)

    prompt_embedding = embedding_model.encode(prompt)

    # set collection name
    collection_name = f"agent_{agent_name}"

    # Retrieve the collection for the agent
    collection = client.get_or_create_collection(collection_name)
    # query the collection
    results = collection.query(
        query_embeddings=[prompt_embedding.tolist()],
        n_results=settings.top_k
    )
    # get docs from the result
    document_chunks = results['documents']
    return {
            "status": "success",
            "agent_name": agent_name,
            "prompt": prompt,
            "results": document_chunks
    }

@app.get("/health")
async def health_check():
    return {"status": "OK"}