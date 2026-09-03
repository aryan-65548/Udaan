# Rural Business Advisor — Antigravity Implementation Pack v2

## Purpose

This folder is the implementation source of truth for the Rural Business Advisor hackathon project.

The project is based on the selected problem statement:

**AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs**

The product has two core capabilities:

1. Hyper-local AI business feasibility advisory.
2. Deterministic financial structuring and scheme calculation.

The implementation deliberately separates responsibilities:

- **Backend/PostgreSQL:** application state, authentication, location identity, assessment state, user inputs, scheme configuration, deterministic financial calculations, report references, validation state.
- **AI service/vector database:** business knowledge, geographic knowledge, market knowledge, pricing knowledge, competitor evidence, risk/compliance knowledge, RAG retrieval, questioning, reasoning, report generation.
- **Frontend:** collection and presentation of data; no authoritative financial/business logic.
- **AI service:** never becomes the source of truth for money calculations.
- **Backend:** does not attempt to calculate market demand, competition, SWOT, population analysis, or business feasibility.

## Team

- Backend Developer 1 — Core platform and application state.
- Backend Developer 2 — Finance engine and AI integration.
- AI Engineer — Python/LLM/RAG/AI knowledge system.
- Frontend Engineer — Next.js/React/UI.
- Helper 1 — data/source preparation.
- Helper 2 — business/domain research and validation.

## Documents

1. `00_MASTER_PLAN.md` — overall architecture, principles and implementation order.
2. `01_REQUIREMENTS_AND_FUNCTIONALITY.md` — product requirements and final functionality.
3. `02_DATABASE_SCHEMA.md` — authoritative PostgreSQL schema.
4. `03_BACKEND_API_SPEC.md` — public API contract.
5. `04_AI_BACKEND_CONTRACT.md` — Backend ↔ AI contract.
6. `05_AI_RAG_AND_DATA_SPEC.md` — AI/vector knowledge architecture and ingestion.
7. `06_PHASE_PLAN_4_TECH_MEMBERS.md` — phased plan for 2 backend + AI + frontend, plus helpers.
8. `07_ANTIGRAVITY_EXECUTION_RULES.md` — exact rules for an AI coding agent.
9. `08_DEMO_ACCEPTANCE_TESTS.md` — acceptance criteria and demo scenarios.
10. `09_DECISION_LOG.md` — frozen architectural decisions and rejected alternatives.
11. `10_BACKEND_DEVELOPER_TASK_MATRIX.md` — detailed split between Backend Developer 1 and Backend Developer 2.

## Source of truth

When documents conflict, use this order:

1. `00_MASTER_PLAN.md`
2. `02_DATABASE_SCHEMA.md`
3. `03_BACKEND_API_SPEC.md`
4. `04_AI_BACKEND_CONTRACT.md`
5. Other documents

Any proposed architectural change must be recorded in `09_DECISION_LOG.md`.

## Phase-1 backend database

Exactly these 12 tables are in scope:

- `users`
- `refresh_tokens`
- `consents`
- `locations`
- `business_categories`
- `scheme_configs`
- `assessments`
- `assessment_inputs`
- `financial_runs`
- `repayment_schedule_items`
- `feasibility_reports`
- `validation_tasks`

Do not add tables merely because a concept exists. Add a table only when an explicit Phase-1 requirement requires persistent relational application state.

## External/current-data principle

Government, regulatory and third-party information can change. Official source documents must be re-verified before final demo/deployment. Scheme values stored in `scheme_configs` must have source/version/effective-date metadata. Vector knowledge must retain source and data-vintage metadata.

## How to use with Antigravity

Start by providing `00_MASTER_PLAN.md` plus `02_DATABASE_SCHEMA.md`.

Then implement one phase at a time.

Antigravity must:

- inspect existing code before modifying it;
- implement only the current phase;
- run tests/type-check/lint after changes;
- not invent API fields or database tables;
- not move market/AI responsibilities into the backend;
- not move application state into the vector database;
- not silently change frozen architecture;
- report blockers instead of inventing assumptions.
