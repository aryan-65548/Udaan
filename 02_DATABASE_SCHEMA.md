# 02 — Backend Database Schema

## 1. Database

- PostgreSQL.
- Drizzle ORM.
- PostgreSQL is the source of truth for application state.
- PostGIS is optional in Phase 1; latitude/longitude columns are sufficient unless backend geospatial querying becomes necessary.

## 2. Tables

Exactly 12 Phase-1 tables.

---

## 2.1 users

Purpose: login account and profile.

| Column | Type | Nullable | Constraints |
|---|---|---:|---|
| id | uuid | no | PK |
| name | varchar(100) | no | |
| email | varchar(255) | yes | unique |
| phone | varchar(15) | yes | unique |
| password_hash | text | no | |
| role | enum | no | ENTREPRENEUR/FACILITATOR/ADMIN |
| preferred_language | varchar(10) | no | en/hi/gu |
| is_active | boolean | no | default true |
| created_at | timestamptz | no | |
| updated_at | timestamptz | no | |

At least one of email/phone should be required at application validation level.

Indexes:

- unique email when non-null;
- unique phone when non-null.

---

## 2.2 refresh_tokens

Purpose: persistent login sessions.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| user_id | uuid | no |
| token_hash | text | no |
| expires_at | timestamptz | no |
| revoked_at | timestamptz | yes |
| created_at | timestamptz | no |

FK:

- user_id -> users.id

Index:

- user_id
- expires_at

---

## 2.3 consents

Purpose: consent history.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| user_id | uuid | no |
| consent_type | enum | no |
| version | varchar(30) | no |
| granted | boolean | no |
| granted_at | timestamptz | yes |
| revoked_at | timestamptz | yes |
| ip_address | varchar(45) | yes |
| created_at | timestamptz | no |

Consent types:

- TERMS
- PRIVACY
- AI_ADVISORY

FK:

- user_id -> users.id

---

## 2.4 locations

Purpose: stable location identity.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| name | varchar(150) | no |
| type | enum | no |
| parent_id | uuid | yes |
| state_code | varchar(20) | yes |
| district_code | varchar(20) | yes |
| block_code | varchar(20) | yes |
| village_code | varchar(30) | yes |
| latitude | decimal(9,6) | yes |
| longitude | decimal(9,6) | yes |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |

Types:

- STATE
- DISTRICT
- BLOCK
- VILLAGE

FK:

- parent_id -> locations.id

Indexes:

- parent_id
- type
- state_code/district_code/block_code
- unique village_code where available

This table is NOT a market-data table.

---

## 2.5 business_categories

Purpose: backend master list.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| code | varchar(50) | no |
| name | varchar(100) | no |
| description | text | yes |
| parent_id | uuid | yes |
| is_active | boolean | no |
| sort_order | integer | no |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |

Example codes:

- DAIRY_FARMING
- GROCERY_RETAIL
- TAILORING
- FOOD_PROCESSING
- MOBILE_REPAIR
- TRANSPORT
- SMALL_MANUFACTURING
- AGRICULTURE_SERVICE

FK:

- parent_id -> business_categories.id

---

## 2.6 scheme_configs

Purpose: authoritative structured financial rules used by backend.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| scheme_code | varchar(50) | no |
| scheme_name | varchar(150) | no |
| min_project_cost | decimal(14,2) | yes |
| max_project_cost | decimal(14,2) | yes |
| financing_percentage | decimal(6,3) | yes |
| max_loan_amount | decimal(14,2) | yes |
| interest_rate | decimal(6,3) | yes |
| tenure_months | integer | yes |
| moratorium_months | integer | yes |
| payment_frequency | enum | yes |
| beneficiary_type | varchar(100) | yes |
| income_limit | decimal(14,2) | yes |
| effective_from | date | no |
| effective_to | date | yes |
| source_name | varchar(200) | no |
| source_reference | text | no |
| is_active | boolean | no |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |

Payment frequencies:

- MONTHLY
- QUARTERLY
- YEARLY

Important:

- Eligibility is not a guaranteed approval.
- Scheme configs must be verified against authoritative current material before demo/deployment.
- Historical records should not be silently altered.

---

## 2.7 assessments

Purpose: central application entity.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| user_id | uuid | no |
| location_id | uuid | no |
| business_category_id | uuid | no |
| language | varchar(10) | no |
| status | enum | no |
| ai_status | enum | no |
| ai_session_id | varchar(100) | yes |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |
| completed_at | timestamptz | yes |

Assessment status:

- DRAFT
- IN_PROGRESS
- AI_QUESTIONING
- AI_ANALYZING
- REPORT_READY
- COMPLETED
- FAILED

AI status:

- NOT_STARTED
- QUESTIONING
- ANALYZING
- COMPLETED
- FAILED

FKs:

- user_id -> users.id
- location_id -> locations.id
- business_category_id -> business_categories.id

