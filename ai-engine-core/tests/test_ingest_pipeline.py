"""
Unit tests for DataGovInClient and KnowledgeIngestionPipeline.
Verifies API querying, fallback execution, text chunking, and dual dense/sparse indexing.
"""

import tempfile
import shutil
import pytest
from src.rag.embedder import MultilingualEmbedder
from src.rag.vector_store import ChromaVectorStore
from src.rag.bm25_search import BM25SearchIndex
from src.rag.ingest_pipeline import DataGovInClient, KnowledgeIngestionPipeline


@pytest.fixture(scope="module")
def temp_pipeline_setup():
    """Module-level fixture for isolated RAG ingestion pipeline testing."""
    temp_dir = tempfile.mkdtemp(prefix="test_pipeline_")
    embedder = MultilingualEmbedder()
    vector_store = ChromaVectorStore(persist_dir=temp_dir)
    bm25_index = BM25SearchIndex()
    api_client = DataGovInClient(api_key="mock_test_key")

    pipeline = KnowledgeIngestionPipeline(
        embedder=embedder,
        vector_store=vector_store,
        bm25_index=bm25_index,
        api_client=api_client
    )

    yield pipeline, vector_store, bm25_index, embedder

    shutil.rmtree(temp_dir, ignore_errors=True)


def test_datagovin_client_fallback():
    """Verifies DataGovInClient fallback data generation."""
    client = DataGovInClient(api_key=None)
    mandi_records = client.fetch_mandi_prices()
    assert len(mandi_records) >= 4
    assert any(r["district"] == "Anand" for r in mandi_records)

    census_records = client.fetch_census_demographics()
    assert len(census_records) >= 3
    assert any(r["taluka"] == "Petlad" for r in census_records)


def test_pipeline_ingest_mandi_prices(temp_pipeline_setup):
    """Verifies Mandi price chunking and indexing."""
    pipeline, vector_store, bm25_index, _ = temp_pipeline_setup

    count = pipeline.ingest_mandi_prices()
    assert count >= 4

    col_count = vector_store.get_collection_count("mandi_prices_collection")
    assert col_count >= 4

    bm25_results = bm25_index.search(query="Jeera Unjha", n_results=1)
    assert len(bm25_results) == 1
    assert "Unjha APMC" in bm25_results[0]["document"]


def test_pipeline_ingest_demographics(temp_pipeline_setup):
    """Verifies Census demographic chunking and vector storage."""
    pipeline, vector_store, _, embedder = temp_pipeline_setup

    count = pipeline.ingest_demographics()
    assert count >= 3

    col_count = vector_store.get_collection_count("demographics_collection")
    assert col_count >= 3

    # Vector query against demographics
    q_vec = embedder.embed_text("Petlad Taluka population")
    vec_results = vector_store.similarity_search(
        collection_name="demographics_collection",
        query_embedding=q_vec,
        n_results=1
    )

    assert len(vec_results) == 1
    assert "Petlad" in vec_results[0]["document"]


def test_full_ingestion_run(temp_pipeline_setup):
    """Verifies full ingestion pipeline summary."""
    pipeline, _, _, _ = temp_pipeline_setup
    summary = pipeline.run_full_ingestion()

    assert summary["mandi_prices_ingested"] >= 4
    assert summary["demographics_ingested"] >= 3
    assert summary["total_ingested"] >= 7
