# DATASET.md — What the Engine Reads

The engine's Pipeline A (Hybrid RAG) is only as good as this corpus — Pipeline B (plain LLM) deliberately ignores it, which is the point: the judge should reward Pipeline A specifically *when* the dataset has the answer.

## 1. Knowledge Base Corpus (ingested into BM25 + ChromaDB)

Based on the original problem statement (rural micro-enterprise advisory + govt loan schemes), a reasonable starting corpus:

| Document | Source | Covers |
|---|---|---|
| NBCFDC scheme guidelines (Micro Finance & Term Loan schemes) | nbcfdc.gov.in | The exact interest rates/tenures/moratorium/eligibility rules — the most likely thing users will ask about verbatim |
| PMEGP guidelines | KVIC / MSME Ministry (kviconline.gov.in) | Alternate/related scheme rules |
| State SC/ST/OBC/Minority finance corporation scheme docs | Respective state corporation sites | State-specific variants |
| MSME sector reports (Dairy, Retail, Textiles, Food Processing, etc.) | Ministry of MSME, NABARD sector papers | Sector-specific business advisory content |
| NABARD "Status of Microfinance in India" reports | nabard.org | Rural credit context |
| RBI Financial Inclusion / Priority Sector Lending reports | rbi.org.in | Interest rate context, financial literacy background |
| Generic SWOT / business-plan templates for micro-enterprises | DAY-NRLM handbooks, public MSME toolkits | Fallback advisory structure |

Swap this list for whatever the actual product's dataset is if it differs — the point is: **anything you want Pipeline A to be able to answer must be in here as text/PDF, chunked and indexed.**

## 2. Ingestion Pipeline (see `techstack.md` §6)

```
raw PDFs/docs → text extraction → chunk (~400-600 tokens, ~15% overlap)
   → embed (sentence-transformers) → upsert to ChromaDB
   → also tokenize + index the same chunks into a BM25Okapi index
```

Keep a `source` and `chunk_id` on every chunk — the RAG pipeline's citations depend on it, and it's how the judge can tell whether Pipeline A's answer is actually grounded.

## 3. Eval Set (build this yourself, needed for Phase 3 in `phases.md`)

A set of **~30–50 query examples**, split into two intentional buckets:

- **"In-dataset" queries** — answerable directly from the corpus (e.g. "What's the interest rate on the Term Loan Scheme?"). Pipeline A should win these.
- **"Out-of-dataset" / general queries** — things the corpus doesn't cover but a competent LLM could still answer reasonably (e.g. "What's a SWOT analysis?"). Pipeline B may legitimately win these, or it's a good test of whether the judge over/under-trusts retrieval.

For each, record the expected winner (or "either is fine") so you can measure whether the judge's picks match your own judgment — this is your actual eval metric for the whole engine (see `phases.md` Phase 3).

## 4. Data You Don't Need for This Scope

Since Pipeline B is a *plain* LLM (no live tools) and there's no financial calculator or geo module in this engine, you do **not** need: Google Maps data, data.gov.in live API calls, LGD/Census geo data, or scheme-parameter config for EMI math. Keep those out — they belong to other parts of the product, not this engine.