Indexes:

- user_id
- status
- location_id
- business_category_id

---

## 2.8 assessment_inputs

Purpose: all dynamic/user-provided/AI-question answers.

Do not create separate profile-answer tables in Phase 1.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| assessment_id | uuid | no |
| input_key | varchar(100) | no |
| question_text | text | yes |
| input_type | enum | no |
| value_text | text | yes |
| value_number | decimal(14,2) | yes |
| value_boolean | boolean | yes |
| value_json | jsonb | yes |
| source | enum | no |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |

Input types:

- TEXT
- NUMBER
- BOOLEAN
- SELECT
- MULTI_SELECT
- DATE
- JSON

Source:

- USER
- AI
- SYSTEM

Only one value representation should normally be populated for a given answer.

Examples:

- `own_contribution` -> NUMBER
- `has_existing_buyers` -> BOOLEAN
- `supplier_location` -> TEXT
- `number_of_animals` -> NUMBER
- complex response -> JSON

Indexes:

- assessment_id
- assessment_id + input_key

---

## 2.9 financial_runs

Purpose: immutable-ish snapshots of deterministic calculations.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| assessment_id | uuid | no |
| scheme_config_id | uuid | yes |
| project_cost | decimal(14,2) | no |
| own_contribution | decimal(14,2) | no |
| loan_amount | decimal(14,2) | no |
| monthly_revenue | decimal(14,2) | yes |
| monthly_operating_cost | decimal(14,2) | yes |
| interest_rate | decimal(6,3) | no |
| tenure_months | integer | no |
| moratorium_months | integer | no |
| payment_frequency | enum | no |
| emi | decimal(14,2) | yes |
| installment_amount | decimal(14,2) | yes |
| annual_debt_service | decimal(14,2) | yes |
| dscr | decimal(8,4) | yes |
| total_interest | decimal(14,2) | yes |
| total_repayment | decimal(14,2) | yes |
| calculation_version | varchar(30) | no |
| created_at | timestamptz | no |

FK:

- assessment_id -> assessments.id
- scheme_config_id -> scheme_configs.id

Indexes:

- assessment_id
- scheme_config_id

Why this is a RUN:

If a user changes assumptions, create a new calculation run rather than overwriting history.

---

## 2.10 repayment_schedule_items

Purpose: detailed periodic schedule.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| financial_run_id | uuid | no |
| sequence_number | integer | no |
| period_start | date | no |
| period_end | date | no |
| due_date | date | no |
| opening_principal | decimal(14,2) | no |
| principal_payment | decimal(14,2) | no |
| interest_payment | decimal(14,2) | no |
| installment_amount | decimal(14,2) | no |
| closing_principal | decimal(14,2) | no |
| is_moratorium | boolean | no |
| created_at | timestamptz | no |

FK:

- financial_run_id -> financial_runs.id

Indexes:

- financial_run_id
- unique(financial_run_id, sequence_number)

The moratorium treatment must follow the configured financial model. Do not invent capitalization rules if the applicable official terms do not specify them.

---

## 2.11 feasibility_reports

Purpose: backend reference to AI-generated assessment output.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| assessment_id | uuid | no |
| ai_report_id | varchar(100) | no |
| status | enum | no |
| feasibility_score | decimal(5,2) | yes |
| confidence_score | decimal(5,2) | yes |
| report_language | varchar(10) | no |
| report_version | varchar(30) | no |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |

Status:

- GENERATING
- COMPLETED
- FAILED

FK:

- assessment_id -> assessments.id

A full narrative report does not need to be duplicated here for Phase 1.

---

## 2.12 validation_tasks

Purpose: field validation workflow.

| Column | Type | Nullable |
|---|---|---:|
| id | uuid | no |
| assessment_id | uuid | no |
| task_key | varchar(100) | no |
| task_text | text | no |
| status | enum | no |
| notes | text | yes |
| completed_at | timestamptz | yes |
| created_at | timestamptz | no |
| updated_at | timestamptz | no |

Status:

- PENDING
- COMPLETED
- SKIPPED

FK:

- assessment_id -> assessments.id

## 3. Relationship summary

```text
users
 |
 +-- refresh_tokens
 +-- consents
 |
 +-- assessments
      |
      +-- locations
      +-- business_categories
      +-- assessment_inputs
      +-- financial_runs
      |      |
      |      +-- scheme_configs
      |      +-- repayment_schedule_items
      |
      +-- feasibility_reports
      +-- validation_tasks
```

## 4. Data ownership rule

PostgreSQL stores:

- identity;
- workflow;
- answers;
- finance inputs/outputs;
- report reference;
- validation status.

It does NOT store the AI's geographic/market knowledge corpus.

## 5. Migration rule

Every schema change requires:

1. Drizzle migration.
2. Migration test on clean DB.
3. Update this document.
4. Update affected API contract.
