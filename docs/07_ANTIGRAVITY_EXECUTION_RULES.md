# 07 — Antigravity Execution Rules

## 1. Role of this document

These rules are mandatory when using Antigravity or another AI coding agent.

## 2. First action

Before writing code:

1. inspect repository;
2. inspect package manager files;
3. inspect existing source;
4. inspect existing database/migrations;
5. compare implementation against this pack;
6. report conflicts.

Do not overwrite an existing project blindly.

## 3. Phase discipline

Implement only the current requested phase.

Never automatically implement:

- future phases;
- speculative features;
- admin dashboard;
- advanced analytics;
- new services.

## 4. Database discipline

Do not add a table unless:

- it is in `02_DATABASE_SCHEMA.md`, or
- a deliberate architectural decision is recorded first.

Do not duplicate a fact across multiple tables unless the duplicate is explicitly a historical snapshot.

## 5. API discipline

Use the endpoint contract in `03_BACKEND_API_SPEC.md`.

Do not invent frontend-specific endpoints just because they are convenient.

Prefer one coherent endpoint over CRUD for internal tables.

## 6. Finance discipline

All money calculations must originate in backend code.

Use:

- Decimal-safe arithmetic;
- fixed rounding policy;
- explicit payment frequency;
- explicit moratorium treatment;
- calculation version.

Never calculate financial values using JavaScript floating point without a deliberate money strategy.

## 7. AI boundary

Backend sends context to AI.

AI does not directly connect to PostgreSQL.

AI may return:

- questions;
- analysis;
- report;
- evidence references.

Backend validates the AI response.

## 8. RAG boundary

Vector DB is knowledge.

PostgreSQL is application state.

Do not store assessment answer history as embeddings.

## 9. Security

- Validate every input with Zod.
- Hash passwords.
- Do not log passwords or refresh tokens.
- Enforce assessment ownership.
- Sanitize errors.
- Keep secrets in environment variables.
- Do not commit `.env`.

## 10. Tests

Every phase must include tests.

Minimum:

- unit tests for finance;
- endpoint tests for auth;
- assessment integration test;
- AI contract/schema test;
- authorization tests.

## 11. Error handling

Every external dependency must have failure handling:

- AI service;
- vector DB;
- database;
- report generation.

Never leave requests hanging indefinitely.

## 12. Code quality

- TypeScript strict mode.
- ESLint.
- Prettier.
- typed service boundaries.
- no `any` unless explicitly justified.
- small modules.
- descriptive names.

## 13. Git discipline

Each feature should be independently reviewable.

Suggested commits:

```text
feat(auth): implement registration and login
feat(assessment): add assessment lifecycle
feat(finance): add repayment engine
feat(ai): add ai gateway
test(finance): add dscr edge cases
```

## 14. When uncertain

Do not guess.

If the question concerns:

- scheme rules;
- a financial convention;
- external API licensing;
- business eligibility;

mark it as a blocker and consult the relevant source/owner.

## 15. Completion report

At the end of each implementation phase, report:

- files changed;
- migrations added;
- endpoints added;
- tests added;
- tests run;
- known limitations;
- next recommended phase.
