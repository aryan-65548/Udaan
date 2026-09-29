# UDAAN — AI CONTEXT ENGINE IMPLEMENTATION PROMPT

You are the AI Engineering Agent for the Udaan project.

Your immediate assignment is to build the **AI Context Engine**.

You are NOT being asked to implement the entire AI intelligence platform yet.

Your task is to build the foundational context-processing layer that will become the standard input for all future AI modules.

---

# 1. PRIMARY OBJECTIVE

Build a reliable, validated, normalized, and traceable Context Engine inside:

```text
ai-engine-core/
```

The Context Engine must take the user's available information and backend-provided assessment context, then produce a canonical:

```text
AssessmentContext
```

This canonical context will later be consumed by:

* Market Analysis
* Competition Analysis
* Demand Estimation
* Pricing Intelligence
* Adaptive Questioning
* Report Generation
* External Intelligence Enrichment

Your immediate goal is to make the context layer correct, stable, testable, and integrable.

---

# 2. NON-NEGOTIABLE FOLDER REQUIREMENT

## All Context Engine implementation must be located in:

```text
ai-engine-core/
```

This includes, where appropriate:

* Context schemas
* Context models
* Context builders
* Normalizers
* Resource models
* Location models
* Finance models
* Competition models
* Population models
* Context quality
* Provenance
* Context update logic
* Context Engine tests
* Context Engine documentation

Do not scatter Context Engine logic across unrelated folders.

If the existing repository already has a Python package structure, integrate cleanly into it while keeping the Context Engine's implementation clearly contained within `ai-engine-core/`.

Do not create duplicate architectures unnecessarily.

---

# 3. IMPORTANT: INSPECT BEFORE CODING

Before writing implementation code, inspect the actual repository.

The repository's existing implementation is the source of truth.

Do not assume the backend is missing functionality simply because this prompt describes it.

Do not invent a different backend contract.

Do not rebuild existing backend functionality unnecessarily.

---

# 4. FIRST ACTIONS

Before implementation:

```bash
git fetch origin
git checkout main
git pull origin main
```

Then create or update a dedicated AI development branch.

Example:

```bash
git checkout -b ai-context-engine
```

If the branch already exists:

```bash
git checkout ai-context-engine
git merge origin/main
```

Do not directly develop on `main`.

---

# 5. REPOSITORY INSPECTION CHECKLIST

Inspect the repository structure and identify:

## Backend

* AI Gateway request schemas
* AI Gateway response schemas
* `AiGatewayService`
* AI routes
* Assessment schemas
* Assessment service
* Finance service/domain
* Location Intelligence service
* Location Intelligence types
* User/profile-related schemas
* Resource-related schemas
* AI session-related schemas

## Python AI Service

Determine:

* Whether a Python/FastAPI service already exists
* Its folder structure
* Its package manager
* Its dependency management
* Its existing routes
* Its existing service layer
* Its existing schemas
* Its existing tests
* Its configuration system
* Its logging system

## Contract Discovery

Determine exactly:

1. What request does Node.js send to Python?
2. What response does Node.js expect from Python?
3. What fields are required?
4. What fields are optional?
5. How are AI sessions represented?
6. How are AI messages represented?
7. How are reports represented?
8. Where should the Context Engine be integrated?
9. Does context persistence already exist?
10. Which fields are unavailable?

Do not proceed to full implementation until the existing contract is understood.

---

# 6. CONTEXT ENGINE RESPONSIBILITY

The Context Engine is responsible for answering:

> "What do we reliably know about this user's proposed business opportunity, where did the information come from, what is missing, and how should the rest of the AI system consume it?"

It is NOT responsible for making every business decision.

---

# 7. INPUTS TO THE CONTEXT ENGINE

The Context Engine should support the information actually available from the backend contract.

Potential input groups include:

## User Profile

* User reference
* Language
* Relevant business experience
* Relevant skills
* Other business-relevant profile information

Do not expose unnecessary personal information.

## Proposed Business

