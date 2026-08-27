"""
Unit tests for the BM25SearchIndex module.
Verifies trilingual tokenization, exact lexical keyword matching, metadata filtering, and serialization.
"""

import os
import tempfile
import pytest
from src.rag.bm25_search import BM25SearchIndex, trilingual_tokenize


def test_trilingual_tokenize():
    """Verifies tokenization across English, Gujarati, and Hindi text."""
    english_text = "Dairy Processing Unit in Petlad, Anand!"
    tokens_en = trilingual_tokenize(english_text)
    assert "dairy" in tokens_en
    assert "petlad" in tokens_en

    gujarati_text = "ગોંડલ માર્કેટિંગ યાડ કપાસ ભાવ"
    tokens_gu = trilingual_tokenize(gujarati_text)
    assert "ગોંડલ" in tokens_gu
    assert "કપાસ" in tokens_gu

    hindi_text = "जीरा एवं मूंगफली मंडी दर"
    tokens_hi = trilingual_tokenize(hindi_text)
    assert "जीरा" in tokens_hi
    assert "मंडी" in tokens_hi


def test_bm25_keyword_search():
    """Verifies exact lexical search matching."""
    index = BM25SearchIndex()

    docs = [
        "Petlad Taluka Dairy Cooperatives Anand District Gujarat",
        "Gondal APMC Groundnut and Cotton Market Yard Rajkot",
        "Unjha APMC Cumin Jeera Spice Trading Market Mehsana"
    ]

    metadatas = [
        {"district": "Anand", "taluka": "Petlad", "trade": "Dairy"},
        {"district": "Rajkot", "taluka": "Gondal", "trade": "Groundnut"},
        {"district": "Mehsana", "taluka": "Unjha", "trade": "Spices"}
    ]

    index.index_documents(documents=docs, metadatas=metadatas)

    # Search for 'Jeera' -> should rank Unjha document #1
    results_jeera = index.search(query="Jeera Market", n_results=1)
    assert len(results_jeera) == 1
    assert results_jeera[0]["metadata"]["taluka"] == "Unjha"

    # Search for 'Petlad Dairy' -> should rank Petlad document #1
    results_petlad = index.search(query="Petlad Dairy", n_results=1)
    assert len(results_petlad) == 1
    assert results_petlad[0]["metadata"]["district"] == "Anand"


def test_bm25_metadata_filtering():
    """Verifies metadata filter constraints on BM25 keyword search."""
    index = BM25SearchIndex()

    docs = [
        "Micro Finance Scheme GBCDC Anand Gujarat",
        "Micro Finance Scheme GBCDC Rajkot Gujarat"
    ]

    metadatas = [
        {"district": "Anand", "scheme": "Micro Finance"},
        {"district": "Rajkot", "scheme": "Micro Finance"}
    ]

    index.index_documents(documents=docs, metadatas=metadatas)

    # Query 'Micro Finance' filtered for district == 'Anand'
    results = index.search(
        query="Micro Finance",
        n_results=5,
        where_filter={"district": "Anand"}
    )

    assert len(results) == 1
    assert results[0]["metadata"]["district"] == "Anand"


def test_bm25_serialization():
    """Verifies index saving to and loading from a pickle file."""
    index = BM25SearchIndex()
    docs = ["Snack Shop Farsan Unit Petlad Anand"]
    metadatas = [{"trade": "Snack Shop"}]

    index.index_documents(documents=docs, metadatas=metadatas)

    with tempfile.TemporaryDirectory() as temp_dir:
        pkl_path = os.path.join(temp_dir, "bm25_index.pkl")
        index.save_index(pkl_path)
        assert os.path.exists(pkl_path)

        loaded_index = BM25SearchIndex()
        loaded_index.load_index(pkl_path)

        results = loaded_index.search(query="Farsan", n_results=1)
        assert len(results) == 1
        assert results[0]["metadata"]["trade"] == "Snack Shop"
