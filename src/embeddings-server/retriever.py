# chunker.py

import os
from pathlib import Path
from haystack import Pipeline
from haystack.components.embedders import SentenceTransformersDocumentEmbedder
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack_integrations.document_stores.chroma import ChromaDocumentStore
from haystack_integrations.components.retrievers.chroma import ChromaEmbeddingRetriever

from config import settings

def get_chunks(agent_name:str, input: str, model_path: str, store_path: str):

    # set the embedder
    text_embedder = SentenceTransformersTextEmbedder(model=model_path)
    # set the store
    document_store = ChromaDocumentStore(collection_name=f"agent_{agent_name}", persist_path=store_path, distance_function=settings.distance_metric)
    # set the retriever for the store
    retriever = ChromaEmbeddingRetriever(document_store=document_store, top_k=settings.top_n)

    # add components to the pipeline
    querying_pipeline = Pipeline()
    # embedder
    querying_pipeline.add_component("query_embedder", text_embedder)
    querying_pipeline.add_component("retriever", retriever)
    querying_pipeline.connect("query_embedder.embedding", "retriever.query_embedding")
    results = querying_pipeline.run({"query_embedder": {"text": input}})
    chunks = []
    count = 1
    for d in results["retriever"]["documents"]:
        count=count+1
        chunks.append(d.content)

    return chunks
