# 05 — AI RAG and Data Specification

## 1. AI knowledge architecture

Use one vector database with logical namespaces/collections.

Recommended:

1. `government_schemes`
2. `business_knowledge`
3. `geographic_knowledge`
4. `market_knowledge`
5. `pricing_knowledge`
6. `competitor_knowledge`
7. `risk_knowledge`
8. `compliance_validation`

Do not create a separate physical database for every collection.

## 2. General document metadata

Every indexed document/chunk should preserve:

- document_id
- source_name
- source_url/reference
- source_type
- language
- published_at
- data_vintage / observed_at when applicable
- geographic_level when applicable
- state
- district
- block
- village_code
- business_category
- last_verified_at
- confidence/coverage classification

## 3. Government schemes

Knowledge includes:

- official scheme documents;
- FAQs;
- eligibility descriptions;
- implementing-agency information;
- repayment explanations;
- application/document information.

Structured numeric parameters required by backend finance must also exist in `scheme_configs`.

Vector documents are for explanation/context.

## 4. Business knowledge

For each business:

- business model;
- customers;
- revenue model;
- cost drivers;
- working capital;
- equipment;
- skills;
- supplier dependencies;
- seasonal factors;
- typical risks;
- distribution models;
- common validation questions.

Business knowledge should be indexed by:

- business_category;
- region where applicable.

## 5. Geographic knowledge

Can include:

- population;
- households;
- village amenities;
- schools;
- healthcare;
- banking;
- communication;
- roads/transport;
- nearby towns;
- agriculture/livestock context;
- market information.

Important:

Village demographic/amenity data may come from historical Census data. Preserve the original data vintage. Do not present old Census data as current population truth.

## 6. Market knowledge

Can include:

- district market reports;
- rural market studies;
- industry reports;
- distribution patterns;
- consumer behavior research;
- agriculture market context.

The AI should combine this with actual assessment answers.

## 7. Pricing knowledge

Every price record should carry:

- product;
- unit;
- minimum;
- maximum or observed price;
- geography;
- market;
- observation date;
- source;
- data confidence.

Never embed a bare statement such as:

```text
Milk price = ₹55
```

without context.

## 8. Competitor knowledge

Competitor evidence may come from:

- registered-enterprise data;
- OSM;
- other legally usable sources;
- manually verified field observations in later phases.

The AI must call these:

- detected businesses;
- available listings;
- registered enterprises;

unless completeness is known.

Do not claim that a registry equals the complete informal business population.

## 9. Risk knowledge

Per business category:

- supply risk;
- price volatility;
- seasonality;
- dependency on buyers;
- dependency on suppliers;
- operational risks;
- skill risks;
- infrastructure risks.

The AI should select relevant risks rather than dumping the whole risk catalogue.

## 10. Compliance and validation

Knowledge includes:

- business-specific registrations;
- licence/checklist guidance;
- authority information;
- field verification questions;
- pre-borrowing validation methods.

Do not treat retrieved guidance as legal approval.

## 11. Retrieval process

```text
AssessmentContext
   |
   +--> metadata filters
   |      state
   |      district
   |      block
   |      village_code
   |      business_category
   |
   +--> semantic retrieval
            |
            v
      top relevant chunks
            |
            v
           LLM
```

Where exact geographic lookup is required, use a structured/geospatial retrieval mechanism instead of semantic similarity alone.

## 12. RAG quality rules

The AI engineer must test:

- wrong location retrieval;
- wrong business-category retrieval;
- stale scheme retrieval;
- conflicting documents;
- missing data;
- duplicate documents;
- low-confidence source retrieval.

## 13. Data ingestion pipeline

Recommended flow:

```text
Source
 -> Raw file/API
 -> Normalize
 -> Validate
 -> Add metadata
 -> Chunk
 -> Embed
 -> Upsert
 -> Retrieval test
```

Helpers prepare and verify source material. The AI engineer owns indexing/retrieval behavior.

## 14. Source priority

When conflicting:

1. current official government source;
2. current official implementing-agency source;
3. authoritative government dataset;
4. trusted secondary source;
5. generic web/community content only as weak context.

Do not use a secondary source to override an official current scheme rule.

## 15. Data vintage

Every data source with a date must keep that date.

Example:

```text
source: Census
vintage: 2011
```

The AI should not write:

> "The current population is X."

Prefer:

> "The available Census baseline reports X."

## 16. Knowledge-vs-state boundary

Vector DB stores reusable knowledge.

PostgreSQL stores:

- user answers;
- assessments;
- financial runs;
- workflow state.

A user's answer must never be promoted into shared knowledge automatically.