* Proposed business
* Business category
* Category ID
* Business description
* Business stage
* Assessment answers
* Intended customer segment, if available
* Intended operating scale, if available

## User Resources

Represent resources the user already has or can access.

Potential categories:

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
* Other relevant resources

Do not assume these fields exist. Inspect the backend first.

## Finance

Consume backend-provided financial context.

Do not unnecessarily recreate backend finance calculations.

## Location

Consume backend-provided location information such as:

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

## Competition

Consume backend-provided competition information such as:

* Nearby competitors
* Competitor names
* Competitor categories
* Competitor coordinates
* Competitor distances
* Search radius
* Total competitors
* Provider metadata
* Retrieval timestamp

## Population

Support population information if available.

If unavailable, represent it explicitly as unavailable.

Do not fabricate population values.

---

# 8. OUTPUT: CANONICAL ASSESSMENT CONTEXT

Build a canonical structured context model.

A conceptual example:

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

IMPORTANT:

This is only a conceptual example.

The actual model must be based on the repository's real backend contract.

Do not blindly copy this schema if it conflicts with the implemented backend.

---

# 9. REQUIRED CONTEXT ENGINE CAPABILITIES

## A. Input Validation

Validate incoming context.

Handle:

* Missing required fields
* Invalid types
* Invalid nested objects
* Invalid coordinates
* Invalid financial values
* Invalid resource values
* Malformed competition data
* Unexpected or unsupported values

Use structured validation.

Do not allow malformed data to silently enter the canonical context.

---

## B. Normalization

Normalize raw backend data into a consistent internal representation.

Normalize:

* User fields
* Business fields
* Assessment answers
* Financial values
* Currency
* Location fields
* Coordinates
* Competition fields
* Resource fields
* Population fields
* Optional values
* Timestamps

Rules:

* Preserve original meaning.
* Do not silently alter values.
* Do not invent missing values.
* Preserve source information.
* Distinguish null, missing, unavailable, and zero.
* Preserve units and currencies.

---

## C. User Profile Context

Build a structured user context using only relevant and permitted fields.

Potential fields:

* User reference
* Language
* Relevant experience
* Relevant skills
* Business background

Do not include unnecessary personal information.

Do not infer sensitive personal attributes.

---

## D. Business Context

Build a structured representation of the proposed business.

Potential fields:

* Proposed business
* Business category
* Category ID
* Business stage
* Business description
* Assessment answers
* Target customer segment, if available
* Operating scale, if available

Do not perform market analysis here.

Do not make business viability conclusions here.

---

## E. Resource Context

Build a structured representation of user resources.

Possible categories:

* Financial
* Physical
* Human
* Operational

Examples:

```text
Available capital
Land
Commercial space
Equipment
Machinery
Raw materials
Workforce
Skills
Existing assets
Supplier access
```

Rules:

* Do not infer availability from missing fields.
* Do not infer ownership without evidence.
* Preserve units.
* Preserve currency.
* Preserve source.
* Distinguish available, unavailable, and unknown.
* Do not duplicate backend finance calculations.

---

## F. Finance Context

Normalize and preserve backend finance information.

Do not recreate backend finance calculations unless repository inspection proves a specific missing transformation is required.

Do not produce financial recommendations in the Context Engine.

---

## G. Location Context

Normalize backend location information.

Support fields that actually exist in the backend contract.

Do not unnecessarily rebuild:

* Google Geocoding
* Google Places
* Competitor discovery
* Haversine distance calculations
* Radius filtering

Those responsibilities already belong to backend Location Intelligence unless inspection proves otherwise.

The Context Engine prepares the data for future analysis.

---

## H. Competition Context

Normalize the competitor information received from the backend.

Preserve:

* Competitor identity
* Category
* Coordinates
* Distance
* Search radius
* Total count
* Provider
* Retrieval timestamp

Do not calculate competition intensity or saturation in the Context Engine's first version.

Those belong to the future Competition Analyzer.

---

## I. Population Context

Represent population information safely.

Possible states:

```text
available
estimated
unavailable
```

Include, where available:

