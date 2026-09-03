# 03 — Backend API Specification

## 1. Conventions

Base URL:

```text
/api
```

Authentication:

```text
Authorization: Bearer <access-token>
```

JSON request/response.

Success shape:

```json
{
  "data": {}
}
```

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Use Zod for request validation.

## 2. Auth endpoints

### POST /auth/register

Creates user.

Request:

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "phone": "9999999999",
  "password": "..."
}
```

Writes:

- `users`
- initial consent rows only if product policy requires consent at registration.

Response:

- user summary;
- access token;
- refresh token.

### POST /auth/login

Reads:

- users

Writes:

- refresh_tokens

### POST /auth/refresh

Reads:

- refresh_tokens
- users

May rotate refresh token.

### POST /auth/logout

Updates:

- refresh_tokens.revoked_at

### GET /users/me

Reads:

- users

### PATCH /users/me

Updates:

- name
- phone
- preferred_language

## 3. Consent endpoints

### POST /users/me/consents

Creates consent record in:

- `consents`

Request:

```json
{
  "consentType": "PRIVACY",
  "version": "v1",
  "granted": true
}
```

### GET /users/me/consents

Reads:

- `consents`

## 4. Location endpoints

### GET /locations/states

Reads:

- `locations`
- type=STATE

### GET /locations/:stateId/districts

Reads:

- `locations`
- child type=DISTRICT

### GET /locations/:districtId/blocks

Reads:

- `locations`
- child type=BLOCK

### GET /locations/:blockId/villages

Reads:

- `locations`
- child type=VILLAGE

### GET /locations/:id

Reads:

- `locations`

Returns selected location plus parent hierarchy.

No market analysis is performed.

## 5. Business category endpoints

### GET /business-categories

Reads:

- `business_categories`

Returns active categories ordered by sort_order.

### GET /business-categories/:id

Reads:

- `business_categories`

## 6. Assessment endpoints

### POST /assessments

Creates:

- `assessments`

Minimum request:

```json
{
  "locationId": "...",
  "businessCategoryId": "...",
  "language": "gu"
}
```

Sets:

- status=IN_PROGRESS
- ai_status=NOT_STARTED

### GET /assessments

Reads:

- `assessments`

Filter:

- authenticated user

### GET /assessments/:id

Reads:

- assessments
- locations
- business_categories
- latest financial run
- report metadata

### PATCH /assessments/:id

Updates fixed assessment attributes:

- location_id
- business_category_id
- language

Do not use this endpoint for arbitrary AI answer data.

### PATCH /assessments/:id/profile

Updates profile inputs by writing rows to:

- `assessment_inputs`

Examples:

- previous_experience
- has_land
- has_shop
- has_room
- has_equipment
- expected_working_hours
- has_known_customers

### POST /assessments/:id/complete

Marks assessment complete only when minimum required workflow conditions are satisfied.

## 7. Assessment input endpoint

### PUT /assessments/:id/inputs/:inputKey

Upserts one answer.

Example:

```json
{
  "questionText": "How many hours can you work per day?",
  "inputType": "NUMBER",
  "valueNumber": 8,
  "source": "USER"
}
```

Writes:

- `assessment_inputs`

Unique logical key:

- assessment_id + input_key

### GET /assessments/:id/inputs

Reads:

- `assessment_inputs`

Used to build AI context.

## 8. Finance endpoints

### PUT /assessments/:id/finance/inputs

Writes finance-related values into `assessment_inputs`.

Examples:

- own_contribution
- project_cost
- expected_monthly_revenue
- expected_monthly_operating_cost

The finance engine reads these values.

### POST /assessments/:id/finance/calculate

Process:

1. Authenticate.
2. Read assessment.
3. Read relevant `assessment_inputs`.
4. Read `scheme_configs`.
5. Validate applicable scheme configuration.
6. Calculate project/loan structure.
7. Calculate EMI/equivalent installment.
8. Calculate debt service.
9. Calculate DSCR.
10. Generate repayment schedule.
11. Insert `financial_runs`.
12. Insert `repayment_schedule_items`.
13. Return calculation.

### GET /assessments/:id/finance

Reads:

- latest financial run;
- repayment schedule;
- relevant scheme config.

### GET /assessments/:id/finance/runs

Reads historical:

- financial_runs

Useful for scenario history/debugging.

## 9. AI endpoints

### POST /assessments/:id/ai/start

Backend process:

1. Verify assessment ownership.
2. Read users.
3. Read assessments.
4. Read locations.
5. Read business_categories.
6. Read assessment_inputs.
7. Read latest financial_runs.
8. Build `AssessmentContext`.
9. Set assessment `ai_status=QUESTIONING`.
10. Call AI service.
11. Store `ai_session_id`.
12. Return first question.

### POST /assessments/:id/ai/message

Request:

```json
{
  "message": {
    "inputKey": "known_buyers",
    "questionText": "Do you already know potential buyers?",
    "inputType": "BOOLEAN",
    "valueBoolean": true
  }
}
```

Process:

1. Persist answer in `assessment_inputs`.
2. Read current assessment context.
3. Call AI service.
4. Return next question OR analysis status.

### GET /assessments/:id/ai/status

Reads:

- `assessments.ai_status`
- `assessments.ai_session_id`

## 10. Result/report endpoints

### GET /assessments/:id/result

Reads:

- assessments
- latest financial_runs
- latest feasibility_reports

Fetches AI report from configured AI service if required.

### GET /assessments/:id/report

Reads report metadata and obtains AI report content.

### GET /assessments/:id/report/download

Returns generated PDF/document.

## 11. Validation endpoints

### GET /assessments/:id/validation

Reads:

- validation_tasks

If tasks do not exist, backend may seed the standard checklist when the report is finalized.

### PATCH /assessments/:id/validation/:taskId

Updates:

- status
- notes
- completed_at

## 12. Scheme configuration endpoints

For Phase 1, scheme configuration should be read-only to normal users.

### GET /schemes

Returns active public scheme configs if UI needs them.

### GET /schemes/:id

Returns one scheme config.

Admin editing can be Phase 2.

## 13. Public endpoint count

Approximately 25–30 endpoints depending on whether some reads are consolidated.

Do not create CRUD endpoints for every table. Internal persistence tables should not automatically become public APIs.

## 14. Backend data flow

### Location

```text
Frontend
 -> GET locations
 -> PostgreSQL.locations
 -> response
```

### Assessment

```text
Frontend
 -> POST assessment
 -> PostgreSQL.assessments
 -> assessment ID
```

### Dynamic answer

```text
Frontend
 -> PUT input
 -> PostgreSQL.assessment_inputs
```

### Finance

```text
assessment_inputs
 + scheme_configs
 -> Finance Engine
 -> financial_runs
 -> repayment_schedule_items
```

### AI

```text
PostgreSQL context
 -> AI service
 -> Vector DB retrieval
 -> LLM
 -> AI result
 -> Backend
```

## 15. Authorization rule

Every `/assessments/:id/*` endpoint must verify:

```text
assessment.user_id == authenticated_user.id
```

unless the authenticated user has a deliberately implemented facilitator/admin role.
