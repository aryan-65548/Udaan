\# AI Context Engine — Technology Stack

## Project

Udaan

## Target Folder

```text
ai-engine-core/
```

## Purpose

This document defines the recommended technology choices for the Context Engine.

The Context Engine is a structured data processing and validation component. It is not primarily an LLM feature.

The technology choices should prioritize:

* Correctness
* Type safety
* Validation
* Maintainability
* Testability
* Deterministic behavior
* Easy integration with FastAPI
* Clear separation of concerns

---

# 1. Primary Language

## Python

### Recommendation

Use Python for the Context Engine because the broader AI service is planned around Python/FastAPI.

### Why

* Native compatibility with the AI service
* Strong data validation ecosystem
* Excellent support for structured data processing
* Easy integration with future AI/ML modules
* Good testing ecosystem
* Suitable for data normalization and transformation

---

# 2. API Framework

## FastAPI

### Role

FastAPI remains the service framework for the Python AI service.

The Context Engine itself should primarily be implemented as an internal service/module rather than unnecessarily exposing every internal function as a public HTTP endpoint.

### Responsibilities

FastAPI handles:

* HTTP requests
* Request parsing
* API-level validation
* Response serialization
* Error responses
* Integration with the Node.js AI Gateway

The Context Engine handles:

* Context construction
* Normalization
* Validation beyond transport-level validation
* Context quality
* Provenance
* Context updates

---

# 3. Data Validation and Schemas

## Pydantic

### Recommendation

Use Pydantic for:

* Input schemas
* Canonical context schemas
* Nested models
* Field validation
* Serialization
* Deserialization
* Structured errors

### Why

The Context Engine is fundamentally a schema-driven system.

Pydantic helps ensure:

* Correct types
* Explicit optional fields
* Nested structure
* Consistent serialization
* Clear validation errors
* Compatibility with FastAPI

### Example Concept

```python
class AssessmentContext(BaseModel):
    context_version: str
    business: BusinessContext
    location: LocationContext
    resources: ResourceContext
```

The exact schema must be designed based on the actual backend contract.

---

# 4. Project and Dependency Management

## Recommended: `pyproject.toml`

Use `pyproject.toml` for project metadata and dependencies.

The exact package manager may follow the existing repository convention.

Possible options:

* Poetry
* uv
* pip with requirements
* Existing project tooling

### Rule

Do not introduce a new package manager if the repository already has an established standard unless there is a clear reason.

---

# 5. Suggested Core Dependencies

The initial Context Engine should remain lightweight.

## Required / Likely

| Technology         | Purpose                                |
| ------------------ | -------------------------------------- |
| Python             | Core implementation                    |
| FastAPI            | Service integration                    |
| Pydantic           | Schemas and validation                 |
| pytest             | Testing                                |
| httpx              | API/integration testing if required    |
| Ruff               | Linting, if consistent with repository |
| MyPy or equivalent | Optional static type checking          |

### Important

Do not add dependencies merely because they are popular.

Every dependency should have a clear purpose.

---

# 6. Data Modeling Approach

Use explicit domain models rather than passing untyped dictionaries everywhere.

Recommended conceptual models:

```text
AssessmentContext
UserContext
BusinessContext
ResourceContext
FinanceContext
LocationContext
CompetitionContext
PopulationContext
ContextQuality
DataProvenance
ContextUpdate
```

### Why

This allows:

* Shared contracts
* Better validation
* Better IDE support
* Easier testing
* Easier future module integration
* Reduced field-name inconsistency

---

# 7. Storage Strategy

## Initial Version: No Dedicated Database Required

The first Context Engine should not require a separate database unless the existing architecture demands it.

The initial flow can be:

```text
Backend Payload
      ↓
Context Engine
      ↓
Canonical Context
      ↓
AI Session / Downstream Modules
```

### Why

The backend remains the primary database authority.

The Context Engine initially transforms and enriches context for AI use.

Do not create a new persistence layer without a concrete requirement.

---

# 8. Context Persistence

If context persistence is needed, first inspect the existing AI session architecture.

