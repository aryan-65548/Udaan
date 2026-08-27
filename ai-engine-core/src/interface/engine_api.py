"""
FastAPI Server Entry Point for RAG Engine & Financial Advisory Backend.
Exposes REST endpoints and serves the interactive testing web dashboard.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from src.interface.schemas import AdvisoryRequest, FinancialRoadmap
from src.calculator.financial_engine import calculate_financial_roadmap
from src.rag.embedder import MultilingualEmbedder
from src.rag.vector_store import ChromaVectorStore
from src.rag.bm25_search import BM25SearchIndex
from src.rag.ingest_pipeline import DataGovInClient, KnowledgeIngestionPipeline
from src.rag.hybrid_retriever import HybridRetriever

app = FastAPI(
    title="Udaan AI Engine Core - Hybrid RAG & Financial Advisory API",
    description="Hyper-local AI advisor for rural micro-entrepreneurs in Gujarat",
    version="1.0.0"
)

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global singleton instances for lazy initialization
_embedder: Optional[MultilingualEmbedder] = None
_vector_store: Optional[ChromaVectorStore] = None
_bm25_index: Optional[BM25SearchIndex] = None
_pipeline: Optional[KnowledgeIngestionPipeline] = None
_retriever: Optional[HybridRetriever] = None


def get_rag_components():
    """Initializes and returns RAG subsystem singletons."""
    global _embedder, _vector_store, _bm25_index, _pipeline, _retriever

    if _embedder is None:
        _embedder = MultilingualEmbedder()
    if _vector_store is None:
        _vector_store = ChromaVectorStore()
    if _bm25_index is None:
        _bm25_index = BM25SearchIndex()
    if _pipeline is None:
        _pipeline = KnowledgeIngestionPipeline(
            embedder=_embedder,
            vector_store=_vector_store,
            bm25_index=_bm25_index
        )
        # Seed initial ingestion if empty
        if _vector_store.get_collection_count("mandi_prices_collection") == 0:
            _pipeline.run_full_ingestion()
    if _retriever is None:
        _retriever = HybridRetriever(
            embedder=_embedder,
            vector_store=_vector_store,
            bm25_index=_bm25_index
        )

    return _embedder, _vector_store, _bm25_index, _pipeline, _retriever


@app.on_event("startup")
def startup_event():
    """Seed RAG engine on startup."""
    get_rag_components()


@app.post("/api/rag/query", response_model=Dict[str, Any])
def query_rag_engine(req: AdvisoryRequest) -> Dict[str, Any]:
    """
    Executes RAG hybrid retrieval and deterministic financial calculation.
    """
    _, _, _, _, retriever = get_rag_components()

    # 1. Deterministic Financial Math Calculation
    financial_roadmap: Optional[FinancialRoadmap] = None
    if req.margin_capital and req.margin_capital > 0:
        try:
            financial_roadmap = calculate_financial_roadmap(req.margin_capital)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    # 2. Extract query & location search terms
    query_text = f"{req.trade_category} business feasibility in {req.location or req.taluka or 'Gujarat'}"

    # 3. Hybrid RAG Retrieval (Dense + BM25 + RRF k=60 + FlashRank)
    retrieved_mandi_chunks = retriever.retrieve_grounding_context(
        query=query_text,
        collection_name="mandi_prices_collection",
        district=req.district,
        taluka=req.taluka,
        top_k=5
    )

    retrieved_demo_chunks = retriever.retrieve_grounding_context(
        query=query_text,
        collection_name="demographics_collection",
        district=req.district,
        taluka=req.taluka,
        top_k=5
    )

    all_chunks = retrieved_mandi_chunks + retrieved_demo_chunks

    # 4. Synthesize Full Business Economics Advisory Report via Groq LLM Generator Agent
    from src.agents.generator import AdvisoryGeneratorAgent
    generator = AdvisoryGeneratorAgent()
    advisory_report_md = generator.generate_advisory_report(
        trade_category=req.trade_category,
        location=req.location or req.taluka or "Gujarat",
        margin_capital=req.margin_capital,
        financial_roadmap=financial_roadmap.model_dump() if financial_roadmap else {},
        grounding_chunks=all_chunks,
        language_code=req.language_code
    )

    # 5. Translate Full Report to Target Indic Language (Gujarati / Hindi) via Sarvam AI if requested
    if req.language_code in ["gu", "hi"]:
        from src.audio.translator import SarvamTranslator
        translator = SarvamTranslator()
        advisory_report_md = translator.translate_text(
            advisory_report_md,
            target_lang=req.language_code,
            source_lang="en"
        )
        for chunk in all_chunks:
            chunk["original_en_document"] = chunk.get("document", "")
            chunk["document"] = translator.translate_text(
                chunk.get("document", ""),
                target_lang=req.language_code,
                source_lang="en"
            )

    return {
        "status": "success",
        "request": req.model_dump(),
        "financial_roadmap": financial_roadmap.model_dump() if financial_roadmap else None,
        "advisory_report_md": advisory_report_md,
        "retrieved_context_chunks_count": len(all_chunks),
        "grounding_chunks": all_chunks
    }


@app.post("/api/rag/ingest", response_model=Dict[str, Any])
def trigger_ingestion() -> Dict[str, Any]:
    """Triggers live ingestion pipeline from DataGovInClient."""
    _, _, _, pipeline, _ = get_rag_components()
    result = pipeline.run_full_ingestion()
    return {"status": "success", "ingestion_summary": result}


@app.get("/", response_class=HTMLResponse)
def serve_testing_dashboard() -> str:
    """Serves the interactive web UI testing dashboard."""
    html_file_path = os.path.join(os.path.dirname(__file__), "../static/index.html")
    if os.path.exists(html_file_path):
        with open(html_file_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Udaan AI Engine API Running</h1><p>POST requests to /api/rag/query</p>"
