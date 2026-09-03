# 11 — Integration Checklist

## Before coding

- [ ] Read all master docs.
- [ ] Freeze enums.
- [ ] Freeze `AssessmentContext`.
- [ ] Freeze AI report JSON.
- [ ] Freeze finance result JSON.
- [ ] Freeze endpoint paths.

## Database

- [ ] PostgreSQL starts from Docker.
- [ ] Drizzle migrations apply from empty DB.
- [ ] Seed script creates locations.
- [ ] Seed script creates business categories.
- [ ] Seed script creates scheme configs.
- [ ] Foreign keys work.
- [ ] Indexes exist.

## Backend

- [ ] Auth works.
- [ ] Ownership checks work.
- [ ] Assessment creation works.
- [ ] Assessment inputs persist.
- [ ] Finance calculations are deterministic.
- [ ] Repayment schedule reconciles.
- [ ] AI gateway validates response schema.
- [ ] Report references persist.
- [ ] Validation tasks persist.

## AI

- [ ] AI service starts.
- [ ] Vector DB connection works.
- [ ] Test documents are indexed.
- [ ] Metadata filters work.
- [ ] Dynamic questions work.
- [ ] Final report JSON validates.
- [ ] Insufficient-data behavior works.
- [ ] Language output works.

## Frontend

- [ ] Login.
- [ ] Dashboard.
- [ ] Assessment.
- [ ] Location.
- [ ] Business.
- [ ] Profile.
- [ ] Finance.
- [ ] AI interview.
- [ ] Results.
- [ ] Scenario.
- [ ] Validation.
- [ ] Report.

## Demo

- [ ] One stable demo location.
- [ ] One stable business category.
- [ ] Seeded finance configuration.
- [ ] Seeded RAG knowledge.
- [ ] Demo user.
- [ ] Rehearsed failure scenario.
- [ ] Rehearsed report download.