Possible future approaches:

* Backend-managed persistence
* AI session storage
* Redis
* Database-backed context snapshots
* Event-based updates

### Initial Recommendation

Do not introduce Redis or another database solely for the first Context Engine milestone.

First determine whether the backend already persists AI session state or whether the Python service needs to maintain it.

---

# 9. External Data and Retrieval

## Initial Version

Do not build a vector database as a prerequisite for the Context Engine.

The Context Engine should support structured context first.

### Future possibilities

| Data Type                  | Possible Technology                               |
| -------------------------- | ------------------------------------------------- |
| Structured population data | PostgreSQL / analytical tables / structured files |
| Economic indicators        | Structured data processing                        |
| Government reports         | Document storage + retrieval                      |
| Textual knowledge          | Embeddings + vector database, if justified        |
| Geographic data            | Geospatial processing / PostGIS, if needed        |

### Principle

Choose storage and retrieval based on the data type.

Do not use a vector database for every dataset.

---

# 10. LLM Usage

## Initial Context Engine

LLM usage should be minimal or absent for deterministic context construction.

### Why

Context construction should be:

* Predictable
* Testable
* Reproducible
* Schema-valid
* Easy to debug

A model should not be required to decide whether:

```text
budget = 200000
```

means:

```text
available_capital = 200000 INR
```

unless the input genuinely requires semantic interpretation.

Even then, deterministic parsing and explicit field mappings should be preferred where possible.

---

# 11. Configuration

Use environment-based configuration.

Potential configuration values:

* Environment
* Logging level
* External service URLs
* Feature flags
* Context version
* External data provider configuration

Do not hardcode:

* API keys
* Tokens
* Passwords
* Credentials
* Private URLs containing secrets

Provide an `.env.example` if the AI service requires environment variables.

---

# 12. Logging

Use structured or consistent application logging.

Log useful events such as:

* Context construction started
* Context construction completed
* Validation failure
* Context update
* External enrichment failure
* Context quality result

Do not log:

* API keys
* Credentials
* Sensitive user information unnecessarily
* Full private payloads without a clear reason

---

# 13. Error Handling

Use explicit exception types where useful.

Potential categories:

```text
ContextValidationError
ContextNormalizationError
ContextUpdateError
UnsupportedContextError
ContextSerializationError
```

Errors should be:

* Structured
* Actionable for developers
* Safe for API consumers
* Free of secrets
* Free of internal stack traces in public responses

---

# 14. Testing Stack

## pytest

Use pytest for unit and integration tests.

Test:

* Schema validation
* Context construction
* Normalization
* Missing data
* Resource mapping
* Location mapping
* Finance mapping
* Competition mapping
* Population handling
* Context quality
* Context updates
* Serialization
* Backend contract compatibility

---

# 15. Code Quality

Recommended standards:

* Type hints
* Small focused functions
* Clear module boundaries
* Explicit schemas
* No unnecessary global state
* No hidden side effects
* No hardcoded secrets
* No duplicated backend logic
* Meaningful tests
* Clear documentation

---

# 16. Recommended Design Pattern

A suitable initial pattern is:

```text
Schemas
   ↓
Context Builder
   ↓
Normalizers
   ↓
Quality Evaluator
   ↓
Canonical Context
```

For example:

```python
class ContextBuilder:
    def build(self, payload) -> AssessmentContext:
        ...
```

The exact implementation should follow the existing repository architecture.

---

# 17. Technology Decisions to Avoid

Do not introduce these automatically:

* Vector database
* LangChain
* LlamaIndex
* Redis
* Celery
* Kafka
* Multiple LLM providers
* Complex agent frameworks
* Large data orchestration platforms

These may become useful later, but they are not inherently required to build a reliable Context Engine.

---

# Final Technology Principle

The Context Engine should be built as a **small, strongly validated, deterministic Python domain module** that integrates cleanly with FastAPI and prepares structured context for future AI intelligence.

Prefer:

```text
Simple + Explicit + Testable
```

over:

```text
Complex + Framework-heavy + Unnecessary
```
