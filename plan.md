# AI Context Engine — Implementation Plan

## Project

Udaan

## Target Folder

```text
ai-engine-core/
```

## Objective

Build a Python-based Context Engine that receives the backend's assessment context and converts it into a canonical `AssessmentContext`.

This canonical context will become the shared input for all future AI intelligence modules.

---

# 1. Problem Statement

The backend already collects and provides important business information, including:

* User context
* Assessment answers
* Business category
* Finance context
* Location information
* Competition information

However, downstream AI modules need a consistent, validated, and traceable representation of that information.

Without a shared context layer:

* Each AI module may interpret fields differently.
* Missing data may be confused with zero values.
* Data sources may be lost.
* Context updates may become inconsistent.
* External intelligence may be attached inconsistently.
* AI modules may duplicate normalization logic.

The Context Engine solves this by creating a shared canonical context.

---

# 2. Core Design Principle

```text
Backend = Application Data Authority

Context Engine = AI Context Authority

AI Modules = Analysis and Reasoning
```

The Context Engine is not a replacement for the backend database.

It is the authoritative representation of the information available to the AI system for a particular assessment.

---

# 3. Scope

## In Scope

* Context input validation
* Canonical context schema
* User profile context
* Business context
* Assessment answer context
* Resource context
* Finance context normalization
* Location context normalization
* Competition context normalization
* Population context representation
* Data provenance
* Context quality
* Missing information detection
* Context updates
* Serialization
* Unit tests
* Integration boundary with FastAPI

## Out of Scope for Initial Version

* Full market analysis
* Full demand forecasting
* Pricing recommendation engine
* Final business report generation
* Autonomous business decisions
* Rebuilding Google Places integration
* Rebuilding backend finance calculations
* Building a large vector database
* Building a complete RAG system
* Collecting every external dataset
* Replacing the Node.js backend
* Implementing all adaptive questioning logic

---

# 4. High-Level Architecture

```text
                    Backend
                       │
                       ▼
                 AI Gateway
                       │
                       ▼
              Python AI Service
                       │
                       ▼
                 ai-engine-core
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Schemas      Services      Quality
          │            │            │
          └────────────┼────────────┘
                       ▼
              AssessmentContext
                       │
                       ▼
             Future AI Intelligence
```

---

# 5. Proposed Internal Structure

The exact structure may be adapted after inspecting the existing repository.

A suggested starting structure:

```text
ai-engine-core/
│
├── __init__.py
│
├── README.md
│
├── pyproject.toml
│
├── src/
│   └── ai_engine_core/
│       │
│       ├── __init__.py
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── input.py
│       │   ├── context.py
│       │   ├── resources.py
│       │   ├── location.py
│       │   ├── finance.py
│       │   ├── competition.py
│       │   └── quality.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── context_builder.py
│       │   ├── context_normalizer.py
│       │   ├── context_updater.py
│       │   └── context_quality.py
│       │
│       ├── provenance/
│       │   ├── __init__.py
│       │   └── source_tracking.py
│       │
│       ├── exceptions.py
│       └── config.py
│
└── tests/
    ├── test_context_builder.py
    ├── test_context_normalizer.py
    ├── test_context_updater.py
    ├── test_context_quality.py
    └── test_schemas.py
```

### Important

This is a proposed structure, not a command to duplicate existing files.

If the repository already has a Python package structure, integrate into it rather than creating a conflicting second architecture.

---

# 6. Canonical Context Design

The Context Engine should produce a canonical context conceptually similar to:

```json
{
  "context_version": "1.0",
  "assessment": {
    "assessment_id": "string"
  },
  "user": {
    "user_id": "string",
    "language": "string"
  },
  "business": {
    "category_id": "string",
    "category_name": "string",
    "proposed_business": "string",
    "stage": "string",
    "answers": {}
  },
  "resources": {},
  "finance": {},
  "location": {},
  "competition": {},
  "population": {},
  "context_quality": {},
  "provenance": {}
}
```

This is a conceptual starting point.

The actual schema must be derived from the repository's implemented backend contract.

---

# 7. Context Construction Pipeline

Implement a clear pipeline:

```text
Raw Backend Context
        ↓
Input Validation
        ↓
Field Extraction
        ↓
Normalization
        ↓
Resource Mapping
        ↓
Location Mapping
        ↓
Finance Mapping
        ↓
Competition Mapping
        ↓
Population Mapping
        ↓
Quality Assessment
        ↓
Provenance Attachment
        ↓
Canonical AssessmentContext
```

Each stage should have a clear responsibility.

Avoid one large function that performs all transformations, validation, and business reasoning.

---

# 8. Data Handling Rules

## Missing vs Null vs Zero

These must remain distinct.

Examples:

```text
budget = 0
```

means a reported zero value.

```text
budget = null
```

means no value was supplied.

```text
population.status = unavailable
```

means population information is not currently available.

Do not convert all of these into the same representation.

---

## Source Tracking

Every important field or logical data group should be traceable.

Potential source types:

* `backend_assessment`
* `backend_finance`
* `backend_location`
* `backend_competition`
* `user_message`
* `external_dataset`
* `derived`
* `unknown`

The exact representation can be designed during implementation.

---

## No Fabrication

The Context Engine must never invent:

* Population
* Budget
* User resources
* Competitor prices
* Business experience
* Location details
* Financial values

If information is unavailable, represent it as unavailable or missing.

---

# 9. User and Business Context

The Context Engine should represent:

### User

* Internal user reference, where required
* Language
* Relevant business experience
* Relevant skills
* Other permitted business-related profile information

### Business

