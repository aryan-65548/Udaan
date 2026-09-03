# 08 — Demo Acceptance Tests

## 1. Goal

The MVP is accepted when a judge can follow the full flow without manual database intervention.

## Test 1 — Registration

Given a new user:

1. register;
2. accept required consent;
3. login;
4. reach dashboard.

Expected:

- user in `users`;
- consent in `consents`;
- refresh token/session exists.

## Test 2 — Location selection

User chooses:

```text
State -> District -> Block -> Village
```

Expected:

- valid hierarchy;
- assessment stores `location_id`;
- AI context contains full location path and codes.

## Test 3 — Business selection

User chooses a business category.

Expected:

- `business_category_id` saved;
- AI context contains category ID and name.

## Test 4 — Dynamic answer

AI asks:

> Do you already have potential customers?

User selects Yes.

Expected:

- one `assessment_inputs` record;
- AI receives the answer on the next turn.

## Test 5 — Finance calculation

Given:

```text
own contribution = ₹100,000
project cost = ₹1,000,000
```

Expected:

- loan calculation follows active scheme configuration;
- result is deterministic;
- no LLM arithmetic is used.

## Test 6 — Finance edge case

Given a project at a scheme boundary.

Expected:

- correct min/max scheme rule;
- financing cap respects both financing percentage and maximum loan;
- no value exceeds configured maximum.

## Test 7 — DSCR

Given known revenue, operating cost and debt service.

Expected:

```text
DSCR = cash available for debt service / debt service
```

with documented conventions.

## Test 8 — Repayment schedule

Expected:

- correct number of schedule items;
- correct sequence;
- opening/closing principal reconcile;
- moratorium rows handled explicitly.

## Test 9 — AI questioning

AI asks at least:

- one generic question;
- one business-specific question.

Expected:

- questions are not hard-coded in frontend;
- answers persist in `assessment_inputs`.

## Test 10 — RAG

For a known business/location:

Expected:

- retrieval filters include business and location metadata;
- source metadata is returned;
- stale data is labeled.

## Test 11 — Insufficient data

Simulate missing competitor data.

Expected:

AI says competition evidence is incomplete and recommends field validation.

It must not fabricate an exact competitor count.

## Test 12 — Feasibility report

Expected sections:

- market;
- opportunity;
- competition;
- pricing;
- SWOT;
- threats;
- financial context;
- recommendation;
- limitations;
- validation.

## Test 13 — Scenario

Change monthly revenue.

Expected:

- new finance run;
- new DSCR;
- new repayment/cash metrics where applicable;
- previous run preserved.

No AI call is required for arithmetic.

## Test 14 — Authorization

User A must not retrieve User B's assessment.

Expected:

HTTP 403 or 404 according to chosen security convention.

## Test 15 — Resume

User leaves assessment midway.

After logging back in:

- assessment appears on dashboard;
- previous answers are intact;
- user resumes at correct stage.

## Test 16 — Report

User downloads report.

Expected:

- report belongs to correct assessment;
- language is correct;
- financial numbers agree with latest selected run;
- no unsupported “approval” language.

## Test 17 — Completion

After final validation:

- assessment becomes COMPLETED;
- dashboard shows completed assessment.

## Demo golden path

Use one fixed seed/demo scenario:

```text
Location: one prepared village
Business: one supported category
Own contribution: ₹1,00,000
```

The demo should be rehearsed end-to-end before judging.
