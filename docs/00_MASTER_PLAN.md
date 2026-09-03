# 00 — Master Implementation Plan

## 1. Product definition

### Problem statement

The selected problem statement asks for an NLP-powered, multilingual AI Business Advisory Assistant plus a Smart Financial Calculator & Scheme Router for rural/semi-urban micro-entrepreneurs.

The expected solution has two core modules:

### Module 1 — Hyper-Local Business Feasibility Report

The AI should provide:

- Market Reach
- Opportunity Analysis
- SWOT
- Threat Identification
- Competitor Mapping
- Product Market Value / pricing guidance

### Module 2 — Smart Financial Calculator & Scheme Router

The system should provide:

- Financial Structuring
- Scheme Auto-Selection
- EMI / repayment generation
- Operational-cost context
- Working-capital context

The problem statement is a pre-application advisory system. It does not approve loans, guarantee business success, or replace the implementing agency.

## 2. Product USP

### Primary USP

**Evidence before borrowing.**

The system should help a rural entrepreneur understand:

1. What the available evidence indicates about the proposed business in the selected location.
2. What financial burden follows from the proposed capital structure.
3. What assumptions are being used.
4. What is uncertain or missing.
5. What the entrepreneur should verify locally before borrowing.

### Supporting differentiators

- Hyper-local context.
- Business-specific AI questioning.
- Deterministic financial calculations.
- Source-aware RAG.
- Explicit confidence/limitations.
- Multilingual advisory.
- Validation-first workflow.

## 3. Responsibility boundaries

### Backend owns

- Authentication.
- User account/profile.
- Consent records.
- Location master identity.
- Business-category master identity.
- Assessment lifecycle/state.
- User and AI-question answers.
- Scheme configuration used by deterministic finance calculations.
- Loan/project arithmetic.
- EMI/installment calculation.
- DSCR calculation.
- Repayment schedules.
- Report metadata/status.
- Validation-task state.
- AI orchestration/gateway.

### AI owns

- Dynamic questioning.
- Business-specific questions.
- Retrieval from knowledge sources.
- Interpretation of geographic information.
- Market-reach analysis.
- Competition interpretation.
- Opportunity analysis.
- Pricing guidance.
- SWOT.
- Risk analysis.
- Recommendations.
- Report prose/structure.
- Multilingual reasoning/output.

### Vector DB / AI knowledge layer owns

- Government scheme documents and explanatory material.
- Business-domain knowledge.
- Geographic knowledge.
- Market research/reports.
- Pricing observations.
- Competitor evidence.
- Risk knowledge.
- Compliance and validation guidance.

### Frontend owns

- UI.
- Navigation.
- User input collection.
- Presentation.
- Loading/error states.
- Scenario sliders.
- Report visualization.

Frontend never becomes authoritative for finance/business logic.

## 4. Architecture

```text
Next.js / React
      |
      v
Express + TypeScript API
      |
      +--------------------+
      |                    |
      v                    v
PostgreSQL             AI Service
      |                    |
      |                    +--> Vector DB
      |                    |
      |                    +--> LLM
      |
      +--> Finance Engine
```

### AI interaction

```text
Backend
  |
  | AssessmentContext
  v
AI Service
  |
  +--> retrieve RAG knowledge
  |
  +--> ask question / analyze
  |
  v
AI result
  |
  v
Backend
  |
  v
Frontend
```

## 5. Core workflow

```text
Landing
 -> Language
 -> Login/Signup
 -> Dashboard
 -> Create Assessment
 -> Location
 -> Entrepreneur Profile
 -> Business
 -> Finance Inputs
 -> Financial Calculation
 -> AI Advisor
 -> AI Analysis
 -> Feasibility Result
 -> Finance Result
 -> Recommendation
 -> Validation Checklist
 -> Final Report
 -> Complete Assessment
 -> Dashboard
```

## 6. Phase-1 backend tables

Exactly 12:

1. `users`
2. `refresh_tokens`
3. `consents`
4. `locations`
5. `business_categories`
6. `scheme_configs`
7. `assessments`
8. `assessment_inputs`
9. `financial_runs`
10. `repayment_schedule_items`
11. `feasibility_reports`
12. `validation_tasks`

### Intentionally excluded from Phase 1 backend

- `location_indicators`
- `location_facilities`
- `business_templates`
- `data_sources`
- `competitor_observations`
- `report_sources`
- `facilitator_notes`
- `feedback`
- `files`
- `audit_logs`
- `api_cache`
- `data_sync_runs`

These concepts are either AI/data-pipeline concerns or later product features.

## 7. Hard architectural rules

### Rule 1 — Money is deterministic

Never ask the LLM to calculate:

- project cost;
- loan amount;
- interest;
- EMI/installment;
- DSCR;
- total repayment;
- repayment schedule.

The backend calculates these.

### Rule 2 — User answers are relational state

Even when the AI asks the question, the answer belongs in PostgreSQL `assessment_inputs`.

### Rule 3 — RAG knowledge is not application state

Do not store user answers, assessment status, or individual report ownership in the vector DB.

### Rule 4 — AI does not get to invent evidence

The AI may infer from retrieved evidence, but it must identify estimates/assumptions when evidence is incomplete.

### Rule 5 — Scheme rules are versioned

Never hard-code current interest/limits directly into service code. Use `scheme_configs`.

### Rule 6 — No fake precision

Use terms such as:

- detected from available sources
- estimated
- indicative
- confidence
- based on available evidence

when the data is not complete.

## 8. Phase order

### Phase 0 — Contract freeze

Deliver:

- repo structure
- environment setup
- API conventions
- DB schema
- AI contract
- coding rules

### Phase 1 — Backend foundation

Deliver:

- PostgreSQL
- Drizzle
- auth
- users
- refresh tokens
- consents
- locations
- business categories

### Phase 2 — Assessment foundation

Deliver:

- assessments
- assessment inputs
- location/business selection
- save/resume

### Phase 3 — Financial engine

Deliver:

- scheme configs
- financial runs
- repayment schedule
- EMI/installment
- DSCR
- calculation tests

### Phase 4 — AI integration

Deliver:

- AI gateway
- session start/message
- context construction
- answer persistence
- AI status

### Phase 5 — AI analysis/report

Deliver:

- RAG integration
- final analysis
- report integration
- feasibility result

### Phase 6 — Validation and scenario

Deliver:

- validation tasks
- scenario recalculation
- final report/download

### Phase 7 — Demo hardening

Deliver:

- security
- error states
- tests
- seed data
- demo script
- performance cleanup

## 9. Definition of done

A phase is done only when:

- implementation exists;
- TypeScript compiles;
- tests pass;
- migrations work from a clean DB;
- endpoint behavior matches the API spec;
- no boundary violation was introduced;
- the relevant acceptance tests pass.

## 10. Non-goals for Phase 1

Do not build:

- loan approval;
- credit underwriting;
- guaranteed business-success prediction;
- nationwide ML prediction;
- complex admin CMS;
- payments;
- document verification;
- Aadhaar integrations;
- complete business census;
- exhaustive competitor census.
