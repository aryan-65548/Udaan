Antigravity Implementation Rules

Goal

Implement the Rural Business Advisor according to the phase plan without expanding scope.

Mandatory Rules

Rule 1 — Do not change architecture casually

Use:

Node.js

TypeScript

Express

PostgreSQL

Drizzle

Zod

JWT

pnpm

Python/FastAPI only for AI service

Do not introduce another backend framework or ORM without explicit approval.

Rule 2 — One backend service

Do not split the backend into microservices.

Use one Express API plus one separate AI service.

Rule 3 — Database boundary

PostgreSQL is for application state.

Do not create tables for:

population analysis

market scores

competitor scores

SWOT

pricing recommendations

AI reasoning

unless a future architecture decision explicitly requires persistent analytics.

Rule 4 — Financial calculations are deterministic

The backend is authoritative for:

loan amount

EMI/monthly equivalent

installment

interest

repayment

DSCR

Never use the LLM for authoritative arithmetic.

Rule 5 — AI does not own user state

Store user answers in PostgreSQL.

Do not embed personal assessment answers in the vector knowledge store as if they were reusable knowledge.

Rule 6 — RAG must be source-aware

Every knowledge document should retain source/date/geographic/business metadata.

Rule 7 — Never fabricate local facts

If evidence is missing, the AI must say that the evidence is insufficient.

Rule 8 — No silent schema expansion

If implementation appears to require a new table, stop and document why. Prefer using an existing table if appropriate.

Rule 9 — No silent API breaking changes

Update 03_BACKEND_API_SPEC.md and 04_AI_BACKEND_CONTRACT.md before changing contracts.

Rule 10 — Tests before claiming completion

Every phase requires tests for the functionality introduced in that phase.

Coding Style

strict TypeScript

small modules

explicit service boundaries

no business logic in route handlers

repository/data-access layer for DB calls

domain/service layer for calculations

DTO validation with Zod

standardized errors

transactions around multi-write financial operations

Backend Layering

Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database

Finance:

Route
  ↓
FinanceController
  ↓
FinanceService
  ↓
SchemeRepository
  ↓
FinancialCalculator
  ↓
Transaction
  ├── financial_runs
  └── repayment_schedule_items

AI Layering

AI Route
  ↓
Session Service
  ↓
Retriever
  ↓
Prompt/Context Builder
  ↓
LLM
  ↓
Structured Output Validator

Git / Work Rules

Use feature branches or equivalent isolated workspaces:

dev1/backend-*

dev2/ai-*

Do not make unrelated formatting or dependency changes across the whole repository.

Before Each Phase

Read:

00_MASTER_PLAN.md

01_REQUIREMENTS_AND_FUNCTIONALITY.md

relevant phase in 06_PHASE_PLAN_2_DEVELOPERS.md

relevant schema/contract files

After Each Phase

Report:

files changed

tables/migrations changed

endpoints added

tests added

known limitations

next phase dependencies

Do Not Build Yet

admin dashboard

advanced analytics

credit scoring

ML prediction

file upload system

Redis caching

message queues

Kubernetes

multi-region infrastructure

mobile application