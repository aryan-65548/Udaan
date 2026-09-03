# 01 — Requirements and Final Functionality

## 1. User problem

A rural entrepreneur may have a business idea but lack:

- localized market information;
- understanding of competition;
- pricing context;
- structured business-risk analysis;
- financial literacy;
- clarity around debt repayment;
- a clear checklist of what to validate before borrowing.

The system therefore provides an advisory assessment before loan application.

## 2. Primary user

Rural/semi-urban micro-entrepreneur.

## 3. Secondary users

- CSC operator.
- Field facilitator.

Facilitator functionality is intentionally limited in Phase 1.

## 4. Functional requirements

### FR-01 Authentication

User can:

- register;
- login;
- logout;
- refresh session;
- view profile;
- change language preference.

### FR-02 Consent

Before assessment use, user can explicitly provide:

- terms consent;
- privacy/data-processing consent;
- AI advisory acknowledgement.

### FR-03 Assessment creation

User can create an assessment with:

- location;
- business category;
- preferred language.

### FR-04 Location

User can select:

- state;
- district;
- block;
- village.

The selected location must resolve to a stable backend location ID.

### FR-05 Basic entrepreneur inputs

The system must collect, where relevant:

- previous experience;
- land availability;
- shop/room availability;
- equipment availability;
- expected working hours;
- existing customer relationships;
- available own contribution.

### FR-06 Finance inputs

The system must support user/AI-provided assumptions such as:

- own contribution;
- project cost;
- expected revenue;
- operating cost;
- scheme/interest configuration.

### FR-07 Financial calculation

Backend calculates:

- project financing structure;
- loan amount;
- EMI or equivalent periodic installment;
- total interest;
- total repayment;
- annual debt service;
- DSCR;
- repayment schedule.

### FR-08 Dynamic AI questioning

The AI can ask:

- generic entrepreneur questions;
- business-specific questions;
- clarification questions;
- validation questions.

Questions are not fixed in the backend.

### FR-09 AI market analysis

AI evaluates, using available retrieved evidence and user context:

- local consumer-base potential;
- market reach;
- distribution channels;
- local opportunity areas;
- competition signals;
- pricing guidance;
- threats;
- SWOT;
- business recommendation.

### FR-10 Uncertainty

AI output must distinguish:

- sourced facts;
- estimates;
- user-provided facts;
- AI inference;
- missing evidence.

### FR-11 Feasibility

AI can provide a feasibility score/rating and confidence score.

These are advisory outputs, not loan approval or prediction guarantees.

### FR-12 Report

Report contains:

1. Business idea summary.
2. Entrepreneur context.
3. Location context.
4. Market reach.
5. Opportunity analysis.
6. Competition.
7. Pricing.
8. SWOT.
9. Risks.
10. Financial structure.
11. Repayment.
12. Recommendation.
13. Assumptions.
14. Missing information.
15. Validation checklist.
16. Scheme verification notice.
17. Source/evidence notes.

### FR-13 Multilingual

MVP target:

- English;
- Hindi;
- Gujarati.

### FR-14 Validation checklist

System creates actionable checks such as:

- talk to potential customers;
- visit competitors;
- obtain supplier quotations;
- verify transport cost;
- validate seasonality;
- identify buyers;
- verify utility/workspace requirements;
- verify licences;
- verify current scheme rules.

### FR-15 Resume

User can leave and return to an incomplete assessment.

### FR-16 Scenario calculation

User can change selected financial assumptions and obtain a fresh deterministic financial run without calling AI unless textual interpretation is specifically requested.

## 5. Non-functional requirements

### NFR-01 Explainability

Important recommendations must be traceable to evidence/assumptions.

### NFR-02 Safety

System must state:

- not a loan approval;
- not a guarantee of profit;
- scheme rules should be verified;
- AI outputs are advisory.

### NFR-03 Accessibility

Simple wording, mobile-first layout and language support.

### NFR-04 Reliability

Finance calculations must be deterministic and test-covered.

### NFR-05 Security

Passwords hashed with Argon2/bcrypt. JWT/session security enforced. Users can access only their assessments.

### NFR-06 Extensibility

New business categories and scheme configurations should not require rewriting the assessment engine.

## 6. Explicitly out of scope

- actual loan application submission;
- bank integration;
- government portal integration;
- payment processing;
- KYC;
- credit bureau scoring;
- guarantee of loan eligibility;
- guarantee of business success.

## 7. Product language

Preferred:

- indicative;
- estimated;
- available evidence;
- detected businesses;
- confidence;
- validation required.

Avoid:

- guaranteed;
- approved;
- exact demand;
- exact competitor count unless formally supported;
- guaranteed profit.
