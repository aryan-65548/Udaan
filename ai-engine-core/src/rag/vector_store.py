"""
Persistent Chroma DB Vector Store Manager.
Manages dense vector storage and metadata-filtered similarity queries across collections.
"""

import os
import uuid
import yaml
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional

DEFAULT_PERSIST_DIR = "./data/chroma_db"
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../config/engine_config.yaml")


def load_persist_dir_from_config() -> str:
    """Reads Chroma DB persist directory path from config/env if available."""
    env_dir = os.getenv("CHROMA_PERSIST_DIR")
    if env_dir:
        return env_dir

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f)
                return config.get("rag", {}).get("chroma_persist_dir", DEFAULT_PERSIST_DIR)
        except Exception:
            pass

    return DEFAULT_PERSIST_DIR


class ChromaVectorStore:
    """
    Manages persistent Chroma DB collections for RAG grounding datasets.
    """

    def __init__(self, persist_dir: Optional[str] = None):
        self.persist_dir = persist_dir or load_persist_dir_from_config()
        os.makedirs(self.persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )

    def get_or_create_collection(
        self,
        collection_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> chromadb.Collection:
        """
        Gets an existing Chroma collection or creates a new one with Cosine distance.

        Args:
            collection_name: Name of the collection (e.g. 'demographics', 'schemes').
            metadata: Optional collection metadata dict.

        Returns:
            Chroma Collection object.
        """
        default_meta = {"hnsw:space": "cosine"}
        if metadata:
            default_meta.update(metadata)

        return self.client.get_or_create_collection(
            name=collection_name,
            metadata=default_meta
        )

    def add_documents(
        self,
        collection_name: str,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        embeddings: List[List[float]],
        ids: Optional[List[str]] = None
    ) -> List[str]:
        """
        Adds text documents with 768-dim embeddings and metadata to a collection.

        Args:
            collection_name: Target collection name.
            documents: List of text chunk strings.
            metadatas: List of metadata dicts corresponding to each document.
            embeddings: List of 768-dim float vector lists.
            ids: Optional list of document IDs (auto-generated UUIDs if None).

        Returns:
            List of assigned document IDs.
        """
        if not documents or not embeddings or len(documents) != len(embeddings):
            raise ValueError("Documents and embeddings must be non-empty lists of identical length.")

        if len(metadatas) != len(documents):
            raise ValueError("Metadatas list length must match documents length.")

        collection = self.get_or_create_collection(collection_name)

        if ids is None:
            ids = [str(uuid.uuid4()) for _ in range(len(documents))]

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        return ids

    def similarity_search(
        self,
        collection_name: str,
        query_embedding: List[float],
        n_results: int = 5,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs vector similarity search against a collection using a query embedding.

        Args:
            collection_name: Collection to query.
            query_embedding: 768-dim float vector query.
            n_results: Number of top results to return.
            where_filter: Optional Chroma metadata filter dictionary.

        Returns:
            List of result dicts containing id, document, metadata, and distance score.
        """
        collection = self.get_or_create_collection(collection_name)
        count = collection.count()

        if count == 0:
            return []

        limit = min(n_results, count)

        kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": limit,
            "include": ["documents", "metadatas", "distances"]
        }

        if where_filter:
            kwargs["where"] = where_filter

        results = collection.query(**kwargs)

        search_results: List[Dict[str, Any]] = []

        if results and results.get("ids") and len(results["ids"][0]) > 0:
            ids = results["ids"][0]
            docs = results["documents"][0] if results.get("documents") else []
            metas = results["metadatas"][0] if results.get("metadatas") else []
            distances = results["distances"][0] if results.get("distances") else []

            for i in range(len(ids)):
                search_results.append({
                    "id": ids[i],
                    "document": docs[i] if i < len(docs) else "",
                    "metadata": metas[i] if i < len(metas) else {},
                    "distance": float(distances[i]) if i < len(distances) else 0.0,
                    "similarity": round(1.0 - float(distances[i]), 4) if i < len(distances) else 1.0
                })

        return search_results

    def get_collection_count(self, collection_name: str) -> int:
        """Returns the total document count in a collection."""
        collection = self.get_or_create_collection(collection_name)
        return collection.count()

    def delete_collection(self, collection_name: str) -> bool:
        """Deletes a collection by name."""
        try:
            self.client.delete_collection(name=collection_name)
            return True
        except Exception:
            return False
