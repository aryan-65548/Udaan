"""
Unit tests for the Hybrid RAG Retriever subsystem.
Verifies Reciprocal Rank Fusion (RRF k=60), FlashRank reranking, and end-to-end hybrid context retrieval.
"""

import shutil
import tempfile
import pytest
from src.rag.embedder import MultilingualEmbedder
from src.rag.vector_store import ChromaVectorStore
from src.rag.bm25_search import BM25SearchIndex
from src.rag.ingest_pipeline import DataGovInClient, KnowledgeIngestionPipeline
from src.rag.hybrid_retriever import HybridRetriever, reciprocal_rank_fusion


def test_reciprocal_rank_fusion_math():
    """Verifies RRF formula scoring: RRF_Score = 1.0 / (k + rank_dense) + 1.0 / (k + rank_sparse)."""
    dense_results = [
        {"id": "doc_A", "document": "Doc A Text"},
        {"id": "doc_B", "document": "Doc B Text"}
    ]
    sparse_results = [
        {"id": "doc_B", "document": "Doc B Text"},
        {"id": "doc_C", "document": "Doc C Text"}
    ]

    fused = reciprocal_rank_fusion(dense_results, sparse_results, k=60)

    # doc_B is rank 2 in dense and rank 1 in sparse -> score = 1/(60+2) + 1/(60+1) = 1/62 + 1/61 = 0.016129 + 0.016393 = 0.032522
    # doc_A is rank 1 in dense -> score = 1/(60+1) = 0.016393
    # doc_C is rank 2 in sparse -> score = 1/(60+2) = 0.016129

    assert len(fused) == 3
    assert fused[0]["id"] == "doc_B"  # Highest combined RRF score
    assert fused[0]["rrf_score"] == pytest.approx(0.032522, abs=1e-4)


@pytest.fixture(scope="module")
def hybrid_rag_setup():
    """Module-level fixture to create indexed test RAG store."""
    temp_dir = tempfile.mkdtemp(prefix="test_hybrid_rag_")
    embedder = MultilingualEmbedder()
    vector_store = ChromaVectorStore(persist_dir=temp_dir)
    bm25_index = BM25SearchIndex()
    api_client = DataGovInClient(api_key=None)

    pipeline = KnowledgeIngestionPipeline(
        embedder=embedder,
        vector_store=vector_store,
        bm25_index=bm25_index,
        api_client=api_client
    )
    pipeline.run_full_ingestion()

    retriever = HybridRetriever(
        embedder=embedder,
        vector_store=vector_store,
        bm25_index=bm25_index
    )

    yield retriever

    shutil.rmtree(temp_dir, ignore_errors=True)


def test_hybrid_retrieve_mandi_prices(hybrid_rag_setup):
    """Verifies end-to-end hybrid RAG context retrieval for Mandi prices."""
    retriever = hybrid_rag_setup

    chunks = retriever.retrieve_grounding_context(
        query="Gondal Groundnut APMC Mandi rate",
        collection_name="mandi_prices_collection",
        district="Rajkot",
        top_k=5
    )

    assert len(chunks) >= 1
    assert any("Gondal" in c["document"] for c in chunks)
    assert any("Groundnut" in c["document"] for c in chunks)


def test_hybrid_retrieve_demographics(hybrid_rag_setup):
    """Verifies end-to-end hybrid RAG context retrieval for demographics."""
    retriever = hybrid_rag_setup

    chunks = retriever.retrieve_grounding_context(
        query="Petlad Anand Taluka population literacy",
        collection_name="demographics_collection",
        district="Anand",
        top_k=5
    )

    assert len(chunks) >= 1
    assert any("Petlad" in c["document"] for c in chunks)
    assert any("Anand" in c["document"] for c in chunks)


def test_hybrid_empty_query_safety(hybrid_rag_setup):
    """Verifies safe handling of empty query strings."""
    retriever = hybrid_rag_setup
    chunks = retriever.retrieve_grounding_context(query="")
    assert chunks == []
