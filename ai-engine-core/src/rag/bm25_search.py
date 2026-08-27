"""
Sparse Keyword BM25 Search Index Engine.
Provides exact lexical matching over APMC Mandis, Gram Panchayats, Taluka names, and trade jargon.
Supports trilingual tokenization across English, Gujarati, and Hindi.
"""

import os
import re
import pickle
import uuid
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi


def trilingual_tokenize(text: str) -> List[str]:
    """
    Tokenizes text for BM25 indexing across English, Gujarati, and Hindi scripts.
    Normalizes lowercasing, strips punctuation, and splits by whitespace.
    """
    if not text:
        return []

    # Strip punctuation while preserving Indic Unicode character ranges (Gujarati \u0A80-\u0AFF, Devanagari \u0900-\u097F)
    cleaned = re.sub(r"[^\w\s\u0A80-\u0AFF\u0900-\u097F]", " ", text.lower())
    tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 1]
    return tokens


class BM25SearchIndex:
    """
    In-memory BM25 sparse lexical index with metadata filtering and disk serialization.
    """

    def __init__(self):
        self.bm25: Optional[BM25Okapi] = None
        self.documents: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.ids: List[str] = []
        self.corpus_tokens: List[List[str]] = []

    def index_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: Optional[List[str]] = None
    ) -> None:
        """
        Tokenizes and indexes a list of text documents into the BM25 sparse index.

        Args:
            documents: List of text chunk strings.
            metadatas: Corresponding metadata dictionary for each document.
            ids: Optional document ID strings.
        """
        if not documents:
            return

        if len(metadatas) != len(documents):
            raise ValueError("Metadatas list length must match documents length.")

        self.documents = documents
        self.metadatas = metadatas
        self.ids = ids if ids else [str(uuid.uuid4()) for _ in range(len(documents))]

        self.corpus_tokens = [trilingual_tokenize(doc) for doc in documents]
        self.bm25 = BM25Okapi(self.corpus_tokens)

    def search(
        self,
        query: str,
        n_results: int = 5,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs BM25 lexical keyword search against indexed corpus.

        Args:
            query: User search query string.
            n_results: Max number of top results to return.
            where_filter: Optional metadata filtering dictionary (e.g. {'district': 'Anand'}).

        Returns:
            List of result dicts containing id, document, metadata, and BM25 score.
        """
        if not self.bm25 or not self.documents:
            return []

        query_tokens = trilingual_tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)

        # Pair scores with indices and sort descending
        scored_indices = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)

        results: List[Dict[str, Any]] = []

        for idx, score in scored_indices:
            doc_token_set = set(self.corpus_tokens[idx])
            has_overlap = any(t in doc_token_set for t in query_tokens)

            if not has_overlap:
                continue

            metadata = self.metadatas[idx]

            # Apply metadata filter if provided
            if where_filter:
                match = True
                for key, val in where_filter.items():
                    if metadata.get(key) != val:
                        match = False
                        break
                if not match:
                    continue

            results.append({
                "id": self.ids[idx],
                "document": self.documents[idx],
                "metadata": metadata,
                "score": float(score)
            })

            if len(results) >= n_results:
                break

        return results

    def save_index(self, filepath: str) -> None:
        """Serializes the inverted token index and document state to a pickle file."""
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        data = {
            "documents": self.documents,
            "metadatas": self.metadatas,
            "ids": self.ids,
            "corpus_tokens": self.corpus_tokens
        }
        with open(filepath, "wb") as f:
            pickle.dump(data, f)

    def load_index(self, filepath: str) -> None:
        """Loads and reconstructs the BM25 index from a saved pickle file."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"BM25 index file not found at {filepath}")

        with open(filepath, "rb") as f:
            data = pickle.load(f)

        self.documents = data.get("documents", [])
        self.metadatas = data.get("metadatas", [])
        self.ids = data.get("ids", [])
        self.corpus_tokens = data.get("corpus_tokens", [])

        if self.corpus_tokens:
            self.bm25 = BM25Okapi(self.corpus_tokens)
