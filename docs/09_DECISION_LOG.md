# 09 — Decision Log

## D-001 — Backend stack

Decision:

- Node.js
- TypeScript
- Express
- Drizzle
- PostgreSQL

Reason:

The backend is primarily orchestration, persistence, validation and deterministic calculations.

## D-002 — AI stack separation

Decision:

Python is used for AI/ML only.

Reason:

AI engineer owns RAG/LLM experimentation without making Python the main transactional backend.

## D-003 — PostgreSQL is application state

Decision:

Application state lives in PostgreSQL.

Includes:

- users;
- assessments;
- answers;
- finance;
- report metadata;
- validation state.

## D-004 — Vector DB is knowledge

Decision:

Reusable AI knowledge is stored in vector collections.

Includes:

- business;
- geographic;
- market;
- pricing;
- competitor;
- risk;
- scheme documents.

## D-005 — Business templates removed from backend

Decision:

Do not create `business_templates` in PostgreSQL Phase 1.

Reason:

Business-specific knowledge and questioning belong to AI. Backend needs only the selected business category identity.

## D-006 — Geographic indicators removed from backend

Decision:

Do not create `location_indicators` or `location_facilities` in PostgreSQL Phase 1.

Reason:

Backend stores location identity. AI/data system stores/derives geographic knowledge.

## D-007 — Competitor observations removed from backend

Decision:

Do not create `competitor_observations` in backend Phase 1.

Reason:

Competition analysis belongs to AI/data layer.

Important limitation:

A registered-enterprise dataset does not represent all informal businesses.

## D-008 — Scheme configuration stays relational

Decision:

Keep `scheme_configs` in PostgreSQL.

Reason:

Financial calculations require structured numeric rules and reproducibility.

Detailed scheme documents remain in RAG.

## D-009 — Assessment answers unified

Decision:

Use one `assessment_inputs` table.

Reason:

AI questions are dynamic and business-dependent. A single flexible table avoids schema churn.

## D-010 — Financial calculations are runs

Decision:

Use `financial_runs` rather than overwriting one calculation row.

Reason:

Users can change assumptions and scenario calculations need history/reproducibility.

## D-011 — Repayment schedule separate

Decision:

Use `repayment_schedule_items`.

Reason:

A complete schedule is a first-class output and must not be reconstructed from one summary number.

## D-012 — Feasibility report metadata only in backend

Decision:

Backend stores `feasibility_reports` metadata/reference.

Reason:

AI owns the detailed narrative report.

## D-013 — Validation tasks retained

Decision:

Keep `validation_tasks`.

Reason:

Offline validation is a core product principle and differentiator.

## D-014 — No generic AI business-success prediction

Decision:

Do not claim predictive accuracy without historical outcome data.

Reason:

The hackathon MVP lacks a robust labeled dataset for village/business success prediction.

## D-015 — No exact competitor claim without coverage

Decision:

Use language such as:

- detected;
- available sources;
- registered;
- estimated;
- partial coverage.

## D-016 — No guarantee of financing

Decision:

Use:

- indicative;
- configured scheme rule;
- appears applicable.

Never:

- approved;
- guaranteed;
- sanctioned.

## D-017 — No backend market engine in Phase 1

Decision:

Backend does not calculate:

- population analysis;
- demand;
- market competition;
- pricing;
- SWOT;
- local opportunity.

AI handles those using retrieved evidence.

## D-018 — 12 backend tables

Final Phase-1 tables:

1. users
2. refresh_tokens
3. consents
4. locations
5. business_categories
6. scheme_configs
7. assessments
8. assessment_inputs
9. financial_runs
10. repayment_schedule_items
11. feasibility_reports
12. validation_tasks

## D-019 — Four technical owners

Team split:

- Backend Developer 1: platform.
- Backend Developer 2: finance + AI integration.
- AI Engineer: RAG/LLM.
- Frontend Engineer: UI.

Two helpers support data/domain work.

## D-020 — Exact future changes require a new decision

Any change to:

- database ownership;
- AI/backend responsibility;
- scheme calculation behavior;
- endpoint contract

must update this file before implementation.
