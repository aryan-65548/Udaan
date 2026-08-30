Phase Plan — Two Developer Execution Plan

Team Model

Developer 1 — Backend / Platform

Owns:

Express API

PostgreSQL

Drizzle

Auth

Locations

Assessment state

Assessment inputs

Scheme configs

Finance engine

Repayment schedules

Backend tests

AI gateway/orchestration

Developer 2 — AI / Data / Integration

Owns:

AI service

Vector DB

Ingestion pipeline

RAG

Question generation

AI analysis/report generation

AI structured outputs

AI tests/evaluation

Backend↔AI integration implementation

The frontend engineer consumes the API contracts and is not part of this two-developer backend/AI split.

PHASE 0 — Architecture Freeze

Developer 1

Review 00_MASTER_PLAN.md.

Review 02_DATABASE_SCHEMA.md.

Create Drizzle schema.

Define enums.

Create migration skeleton.

Define REST response/error format.

Developer 2

Review 04_AI_BACKEND_CONTRACT.md.

Define AI service DTOs.

Define vector metadata model.

Select vector DB technology.

Define report JSON schema.

Define question JSON schema.

Exit Criteria

Both developers agree on:

table names

column names

enums

API payloads

AI context schema

report schema

No implementation should change these without a documented decision.

PHASE 1 — Infrastructure

Developer 1

Build:

pnpm workspace

apps/api

PostgreSQL Docker container

Drizzle configuration

migrations

environment validation

Express app

global error handler

request ID middleware

Zod middleware

test setup

Developer 2

Build:

apps/ai

Python/FastAPI service

vector DB connection

LLM provider abstraction

AI environment config

structured output validation

basic health endpoint

Exit Criteria

Postgres healthy
API healthy
AI service healthy
Vector DB reachable
Tests run from root

PHASE 2 — Core User State

Developer 1

Implement:

registration

login

refresh

logout

profile

consent

location hierarchy APIs

business categories

assessment creation

assessment retrieval

assessment update

status transitions

assessment inputs

Developer 2

Prepare knowledge base structure:

business documents

geographic documents

scheme documents

risk/compliance documents

Build ingestion scripts and metadata validation.

Exit Criteria

User can:

register
→ login
→ create assessment
→ select location
→ select business
→ save profile/input data

PHASE 3 — Financial Engine

Developer 1

Implement:

scheme_configs seed data

project-cost/loan calculation

finance validation

EMI/monthly equivalent

periodic installment

moratorium handling

total interest

total repayment

annual debt service

DSCR

repayment schedule

calculation versioning

scenario recalculation

Write unit tests for boundary cases.

Minimum cases:

below micro threshold

exactly at threshold

above threshold

max project cost

max loan cap

moratorium

zero/invalid revenue

DSCR < 1

DSCR > 1

Developer 2

Add scheme documents to RAG.

Validate scheme metadata against source documents.

Build scheme explanation prompt.

Ensure AI treats backend financial values as authoritative.

Exit Criteria

Given known inputs, backend produces reproducible values and schedule.

PHASE 4 — AI Interview

Developer 1

Implement:

/ai/start

/ai/message

/ai/status

context builder

persistence of AI answers into assessment_inputs

AI session ID/status management

Developer 2

Implement:

question generation

question selection logic

generic questions

business-specific questions

follow-up logic

duplicate-question avoidance

minimum/maximum question policy

structured question JSON

Exit Criteria

Flow works:

start
→ AI question
→ user answer
→ persistence
→ next question
→ ...
→ READY_FOR_ANALYSIS

PHASE 5 — RAG + Feasibility Analysis

Developer 1

Finalize backend context payload.

Ensure latest finance run is included.

Add report status handling.

Store feasibility_reports metadata.

Developer 2

Implement:

metadata-filtered retrieval

geographic retrieval

business retrieval

market retrieval

price retrieval

competitor retrieval

risk retrieval

source/evidence references

confidence/limitations

market reach analysis

opportunity analysis

competition interpretation

pricing guidance

SWOT

threat identification

distribution/channel analysis

recommendation

Exit Criteria

Given an assessment, AI produces a structured report without unsupported invented facts.

PHASE 6 — Final Results & Validation

Developer 1

result endpoints

report endpoints

report download gateway

validation task endpoints

ownership checks

final assessment completion

Developer 2

final report rendering JSON

multilingual output

sources/limitations

final validation checklist generation

AI report quality checks

Exit Criteria

Complete journey:

login
→ assessment
→ location
→ business
→ finance
→ AI questions
→ analysis
→ report
→ validation
→ complete
→ dashboard

PHASE 7 — Hardening

Developer 1

auth security review

authorization review

input validation

DB constraints

indexes

transaction boundaries

rate limiting

logging

error handling

integration tests

Developer 2

prompt injection review

hallucination tests

missing-data tests

unsupported-claim tests

language tests

retrieval evaluation

report consistency tests

Exit Criteria

The system can survive malformed data, unavailable AI, missing knowledge, repeated requests, unauthorized assessment access, and calculation edge cases.