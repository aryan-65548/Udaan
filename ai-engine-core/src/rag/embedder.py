"""
Multilingual Embedding Engine using Sentence-Transformers.
Supports paraphrase-multilingual-mpnet-base-v2 for cross-lingual English, Hindi, and Gujarati embeddings.
"""

import os
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

from typing import List, Optional
from sentence_transformers import SentenceTransformer

DEFAULT_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../config/engine_config.yaml")


def load_model_name_from_config() -> str:
    """Reads dense embedding model name from engine_config.yaml if available."""
    if HAS_YAML and os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f)
                return config.get("rag", {}).get("dense_model", DEFAULT_MODEL_NAME)
        except Exception:
            pass
    return DEFAULT_MODEL_NAME


class MultilingualEmbedder:
    """
    Cross-lingual dense vector embedder for English, Gujarati, and Hindi.
    """

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or load_model_name_from_config()
        self._model: Optional[SentenceTransformer] = None

    @property
    def model(self) -> SentenceTransformer:
        """Lazy-loads the SentenceTransformer model on first usage."""
        if self._model is None:
            self._model = SentenceTransformer(self.model_name)
        return self._model

    @property
    def embedding_dimension(self) -> int:
        """Returns vector embedding dimension (768 for paraphrase-multilingual-mpnet-base-v2)."""
        return self.model.get_sentence_embedding_dimension()

    def embed_text(self, text: str) -> List[float]:
        """
        Embeds a single query string into a dense float vector.

        Args:
            text: Query or sentence string.

        Returns:
            List of floats representing the 768-dim embedding.
        """
        if not text or not text.strip():
            raise ValueError("Text for embedding cannot be empty.")

        embedding = self.model.encode(text.strip(), convert_to_numpy=True, normalize_embeddings=True)
        return embedding.tolist()

    def embed_documents(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Embeds a list of document chunks into dense float vectors.

        Args:
            texts: List of document strings.
            batch_size: Encoding batch size.

        Returns:
            List of 768-dim float vector lists.
        """
        if not texts:
            return []

        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            raise ValueError("All document texts provided are empty.")

        embeddings = self.model.encode(
            cleaned_texts,
            batch_size=batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        return embeddings.tolist()