* Value
* Unit
* Geographic scope
* Radius
* Source
* Source date
* Confidence
* Limitations

If unavailable:

```json
{
  "value": null,
  "status": "unavailable"
}
```

Do not fabricate population data.

---

## J. Provenance / Source Tracking

The Context Engine must preserve where important information came from.

Potential source categories:

```text
backend_assessment
backend_finance
backend_location
backend_competition
user_message
external_dataset
derived
unknown
```

The exact schema is up to implementation, but the result must be clear and useful.

Do not lose source information during normalization.

---

## K. Context Quality

Represent the quality of the context using evidence.

Quality may consider:

* Required field completeness
* Optional field completeness
* Source availability
* Source reliability
* Geographic specificity
* Finance completeness
* Competition completeness
* Population availability
* Resource completeness
* Data freshness

Do not generate random confidence percentages.

A categorical approach is acceptable initially:

```text
complete
partial
insufficient
```

Include explicit:

* Missing information
* Limitations
* Unavailable data
* Quality explanations

---

## L. Missing Information Detection

The Context Engine should identify information that is absent or insufficient.

Examples:

* Missing business category
* Missing location
* Missing budget
* Missing target customer
* Missing operating scale
* Missing population
* Missing competitor pricing

Do not ask the user questions directly from the Context Engine unless the existing architecture explicitly requires it.

The Context Engine identifies gaps.

The future Adaptive Questioning module decides what to ask.

---

## M. Context Updates

Support updating context when new information arrives.

Example:

Initial:

```text
No commercial space information.
```

New user message:

```text
"I own a 1,000 sq ft shop."
```

Updated context should include structured information such as:

```json
{
  "commercial_space": {
    "available": true,
    "area": 1000,
    "unit": "sqft",
    "ownership": "owned",
    "source": "user_message"
  }
}
```

This is an illustrative example.

The actual implementation must follow the repository's architecture.

Updates must:

* Validate new information
* Preserve existing valid information
* Avoid accidental overwrites
* Track changed fields
* Update provenance
* Recalculate affected quality fields

---

# 10. ARCHITECTURE REQUIREMENTS

Use clear separation of concerns.

Suggested conceptual structure:

```text
ai-engine-core/
│
├── schemas/
├── services/
├── normalizers/
├── provenance/
├── quality/
├── exceptions/
└── tests/
```

The exact structure may differ based on the repository.

Suggested responsibilities:

```text
Schemas
    → Data contracts

Context Builder
    → Constructs canonical context

Normalizers
    → Normalize individual data groups

Quality Evaluator
    → Evaluates completeness and limitations

Provenance
    → Tracks data sources

Context Updater
    → Applies new information safely
```

Do not create one giant function containing all logic.

---

# 11. TECHNOLOGY REQUIREMENTS

Use the existing Python service's technology conventions where possible.

Recommended:

* Python
* FastAPI integration
* Pydantic
* pytest
* Type hints
* Environment-based configuration
* Structured logging

Do not introduce a vector database for this milestone.

Do not introduce LangChain, LlamaIndex, Redis, Kafka, or complex agent frameworks unless the existing repository already requires them or there is a clearly documented need.

The Context Engine should be lightweight and deterministic.

---

# 12. LLM USAGE

Do not make the Context Engine dependent on an LLM for basic deterministic transformations.

Prefer:

```text
Explicit schema mapping
+
Validation
+
Normalization
+
Provenance
```

over:

```text
Send all backend JSON to an LLM and ask it to organize it.
```

An LLM may be used later for genuinely semantic tasks, but the initial Context Engine should be predictable and testable.

---

# 13. API INTEGRATION

Inspect the existing FastAPI service and integrate with it correctly.

Do not invent a new external API without checking the existing backend gateway contract.

Determine:

* Where the Context Engine should be called
* How context is passed into AI sessions
* How context is updated during messaging
* How context is made available to reports
* Whether context should be persisted or reconstructed

Possible internal interfaces:

```python
context = context_engine.build_context(payload)
```

```python
updated_context = context_engine.update_context(
    existing_context,
    new_information
)
```

