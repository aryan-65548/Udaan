# Udaan AI Context Engine

The **AI Context Engine** is the foundational data processing and intelligence layer for the Udaan platform. It transforms raw backend payloads from Node.js into a canonical, validated, normalized, and provenance-tracked `AssessmentContext`.

---

## 1. Architecture

```text
Node.js Backend (AiGatewayService)
       │
       ▼  HTTP JSON Payload
FastAPI AI Service (ai_engine_core.app)
       │
       ▼
ContextBuilder Pipeline
 ├── 1. Input Validation (Pydantic v2 schemas)
 ├── 2. Normalization
 │    ├── AnswerNormalizer (Booleans, numbers, trim)
 │    ├── ResourceNormalizer (Physical, Human, Ops, Capital)
 │    ├── FinanceNormalizer (Loan terms, EMI, DSCR, decimals)
 │    ├── LocationNormalizer (Admin hierarchy, WGS84 coords)
 │    ├── CompetitionNormalizer (Competitor distances, provider)
 │    └── PopulationNormalizer (Available / Estimated / Unavailable)
 ├── 3. Provenance Tracking (SourceType, ClaimType, Timestamp)
 └── 4. Quality Evaluation (Completeness ratio, gaps, limitations)
       │
       ▼
Canonical AssessmentContext
       │
       ▼
Future AI Modules (Market, Competition, Demand, Pricing, Reports)
```

---

## 2. Core Concepts

### A. Missing vs Null vs Zero
* `0`: Explicitly reported zero (e.g. `own_contribution: 0.0`).
* `None` / `null`: Data was not supplied by user or backend.
* `status = "unavailable"`: Data source (such as local population census) does not have records for the specified coordinate radius. No numbers are fabricated.

### B. Provenance & Source Tracking
Every logical section tracks its origin using `ProvenanceRecord`:
* `backend_assessment`
* `backend_finance`
* `backend_location`
* `backend_competition`
* `backend_population`
* `user_profile`
* `user_message`
* `derived`

### C. Context Quality & Completeness
Evaluates whether sufficient intelligence exists before initiating deep advisory reasoning:
* `status`: `COMPLETE`, `PARTIAL`, `INSUFFICIENT`
* `completeness_score`: Deterministic 0.0 to 1.0 ratio
* `missing_information`: Granular list of gaps with importance ratings (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
* `limitations`: Explicit caveats (e.g. Census vintage, lack of Google Places coverage)

---

## 3. Running & Testing

### Running Tests
From `ai-engine-core/`:
```bash
pytest
```

### Running the Service Locally
```bash
uvicorn ai_engine_core.app:app --host 0.0.0.0 --port 8000 --reload
```
