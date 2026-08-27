"""
Unit tests for the ChromaVectorStore module.
Verifies collection creation, vector chunk insertion, metadata filtering, and similarity searches.
"""

import pytest
import shutil
import tempfile
import numpy as np
from src.rag.vector_store import ChromaVectorStore


@pytest.fixture(scope="module")
def temp_chroma_store():
    """Module-level fixture to create a temporary Chroma DB persist directory for isolated testing."""
    temp_dir = tempfile.mkdtemp(prefix="test_chroma_")
    store = ChromaVectorStore(persist_dir=temp_dir)
    yield store
    # Cleanup temp directory after tests finish
    shutil.rmtree(temp_dir, ignore_errors=True)


def test_collection_creation_and_count(temp_chroma_store):
    """Verifies collection creation and initial empty count."""
    collection_name = "test_demographics"
    count = temp_chroma_store.get_collection_count(collection_name)
    assert count == 0


def test_add_documents_and_vector_query(temp_chroma_store):
    """Verifies document insertion with 768-dim embeddings and similarity retrieval."""
    collection_name = "test_schemes"

    # Create dummy 768-dim vectors
    rng = np.random.default_rng(42)
    v1 = rng.random(768).astype(np.float32)
    v1 = (v1 / np.linalg.norm(v1)).tolist()

    v2 = rng.random(768).astype(np.float32)
    v2 = (v2 / np.linalg.norm(v2)).tolist()

    docs = [
        "Micro Finance Scheme GBCDC Gujarat: Max cost Rs 140000, 6.5% interest, 3 years tenure.",
        "Term Loan Scheme GBCDC Gujarat: Max cost Rs 5000000, 8.0% interest, 7 years tenure."
    ]

    metadatas = [
        {"scheme": "Micro Finance", "district": "Anand", "state": "Gujarat"},
        {"scheme": "Term Loan", "district": "Rajkot", "state": "Gujarat"}
    ]

    assigned_ids = temp_chroma_store.add_documents(
        collection_name=collection_name,
        documents=docs,
        metadatas=metadatas,
        embeddings=[v1, v2]
    )

    assert len(assigned_ids) == 2
    assert temp_chroma_store.get_collection_count(collection_name) == 2

    # Query with vector v1 -> should return Micro Finance doc first
    results = temp_chroma_store.similarity_search(
        collection_name=collection_name,
        query_embedding=v1,
        n_results=1
    )

    assert len(results) == 1
    assert results[0]["metadata"]["scheme"] == "Micro Finance"
    assert "Micro Finance Scheme GBCDC" in results[0]["document"]


def test_metadata_filtering(temp_chroma_store):
    """Verifies metadata filtering via 'where' clause."""
    collection_name = "test_schemes"

    rng = np.random.default_rng(99)
    query_vec = rng.random(768).astype(np.float32)
    query_vec = (query_vec / np.linalg.norm(query_vec)).tolist()

    # Filter for district == 'Rajkot'
    results = temp_chroma_store.similarity_search(
        collection_name=collection_name,
        query_embedding=query_vec,
        n_results=5,
        where_filter={"district": "Rajkot"}
    )

    assert len(results) == 1
    assert results[0]["metadata"]["district"] == "Rajkot"
    assert results[0]["metadata"]["scheme"] == "Term Loan"


def test_empty_collection_query_safety(temp_chroma_store):
    """Verifies that querying an empty collection returns empty list without error."""
    collection_name = "test_empty_col"
    dummy_query = [0.1] * 768

    results = temp_chroma_store.similarity_search(
        collection_name=collection_name,
        query_embedding=dummy_query
    )

    assert results == []


def test_delete_collection(temp_chroma_store):
    """Verifies deletion of a collection."""
    col_to_delete = "test_delete_me"
    temp_chroma_store.get_or_create_collection(col_to_delete)
    assert temp_chroma_store.delete_collection(col_to_delete) is True
