"""
Context quality, completeness, and missing information schemas.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class QualityStatus(str, Enum):
    COMPLETE = "COMPLETE"
    PARTIAL = "PARTIAL"
    INSUFFICIENT = "INSUFFICIENT"


class FieldImportance(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class MissingInformationItem(BaseModel):
    field_name: str = Field(..., description="Logical identifier of the missing information")
    category: str = Field(..., description="Domain area: user, business, resources, finance, location, competition")
    importance: FieldImportance = Field(default=FieldImportance.MEDIUM)
    reason: str = Field(..., description="Why this field is required or helpful for the advisory process")


class ContextQuality(BaseModel):
    """Authoritative evaluation of the context's completeness and analytical reliability."""
    status: QualityStatus = Field(default=QualityStatus.PARTIAL)
    completeness_score: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Deterministic completeness ratio (0.0 to 1.0) based on weighted field presence"
    )
    missing_information: List[MissingInformationItem] = Field(
        default_factory=list,
        description="Catalog of information gaps that adaptive questioning or user input could fill"
    )
    limitations: List[str] = Field(
        default_factory=list,
        description="Explicit limitations in available intelligence (e.g. data vintage, missing population)"
    )
    evaluation_summary: str = Field(
        default="",
        description="Concise description of the context quality state"
    )
