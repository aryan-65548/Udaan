"""
User profile context schema for business advisory reasoning.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class UserContext(BaseModel):
    """Canonical representation of the user for business advisory context."""
    user_id: str = Field(..., description="Anonymized user identifier (UUID)")
    language: str = Field(default="en", description="User preferred communication language (e.g., en, hi, gu)")
    previous_experience: Optional[str] = Field(None, description="Reported prior business or domain experience")
    skills: List[str] = Field(default_factory=list, description="Extracted or declared user skills")
    expected_working_hours_per_day: Optional[float] = Field(None, description="Available daily hours dedicated to business")
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.USER_PROFILE,
            claim_type=ClaimType.USER_PROVIDED
        )
    )
