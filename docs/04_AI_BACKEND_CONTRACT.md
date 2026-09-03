# 04 — AI ↔ Backend Contract

## 1. Purpose

This document defines the hard boundary between the TypeScript backend and AI service.

The AI service must not query the backend PostgreSQL database directly.

The Backend constructs and sends the context.

## 2. AssessmentContext

```ts
type AssessmentContext = {
  assessmentId: string;

  user: {
    language: "en" | "hi" | "gu";
  };

  location: {
    id: string;
    state: string;
    district: string;
    block: string;
    village: string;
    stateCode?: string;
    districtCode?: string;
    blockCode?: string;
    villageCode?: string;
    latitude?: number;
    longitude?: number;
  };

  business: {
    categoryId: string;
    categoryName: string;
  };

  profile: {
    previousExperience?: string;
    hasLand?: boolean;
    hasShop?: boolean;
    hasRoom?: boolean;
    hasEquipment?: boolean;
    expectedWorkingHours?: number;
    hasKnownCustomers?: boolean;
  };

  finance: {
    ownContribution?: number;
    projectCost?: number;
    loanAmount?: number;
    interestRate?: number;
    tenureMonths?: number;
    moratoriumMonths?: number;
    paymentFrequency?: "MONTHLY" | "QUARTERLY" | "YEARLY";
    emi?: number;
    installmentAmount?: number;
    annualDebtService?: number;
    dscr?: number;
    totalInterest?: number;
    totalRepayment?: number;
  };

  inputs: AssessmentInput[];
};
```

## 3. AssessmentInput

```ts
type AssessmentInput = {
  key: string;
  questionText?: string;
  inputType: string;
  value?: string | number | boolean | object;
  source: "USER" | "AI" | "SYSTEM";
};
```

## 4. AI session start

### Backend -> AI

```http
POST /internal/ai/session/start
```

Body:

```json
{
  "context": {}
}
```

Response:

```json
{
  "sessionId": "ai-session-123",
  "status": "QUESTIONING",
  "question": {
    "key": "known_buyers",
    "text": "Do you already know potential buyers?",
    "inputType": "BOOLEAN",
    "options": [
      {"label": "Yes", "value": true},
      {"label": "No", "value": false}
    ]
  }
}
```

## 5. AI message

### Backend -> AI

```http
POST /internal/ai/session/message
```

Body:

```json
{
  "sessionId": "ai-session-123",
  "context": {},
  "answer": {
    "key": "known_buyers",
    "value": true
  }
}
```

Response can be:

### More questions

```json
{
  "status": "QUESTIONING",
  "question": {}
}
```

### Ready for analysis

```json
{
  "status": "READY_FOR_ANALYSIS"
}
```

## 6. Final analysis request

```http
POST /internal/ai/report
```

Body:

```json
{
  "sessionId": "ai-session-123",
  "context": {}
}
```

## 7. AI report schema

Minimum structure:

```json
{
  "reportId": "report-123",

  "feasibility": {
    "score": 78,
    "rating": "MODERATE_HIGH",
    "confidence": 64
  },

  "market": {
    "summary": "",
    "reach": [],
    "customerSegments": [],
    "distributionChannels": []
  },

  "opportunity": {
    "summary": "",
    "areas": []
  },

  "competition": {
    "summary": "",
    "detectedBusinesses": [],
    "coverage": "PARTIAL"
  },

  "pricing": {
    "summary": "",
    "priceRange": {},
    "assumptions": []
  },

  "swot": {
    "strengths": [],
    "weaknesses": [],
    "opportunities": [],
    "threats": []
  },

  "risks": [],

  "recommendation": {
    "summary": "",
    "actions": []
  },

  "assumptions": [],

  "missingInformation": [],

  "validationChecklist": [],

  "sources": []
}
```

## 8. Source/evidence object

```json
{
  "title": "Census 2011 Village Directory",
  "sourceType": "GOVERNMENT",
  "sourceReference": "...",
  "dataVintage": "2011",
  "claimType": "FACT"
}
```

Claim types:

- FACT
- USER_PROVIDED
- ESTIMATE
- AI_INFERENCE
- ASSUMPTION

## 9. AI response constraints

AI must:

- not calculate finance;
- not claim loan approval;
- not claim complete competitor coverage without evidence;
- mention stale data where material;
- distinguish fact from inference;
- return schema-valid JSON;
- avoid unsupported exact numbers.

## 10. Failure behavior

If RAG is unavailable:

```text
status = FAILED
```

Backend should preserve assessment data and allow retry.

If an AI response is schema-invalid:

1. Validate.
2. Attempt controlled retry.
3. If still invalid, mark AI failure.
4. Never silently store malformed output.

## 11. Ownership

Backend owns:

- assessment ID;
- user ownership;
- stored answers;
- financial calculations;
- assessment state.

AI owns:

- session reasoning;
- questions;
- retrieval;
- report generation.

The vector database never becomes a replacement for PostgreSQL application state.
