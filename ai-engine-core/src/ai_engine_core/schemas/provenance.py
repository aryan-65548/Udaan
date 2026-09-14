"""
Data provenance and source-tracking models for Context Engine.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SourceType(str, Enum):
    BACKEND_ASSESSMENT = "backend_assessment"
    BACKEND_FINANCE = "backend_finance"
    BACKEND_LOCATION = "backend_location"
    BACKEND_COMPETITION = "backend_competition"
    BACKEND_POPULATION = "backend_population"
    USER_PROFILE = "user_profile"
    USER_MESSAGE = "user_message"
    EXTERNAL_DATASET = "external_dataset"
    DERIVED = "derived"
    UNKNOWN = "unknown"


class ClaimType(str, Enum):
    FACT = "FACT"
    USER_PROVIDED = "USER_PROVIDED"
    ESTIMATE = "ESTIMATE"
    DERIVED = "DERIVED"
    AI_INFERENCE = "AI_INFERENCE"
    ASSUMPTION = "ASSUMPTION"


class ProvenanceRecord(BaseModel):
    """Metadata tracking where a specific field or section originated."""
    source_type: SourceType = Field(..., description="High-level origin category")
    source_reference: Optional[str] = Field(None, description="Identifier of table, API, or message")
    claim_type: ClaimType = Field(default=ClaimType.USER_PROVIDED, description="Epistemic reliability tag")
    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp when the fact/context was established"
    )
    confidence: Optional[float] = Field(None, description="Optional numerical confidence (0.0 to 1.0) if verified")
    notes: Optional[str] = Field(None, description="Traceability or context notes")
