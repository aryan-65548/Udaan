# AI Context Engine — Implementation Phases

## Project

Udaan — AI Context Engine

## Implementation Location

All Context Engine implementation must be contained within:

```text
ai-engine-core/
```

Do not scatter Context Engine implementation across unrelated backend folders.

The Context Engine is the foundation of the Python AI intelligence layer. It prepares reliable, structured business context that will later be consumed by market analysis, competition analysis, demand estimation, pricing intelligence, adaptive questioning, and report generation.

---

# Objective

Build a Context Engine that takes the user's available business information and produces a canonical, validated, normalized, and traceable `AssessmentContext`.

The Context Engine should consume information such as:

* User profile
* User language
* Proposed business
* Business category
* Assessment answers
* User resources
* Financial context
* Location information
* Competition information
* Population information, when available
* Other backend-provided assessment context

The output becomes the standard input for the rest of the AI system.

---

# Architecture

```text
Node.js Backend
      │
      ▼
AI Gateway
      │
      ▼
Python AI Service
      │
      ▼
ai-engine-core/
      │
      ▼
Context Engine
      │
      ├── Input Validation
      ├── Normalization
      ├── Context Construction
      ├── Resource Processing
      ├── Context Quality
      ├── Missing Information Detection
      └── Context Updates
      │
      ▼
Canonical AssessmentContext
      │
      ├── Market Analysis
      ├── Competition Analysis
      ├── Demand Estimation
      ├── Pricing Intelligence
      ├── Adaptive Questioning
      └── Report Generation
```

---

# Phase 0 — Repository and Contract Discovery

## Goal

Understand the existing backend and AI service before implementing anything.

## Tasks

2. Create or update a dedicated AI development branch.
3. Inspect the repository structure.
4. Locate the existing Python AI service, if present.
5. Inspect the backend AI Gateway.
6. Inspect:

   * AI Gateway request schemas
   * AI Gateway response schemas
   * `AiGatewayService`
   * AI routes
   * Assessment schemas
   * Finance service/domain
   * Location Intelligence service
   * Location Intelligence types
   * User/profile-related schemas
   * Resource-related schemas, if present
7. Identify the exact payload sent from Node.js to the Python AI service.
8. Identify the exact response expected by the backend.
9. Document existing fields and their meanings.
10. Identify any contract mismatches or missing fields.

## Deliverables

* Repository inspection notes
* Existing contract documentation
* List of available backend fields
* List of unavailable fields
* List of assumptions that must not be made
* Proposed Context Engine integration boundary

## Exit Criteria

The agent can clearly explain:

* What data the backend already provides
* What data the Context Engine receives
* What the Context Engine must return
* Which responsibilities remain in Node.js
* Which responsibilities belong in Python

---

# Phase 1 — Context Engine Foundation

## Goal

Create the initial Context Engine inside `ai-engine-core/`.

## Tasks

1. Create the `ai-engine-core/` folder if it does not exist.
2. Establish a clean Python package structure.
3. Define the canonical `AssessmentContext` model.
4. Define input request schemas.
5. Define output response schemas.
6. Define context metadata.
7. Define source/provenance representation.
8. Define context versioning.
9. Implement the initial context construction pipeline.

## Expected Flow

```text
Backend Context
      ↓
Input Schema Validation
      ↓
Context Construction
      ↓
Canonical AssessmentContext
```

## Exit Criteria

* The Context Engine can accept valid backend context.
* It produces a validated canonical context.
* The output is deterministic for the same input.
* The implementation is contained in `ai-engine-core/`.

---

# Phase 2 — Context Normalization

## Goal

Convert inconsistent or raw input into a consistent internal representation.

## Tasks

Normalize:

* User information
* Language
* Business category
* Business name/type
* Assessment answers
* Financial values
* Currency
* Location fields
* Coordinates
* Competition fields
* Resource fields
* Optional values
* Dates and timestamps

## Requirements

* Preserve the original meaning of data.
* Do not silently change values.
* Do not invent missing values.
* Distinguish missing, null, unavailable, and zero.
* Preserve source information.
* Preserve relevant raw values when needed for traceability.

