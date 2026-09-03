# 06 — Phase Plan for 2 Backend Developers + AI Engineer + Frontend Engineer

## Team

### Backend Developer 1 — Platform

Primary ownership:

- auth;
- users;
- consents;
- locations;
- business categories;
- assessments;
- assessment inputs;
- validation tasks;
- DB/migrations;
- API foundations.

### Backend Developer 2 — Finance + AI Integration

Primary ownership:

- scheme configs;
- finance engine;
- repayment;
- DSCR;
- financial runs;
- AI gateway;
- AI context creation;
- AI report integration.

### AI Engineer

Primary ownership:

- Python AI service;
- vector DB;
- RAG;
- LLM;
- dynamic questions;
- feasibility reasoning;
- report generation;
- multilingual AI.

### Frontend Engineer

Primary ownership:

- Next.js;
- onboarding;
- assessment UI;
- advisor/chat;
- finance UI;
- results;
- report;
- validation;
- scenario UI.

### Helper 1

- government data collection;
- source verification;
- location/business data preparation.

### Helper 2

- business templates/knowledge research;
- risk/pricing research;
- validation checklist;
- demo data.

---

# PHASE 0 — Architecture freeze

## Backend Developer 1

- create monorepo;
- configure pnpm;
- configure TypeScript;
- configure Express;
- configure Drizzle;
- configure PostgreSQL/Docker;
- shared error handling;
- Zod;
- environment management.

## Backend Developer 2

- define finance interfaces;
- define calculation versioning;
- define AI gateway interface;
- implement shared `AssessmentContext` TypeScript types.

## AI Engineer

- define Python service skeleton;
- define vector DB interface;
- define AI contract;
- define report JSON schema.

## Frontend

- inspect API contract;
- build route map;
- create design system shell.

### Exit criteria

All four engineers agree on:

- DB schema;
- API shapes;
- AI contract;
- enums;
- statuses.

---

# PHASE 1 — Auth and DB foundation

## Backend 1

Build:

- users;
- refresh_tokens;
- consents;
- auth endpoints;
- migrations;
- auth middleware.

## Backend 2

Build:

- scheme_configs migration;
- finance calculation interfaces;
- test harness for finance.

## AI

Build:

- AI health endpoint;
- model provider abstraction.

## Frontend

Build:

- login;
- signup;
- language;
- dashboard shell.

### Exit

A user can sign in and access a protected dashboard.

---

# PHASE 2 — Assessment foundation

## Backend 1

Build:

- locations;
- business categories;
- assessments;
- assessment_inputs;
- corresponding APIs.

## Backend 2

Integrate:

- finance input endpoint;
- AssessmentContext builder.

## AI

Prepare:

- first-question schema;
- session API;
- mock questioner.

## Frontend

Build:

- location selection;
- business selection;
- profile forms.

### Exit

User can create/resume an assessment.

---

# PHASE 3 — Financial engine

## Backend 1

Support assessment input flow.

## Backend 2

Implement:

- scheme rule lookup;
- project financing;
- loan calculation;
- EMI/equivalent installment;
- interest;
- total repayment;
- DSCR;
- repayment schedule;
- financial runs.

Create exhaustive unit tests for edge cases.

## AI

Consume finance context but do not calculate it.

## Frontend

Build financial screen and schedule display.

### Exit

A completed finance input produces a deterministic financial run.

---

# PHASE 4 — AI questioning

## Backend 1

Persist AI answers into `assessment_inputs`.

## Backend 2

Build:

- `/ai/start`;
- `/ai/message`;
- `/ai/status`;
- AI context construction;
- timeout/error/retry behavior.

## AI

Build:

- dynamic questions;
- generic questions;
- business-specific questions;
- question selection;
- session state.

## Frontend

Build advisor/chat interface.

### Exit

User can have a multi-turn AI assessment and resume it.

---

# PHASE 5 — RAG + feasibility

## Backend 1

No new intelligence logic. Ensure stable context input.

## Backend 2

Build final-report orchestration and report metadata.

## AI

Build:

- vector ingestion;
- metadata filtering;
- retrieval;
- market analysis;
- competition;
- pricing;
- opportunity;
- SWOT;
- risks;
- recommendation;
- confidence;
- assumptions.

## Frontend

Build result screens.

### Exit

A real assessment produces a grounded structured AI report.

---

# PHASE 6 — Validation + scenario analysis

## Backend 1

Build:

- validation_tasks;
- completion state.

## Backend 2

Build:

- scenario finance API;
- report download endpoint.

## AI

Improve:

- validation recommendation;
- multilingual output;
- evidence notes.

## Frontend

Build:

- scenario slider;
- validation checklist;
- report.

### Exit

End-to-end flow from assessment to final report works.

---

# PHASE 7 — Demo hardening

## Backend 1

- authorization tests;
- security;
- error handling;
- migration-from-empty test.

## Backend 2

- financial edge cases;
- AI timeout;
- report generation failures;
- performance.

## AI

- hallucination testing;
- wrong-location retrieval;
- insufficient-data behavior;
- language testing.

## Frontend

- responsive polish;
- loading states;
- empty/error states;
- demo flow.

### Exit

All acceptance tests pass.

---

# Parallelization rule

Do not make Backend Developer 2 wait for Backend Developer 1 to finish every table.

Use contracts:

```text
DB schema
API schema
AssessmentContext
FinanceResult
AIReport
```

Parallel development is encouraged after Phase 0 contracts are frozen.
