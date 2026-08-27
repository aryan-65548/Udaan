"""
Hybrid RAG Retriever Subsystem.
Combines Dense Vector Search (Chroma DB) and Sparse Lexical Search (BM25)
using Reciprocal Rank Fusion (RRF: k=60) and FlashRank cross-encoder reranking down to Top-5 verified grounding chunks.
"""

from typing import List, Dict, Any, Optional
from src.rag.embedder import MultilingualEmbedder
from src.rag.vector_store import ChromaVectorStore
from src.rag.bm25_search import BM25SearchIndex

try:
    from flashrank import Ranker, RerankRequest
    HAS_FLASHRANK = True
except ImportError:
    HAS_FLASHRANK = False


def reciprocal_rank_fusion(
    dense_results: List[Dict[str, Any]],
    sparse_results: List[Dict[str, Any]],
    k: int = 60
) -> List[Dict[str, Any]]:
    """
    Combines dense and sparse search rankings using Reciprocal Rank Fusion (RRF).

    Formula:
    RRF_Score(d) = sum(1.0 / (k + rank)) across dense and sparse result lists.

    Args:
        dense_results: Top candidate dicts from Chroma DB vector search.
        sparse_results: Top candidate dicts from BM25 sparse keyword search.
        k: Smoothing constant (default k=60).

    Returns:
        List of fused candidate dicts sorted descending by rrf_score.
    """
    rrf_scores: Dict[str, float] = {}
    doc_map: Dict[str, Dict[str, Any]] = {}

    # Process Dense Results (1-indexed rank)
    for rank, doc in enumerate(dense_results, start=1):
        doc_id = doc.get("id") or doc.get("document", f"dense_{rank}")
        doc_map[doc_id] = doc
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    # Process Sparse Results (1-indexed rank)
    for rank, doc in enumerate(sparse_results, start=1):
        doc_id = doc.get("id") or doc.get("document", f"sparse_{rank}")
        if doc_id not in doc_map:
            doc_map[doc_id] = doc
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    # Sort candidates by combined RRF score descending
    sorted_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)

    fused_results: List[Dict[str, Any]] = []
    for doc_id in sorted_ids:
        item = dict(doc_map[doc_id])
        item["rrf_score"] = round(rrf_scores[doc_id], 6)
        fused_results.append(item)

    return fused_results


class HybridRetriever:
    """
    Hybrid RAG Retriever integrating dense vector search, BM25 sparse search, RRF fusion, and FlashRank cross-encoder reranking.
    """

    def __init__(
        self,
        embedder: Optional[MultilingualEmbedder] = None,
        vector_store: Optional[ChromaVectorStore] = None,
        bm25_index: Optional[BM25SearchIndex] = None
    ):
        self.embedder = embedder or MultilingualEmbedder()
        self.vector_store = vector_store or ChromaVectorStore()
        self.bm25_index = bm25_index or BM25SearchIndex()
        self._ranker: Optional[Any] = None

    @property
    def ranker(self) -> Optional[Any]:
        """Lazy-loads FlashRank cross-encoder Ranker instance on first call."""
        if self._ranker is None and HAS_FLASHRANK:
            try:
                # Lightweight FlashRank cross-encoder model
                self._ranker = Ranker(model_name="ms-marco-TinyBERT-L-2-v2", cache_dir="./data/flashrank_cache")
            except Exception:
                self._ranker = None
        return self._ranker

    def flashrank_rerank(
        self,
        query: str,
        candidate_chunks: List[Dict[str, Any]],
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Reranks candidate chunks using FlashRank cross-encoder.
        Falls back to RRF ranking if FlashRank is unavailable or encounters errors.
        """
        if not candidate_chunks:
            return []

        if not self.ranker:
            # Fallback to top_n candidate chunks by RRF score
            return candidate_chunks[:top_n]

        try:
            passages = [
                {"id": doc.get("id", str(i)), "text": doc.get("document", ""), "meta": doc.get("metadata", {})}
                for i, doc in enumerate(candidate_chunks)
            ]

            rerank_req = RerankRequest(query=query, passages=passages)
            reranked_passages = self.ranker.rerank(rerank_req)

            reranked_results: List[Dict[str, Any]] = []
            for r in reranked_passages[:top_n]:
                reranked_results.append({
                    "id": r.get("id"),
                    "document": r.get("text"),
                    "metadata": r.get("meta"),
                    "rerank_score": round(float(r.get("score", 0.0)), 4)
                })

            return reranked_results
        except Exception:
            return candidate_chunks[:top_n]

    def retrieve_grounding_context(
        self,
        query: str,
        collection_name: str = "schemes_collection",
        district: Optional[str] = None,
        taluka: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Executes end-to-end hybrid RAG retrieval pipeline:
        1. Dense Vector Search (Chroma DB) -> Top-20 candidates
        2. Sparse Lexical Search (BM25) -> Top-20 candidates
        3. Reciprocal Rank Fusion (RRF: k=60) -> Top-20 fused candidate list
        4. FlashRank Cross-Encoder Reranking -> Top-5 grounding context chunks

        Args:
            query: User prompt or query string.
            collection_name: Target Chroma collection name.
            district: Optional district filter string.
            taluka: Optional taluka filter string.
            top_k: Final number of verified grounding chunks to return (default top_k=5).

        Returns:
            List of Top-5 reranked grounding context chunk dicts.
        """
        if not query or not query.strip():
            return []

        where_filter: Optional[Dict[str, Any]] = None
        if district:
            where_filter = {"district": district}

        # 1. Dense Vector Search (Top-20 candidates)
        query_embedding = self.embedder.embed_text(query)
        dense_candidates = self.vector_store.similarity_search(
            collection_name=collection_name,
            query_embedding=query_embedding,
            n_results=20,
            where_filter=where_filter
        )

        # 2. Sparse BM25 Keyword Search (Top-20 candidates)
        sparse_candidates = self.bm25_index.search(
            query=query,
            n_results=20,
            where_filter=where_filter
        )

        # 3. Reciprocal Rank Fusion (k=60)
        fused_candidates = reciprocal_rank_fusion(
            dense_results=dense_candidates,
            sparse_results=sparse_candidates,
            k=60
        )

        if not fused_candidates:
            return []

        # 4. FlashRank Cross-Encoder Reranking down to Top-K verified chunks
        final_grounding_chunks = self.flashrank_rerank(
            query=query,
            candidate_chunks=fused_candidates,
            top_n=top_k
        )

        return final_grounding_chunks
