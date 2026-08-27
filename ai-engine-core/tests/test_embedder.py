"""
Unit tests for the MultilingualEmbedder module.
Verifies vector dimensions, batching, and cross-lingual semantic alignment across English, Gujarati, and Hindi.
"""

import pytest
import numpy as np
from src.rag.embedder import MultilingualEmbedder


@pytest.fixture(scope="module")
def embedder():
    """Module-level fixture to load sentence-transformers model once for all tests."""
    return MultilingualEmbedder()


def test_embedding_dimension(embedder):
    """Verifies that the embedding dimension is 768."""
    assert embedder.embedding_dimension == 768


def test_embed_text_single(embedder):
    """Verifies single text string embedding shape and normalization."""
    vector = embedder.embed_text("Rural Business Advisory")
    assert isinstance(vector, list)
    assert len(vector) == 768
    assert all(isinstance(x, float) for x in vector)

    # Check vector unit norm (norm ~ 1.0 due to normalize_embeddings=True)
    norm = np.linalg.norm(vector)
    assert np.isclose(norm, 1.0, atol=1e-3)


def test_embed_documents_batch(embedder):
    """Verifies document batch embedding functionality."""
    docs = [
        "Dairy Processing Unit in Anand, Gujarat",
        "Spices packaging business in Petlad",
        "Solar pump repair workshop"
    ]
    vectors = embedder.embed_documents(docs)
    assert len(vectors) == 3
    assert all(len(v) == 768 for v in vectors)


def test_trilingual_semantic_alignment(embedder):
    """
    Verifies high cosine similarity between trilingual representations
    of the same trade category (English, Gujarati, Hindi).
    """
    english_trade = "Dairy & Milk Chilling Unit"
    gujarati_trade = "ડેરી અને દૂધ શીતળીકરણ એકમ"
    hindi_trade = "डेयरी एवं दुग्ध शीतलन इकाई"

    v_en = np.array(embedder.embed_text(english_trade))
    v_gu = np.array(embedder.embed_text(gujarati_trade))
    v_hi = np.array(embedder.embed_text(hindi_trade))

    # Cosine similarity calculation (dot product of normalized vectors)
    sim_en_gu = np.dot(v_en, v_gu)
    sim_en_hi = np.dot(v_en, v_hi)
    sim_gu_hi = np.dot(v_gu, v_hi)

    # Cross-lingual embeddings for the same term should have high similarity (> 0.60)
    assert sim_en_gu > 0.60, f"English-Gujarati similarity low: {sim_en_gu:.4f}"
    assert sim_en_hi > 0.60, f"English-Hindi similarity low: {sim_en_hi:.4f}"
    assert sim_gu_hi > 0.60, f"Gujarati-Hindi similarity low: {sim_gu_hi:.4f}"


def test_empty_text_error_handling(embedder):
    """Verifies error handling for empty text strings."""
    with pytest.raises(ValueError, match="Text for embedding cannot be empty."):
        embedder.embed_text("   ")

    with pytest.raises(ValueError, match="All document texts provided are empty."):
        embedder.embed_documents(["   ", ""])