* Proposed business
* Category
* Category ID
* Business stage
* Business description
* Assessment answers
* Intended customer segment, if available
* Intended operating scale, if available

The Context Engine should not make market conclusions at this stage.

For example:

```text
Context Engine:
"The user proposes a pharmacy."

Market Analyzer:
"The area may have an underserved healthcare segment."
```

---

# 10. Resource Context

Resources represent what the user has or can access for the proposed business.

Possible categories:

```text
Financial Resources
- Available capital
- Loan access, if explicitly provided
- Savings, if explicitly provided

Physical Resources
- Land
- Shop
- Building
- Equipment
- Machinery
- Vehicles
- Infrastructure

Human Resources
- Skills
- Experience
- Workforce
- Family support, if explicitly relevant

Operational Resources
- Supplier access
- Raw materials
- Distribution access
- Existing business assets
```

### Rules

* Do not infer ownership from mere mention.
* Do not infer availability from absence of a negative answer.
* Preserve units.
* Preserve currencies.
* Preserve whether information is user-reported or backend-derived.
* Avoid duplicating backend finance calculations.

---

# 11. Location and Competition Context

The Context Engine should consume existing backend location intelligence.

It should normalize:

* Geographic hierarchy
* Coordinates
* Formatted address
* Search radius
* Competitor list
* Competitor categories
* Distances
* Provider metadata
* Retrieval timestamps

It should not unnecessarily rebuild location discovery.

The Context Engine prepares location data.

The future Competition Analyzer interprets it.

---

# 12. Population Context

The first version should support population information as a structured field.

Possible states:

```text
available
estimated
unavailable
```

Potential metadata:

* Value
* Unit
* Geographic scope
* Radius
* Source
* Source date
* Confidence
* Limitations

The Context Engine may support externally enriched population data later, but it must not fabricate values.

---

# 13. Context Quality

The Context Engine should calculate or represent quality based on actual evidence.

Possible quality dimensions:

* Required field completeness
* Optional field completeness
* Source availability
* Source reliability
* Geographic specificity
* Population availability
* Competition completeness
* Finance completeness
* Resource completeness
* Data freshness

Do not create arbitrary confidence scores without a documented basis.

A first version may use categorical quality states such as:

```text
complete
partial
insufficient
```

with explicit missing fields and limitations.

A numerical score should only be added if its calculation is meaningful and documented.

---

# 14. Context Updates

The Context Engine must support incremental updates.

Example:

```text
Initial:
No equipment information.

User:
"I already own two refrigerators."

Update:
equipment = [
  {
    "type": "refrigerator",
    "quantity": 2,
    "availability": "available",
    "source": "user_message"
  }
]
```

Updates must:

* Validate new data
* Preserve existing data
* Avoid accidental overwrites
* Track changed fields
* Update provenance
* Recalculate affected quality fields

---

# 15. API / Integration Strategy

The Context Engine must integrate with the existing Python AI service.

Do not invent a new external API without checking the existing architecture.

First determine:

* Whether FastAPI already exists
* Where routes are defined
* Where AI service orchestration exists
* How backend requests are received
* How sessions are represented
* How reports are returned

Then expose the Context Engine through the appropriate internal service boundary.

Possible internal interface:

```python
context = context_engine.build_context(backend_payload)
```

Possible update interface:

```python
updated_context = context_engine.update_context(
    existing_context,
    new_information
)
```

These are conceptual interfaces. Adapt them to the actual repository architecture.

---

# 16. Error Handling

The Context Engine should handle:

* Invalid request payloads
* Missing required fields
* Invalid types
* Invalid coordinates
* Invalid financial values
* Malformed competition data
* Malformed resource data
* Unexpected backend fields
* Unsupported values
* Serialization errors

Errors should be:

* Structured
* Logged appropriately
* Safe for API responses
* Free of secrets
* Free of internal stack traces in user-facing responses

---

# 17. Testing Strategy

## Unit Tests

Test each major component independently.

## Schema Tests

Verify:

* Valid input
* Invalid input
* Optional fields
* Null values
* Serialization
* Deserialization

## Normalization Tests

Verify:

* Location normalization
* Finance normalization
* Resource normalization
* Competition normalization
* Population normalization

## Quality Tests

Verify:

* Missing data detection
* Quality states
* Limitations
* Source tracking

## Update Tests

Verify:

* New fields
* Existing field updates
* Preservation of data
* Provenance changes
* Invalid updates

## Integration Tests

Verify:

```text
Backend Payload
      ↓
Context Engine
      ↓
Canonical Context
```

---

# 18. Definition of Done

The Context Engine is complete for its initial milestone when:

* `ai-engine-core/` exists and is integrated correctly.
* The actual backend contract has been inspected.
* Canonical context schemas are implemented.
* Context construction works.
* Input validation works.
* Normalization works.
* User/business/resource context works.
* Finance/location/competition context works.
* Missing data is represented correctly.
* Provenance is preserved.
* Context quality is represented.
* Context updates work.
* Tests pass.
* Documentation exists.
* The Context Engine can be consumed by future AI modules.
* No unnecessary backend functionality has been duplicated.
* No secrets are hardcoded.

---

# 19. Explicit Non-Goals

Do not declare the following complete merely because the Context Engine works:

* Market analysis
* Demand estimation
* Pricing recommendations
* Full adaptive questioning
* Final report generation
* Advanced RAG
* Vector database implementation
* Complete external intelligence platform

Those are future modules that consume the canonical context.

---

# Final Goal

Build the foundation that answers:

> "What do we reliably know about this user's proposed business opportunity, where did that information come from, what is missing, and how can the rest of the AI system use it?"
