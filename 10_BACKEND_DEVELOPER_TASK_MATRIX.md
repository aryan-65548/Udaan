# 10 — Backend Developer Task Matrix

## Purpose

This document resolves exactly who owns what between the two backend/platform developers.

---

# Backend Developer 1 — Platform / State

## Owns these tables

- `users`
- `refresh_tokens`
- `consents`
- `locations`
- `business_categories`
- `assessments`
- `assessment_inputs`
- `validation_tasks`

## Owns these domains

### Authentication

- registration;
- login;
- refresh;
- logout;
- profile;
- authorization middleware.

### Location

- location hierarchy;
- lookup APIs;
- data seeding.

### Assessment

- create;
- update;
- resume;
- status;
- input persistence.

### Validation

- validation task generation;
- task completion;
- notes.

## Primary APIs

- `/auth/*`
- `/users/*`
- `/consents/*`
- `/locations/*`
- `/business-categories/*`
- `/assessments/*` base CRUD
- `/assessments/:id/inputs/*`
- `/assessments/:id/validation/*`

## Deliverables

- database migrations;
- repository/service pattern;
- authentication;
- authorization;
- Zod schemas;
- assessment service;
- input service;
- integration tests.

---

# Backend Developer 2 — Finance / AI Gateway

## Owns these tables

- `scheme_configs`
- `financial_runs`
- `repayment_schedule_items`
- `feasibility_reports`

## Owns these domains

### Finance

- scheme routing;
- project/loan arithmetic;
- EMI/equivalent installment;
- interest;
- DSCR;
- repayment schedules;
- scenario runs.

### AI Gateway

- AssessmentContext construction;
- AI service HTTP client;
- session start;
- AI messaging;
- AI status;
- report integration;
- retries/timeouts.

## Primary APIs

- `/assessments/:id/finance/*`
- `/assessments/:id/ai/*`
- `/assessments/:id/result`
- `/assessments/:id/report*`
- `/schemes/*`

## Deliverables

- finance engine;
- finance test suite;
- scheme configuration seed;
- AI client;
- AI response validation;
- report service;
- finance/report integration tests.

---

# Shared responsibilities

Both developers:

- review DB changes;
- review endpoint contracts;
- maintain clean TypeScript types;
- write integration tests;
- participate in Phase 0;
- participate in demo hardening.

## Rule for overlapping changes

Developer 1 owns assessment state.

Developer 2 consumes assessment state but should not create duplicate assessment persistence.

Developer 2 owns finance persistence.

Developer 1 may read finance results but should not implement the finance engine.

---

# Branches

Suggested:

```text
backend/platform
backend/finance-ai
```

AI engineer:

```text
ai/service
```

Frontend engineer:

```text
frontend/app
```

---

# Integration checkpoints

## Checkpoint A

Developer 1 exposes:

```text
Assessment
Location
Business
Inputs
```

Developer 2 consumes them.

## Checkpoint B

Developer 2 exposes:

```text
FinanceResult
RepaymentSchedule
```

Frontend consumes them.

## Checkpoint C

Developer 2 exposes:

```text
AIQuestion
AIResult
```

Frontend consumes them.

## Checkpoint D

Complete:

```text
Assessment
 -> Finance
 -> AI
 -> Report
```

---

# Parallel work strategy

Do not serialize the team unnecessarily.

While Developer 1 is implementing assessment APIs:

Developer 2 can implement the finance engine against pure TypeScript interfaces.

While Developer 2 implements the AI gateway:

AI engineer can implement mock/real AI responses.

While backend APIs stabilize:

Frontend can use mocked API contracts.

---

# Backend Definition of Done

Backend is ready for frontend integration when:

- clean DB migration succeeds;
- auth works;
- assessment CRUD works;
- location selection works;
- inputs persist;
- finance calculation passes all tests;
- AI gateway handles question/answer flow;
- report metadata is persisted;
- assessment ownership is enforced.