These are conceptual examples only.

Adapt them to the actual codebase.

---

# 14. TESTING REQUIREMENTS

Add an independent test suite for the Context Engine.

Test at minimum:

## Construction

* Valid backend context
* Minimal valid context
* Full context

## Validation

* Missing required fields
* Invalid types
* Invalid coordinates
* Invalid financial values
* Malformed nested data

## Normalization

* User fields
* Business fields
* Finance
* Resources
* Location
* Competition
* Population

## Missing Data

* Null population
* Missing resources
* Missing location
* Missing business information
* Empty competition results
* Zero values

## Provenance

* Backend source
* User message source
* External source
* Derived values

## Quality

* Complete context
* Partial context
* Insufficient context
* Missing information
* Limitations

## Updates

* Add new information
* Update existing information
* Preserve existing data
* Invalid updates
* Provenance changes

## Integration

* Backend payload → Context Engine
* Context Engine → Canonical AssessmentContext
* FastAPI integration, where applicable

---

# 15. SECURITY REQUIREMENTS

Do not:

* Hardcode API keys
* Hardcode credentials
* Commit `.env`
* Expose secrets
* Log secrets
* Expose internal stack traces
* Include unnecessary personal information
* Store sensitive user information without a requirement

Use environment variables for configuration.

Provide `.env.example` if needed.

---

# 16. DOCUMENTATION REQUIREMENTS

Inside `ai-engine-core/`, provide documentation covering:

* Purpose
* Architecture
* Input schema
* Output schema
* Field meanings
* Normalization rules
* Missing-data behavior
* Provenance
* Quality evaluation
* Update behavior
* Error handling
* Integration usage
* Testing instructions

Also provide a clear implementation summary at the end.

---

# 17. IMPLEMENTATION ORDER

Follow this order:

## Step 1

Inspect repository and existing contracts.

## Step 2

Document actual input/output contract.

## Step 3

Create `ai-engine-core/`.

## Step 4

Implement canonical schemas.

## Step 5

Implement input validation.

## Step 6

Implement context construction.

## Step 7

Implement normalization.

## Step 8

Implement user/business/resource context.

## Step 9

Implement finance/location/competition/population context.

## Step 10

Implement provenance.

## Step 11

Implement context quality and missing information.

## Step 12

Implement context updates.

## Step 13

Integrate with FastAPI / AI service.

## Step 14

Add tests.

## Step 15

Run validation, linting, type checks, and tests.

## Step 16

Document all implementation decisions.

---

# 18. DEFINITION OF DONE

Do not declare completion until:

* The actual backend contract has been inspected.
* `ai-engine-core/` is implemented.
* Canonical context schemas exist.
* Input validation works.
* Context construction works.
* Normalization works.
* User profile context works.
* Business context works.
* Resource context works.
* Finance context works.
* Location context works.
* Competition context works.
* Population availability is represented safely.
* Provenance is preserved.
* Context quality is represented.
* Missing information is detected.
* Context updates work.
* Tests pass.
* Documentation exists.
* Integration with the actual AI service is verified.
* No unnecessary backend functionality has been duplicated.
* No secrets are committed.

---

# 19. IMPORTANT SCOPE LIMIT

Do not expand this task into the entire AI intelligence platform.

The following are NOT required for this milestone unless necessary for integration:

* Full market analysis
* Full competition analysis
* Demand forecasting
* Pricing recommendations
* Final report generation
* Advanced adaptive questioning
* Vector database
* Full RAG system
* Large external dataset ingestion
* Complex multi-agent architecture

Those modules will consume the Context Engine later.

---

# FINAL INSTRUCTION

Work incrementally.

First understand the repository.

Then build the smallest correct Context Engine.

Do not optimize for complexity.

Do not build architecture for the sake of architecture.

Build a reliable foundation that answers:

> "What do we know about this business opportunity, where did it come from, what is missing, and how can the rest of the AI system use it?"

All Context Engine implementation must be centered in:

```text
ai-engine-core/
```