## Exit Criteria

All downstream AI modules can rely on a consistent context structure rather than interpreting raw backend payloads independently.

---

# Phase 3 — User Profile, Business, and Resource Context

## Goal

Build a complete representation of the user's business opportunity.

## User Profile Context

Include only information relevant to business advisory reasoning and permitted by the backend contract.

Potential fields:

* User ID or internal reference
* Language
* Relevant experience
* Skills
* Business background
* Other relevant profile information

Do not expose unnecessary personal information to downstream AI modules.

## Business Context

Potential fields:

* Proposed business
* Business category
* Business category ID
* Business stage
* Business description
* Assessment answers
* Intended customer segment, if available
* Intended operating scale, if available

## Resource Context

Represent resources the user already has or can access.

Potential resource categories:

* Available capital
* Land
* Commercial space
* Equipment
* Machinery
* Raw materials
* Workforce
* Skills
* Existing assets
* Infrastructure
* Supplier access
* Other business-relevant resources

## Requirements

* Do not assume a resource exists merely because its field is absent.
* Distinguish:

  * Available
  * Unavailable
  * Unknown
  * User-reported
  * Backend-derived
* Preserve units and currencies.
* Avoid duplicating backend finance calculations.

## Exit Criteria

The Context Engine can represent the user's business, profile, and available resources in a structured and traceable form.

---

# Phase 4 — Location and Existing Intelligence Context

## Goal

Normalize and organize location-related information already provided by the backend.

## Location Context

Potential fields:

* Village
* Block
* District
* State
* Country, if available
* Formatted address
* Latitude
* Longitude
* Location identifier
* Search radius

## Competition Context

Potential fields:

* Competitor count
* Search radius
* Competitor names
* Competitor categories
* Competitor coordinates
* Competitor distances
* Provider
* Retrieval timestamp

## Population Context

Support population information when available.

Potential fields:

* Estimated population
* Geographic scope
* Radius
* Source
* Source date
* Confidence
* Limitations
* Availability status

If population is unavailable:

```text
status = unavailable
value = null
```

Do not fabricate population values.

## Important Boundary

The Context Engine should not unnecessarily reimplement:

* Google Geocoding
* Google Places competitor discovery
* Haversine calculations
* Backend location retrieval

Those responsibilities already belong to the backend unless repository inspection proves otherwise.

## Exit Criteria

Location and existing intelligence are represented consistently and are ready for downstream analysis.

---

# Phase 5 — Context Quality and Missing Information

## Goal

Make the Context Engine aware of what is known, unknown, incomplete, or unreliable.

## Tasks

Implement:

* Required field validation
* Optional field handling
* Missing field detection
* Data availability status
* Source tracking
* Data freshness metadata
* Context completeness assessment
* Context limitations
* Quality indicators
* Missing information categories

## Example

```json
{
  "context_quality": {
    "status": "partial",
    "missing_information": [
      "target_customer_segment",
      "competitor_pricing"
    ],
    "limitations": [
      "Population data unavailable"
    ]
  }
}
```

## Requirements

* Do not use arbitrary confidence percentages.
* Do not treat missing data as zero.
* Do not treat estimates as confirmed facts.
* Do not hide important limitations.
* Do not block the entire context because optional information is missing.

## Exit Criteria

The Context Engine can explain the quality and limitations of the context it produces.

---

# Phase 6 — Context Updates

## Goal

Support updating context when new information arrives during an AI session.

## Tasks

1. Accept new user-provided information.
2. Validate the update.
3. Merge it into the existing context.
4. Preserve existing valid information.
5. Track changed fields.
6. Track the source of new information.
7. Avoid accidental overwrites.
8. Recalculate affected derived fields.
9. Re-evaluate missing information.

## Example

```text
Initial Context:
No commercial space information

User:
"I already own a 1,000 sq ft shop."

Context Update:
commercial_space.available = true
commercial_space.area = 1000
commercial_space.unit = sqft
commercial_space.ownership = owned
source = user_message
```

## Exit Criteria

The Context Engine can safely upd
