Architecture Decision Log

This file records decisions that should not be casually reversed during implementation.

ADR-001 — One PostgreSQL backend DB

Decision: Use one PostgreSQL database for the backend.

Reason: The backend primarily manages application state and deterministic financial calculations. A single relational DB is sufficient for Phase 1.

ADR-002 — 12 backend tables

Decision: Phase 1 uses 12 backend tables:

users

refresh_tokens

consents

locations

business_categories

scheme_configs

assessments

assessment_inputs

financial_runs

repayment_schedule_items

feasibility_reports

validation_tasks

Reason: This captures all required Phase-1 functionality without persisting AI/domain knowledge as relational operational tables.

ADR-003 — Assessment answers are relational state

Decision: User and AI interview answers are stored in assessment_inputs.

Reason: They belong to the assessment and must survive reload/resume. They are not reusable knowledge.

ADR-004 — Business templates are AI knowledge

Decision: Business-specific knowledge/question guidance is maintained by the AI/data layer, not a backend business_templates table.

Reason: AI owns dynamic questioning and business reasoning.

ADR-005 — Scheme rules have structured backend representation

Decision: Financially relevant scheme rules are stored in scheme_configs.

Reason: Deterministic calculations need structured rule data. Detailed scheme documents still live in RAG.

ADR-006 — Financial runs are snapshots

Decision: Each finance calculation is stored as a financial_runs snapshot.

Reason: Scenario analysis and reproducibility require preserving the exact assumptions used.

ADR-007 — AI report body is not duplicated in backend tables

Decision: Backend stores report metadata/reference; AI service owns detailed report JSON.

Reason: Avoid duplicating AI-owned knowledge/result structures in PostgreSQL while still allowing backend lifecycle management.

ADR-008 — Backend is AI gateway

Decision: Frontend never calls AI directly.

Reason: Centralized auth, assessment authorization, context assembly, logging and contract stability.

ADR-009 — No advanced ML in MVP

Decision: Use RAG + LLM + deterministic rules instead of model training.

Reason: No validated historical dataset exists for trustworthy village-level business success prediction.

ADR-010 — Validation is part of the product

Decision: Every feasibility result ends with field-validation actions.

Reason: Local informal data cannot be completely captured automatically; the system should explicitly identify what the entrepreneur must validate.