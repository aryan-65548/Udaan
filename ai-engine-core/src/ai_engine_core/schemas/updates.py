"""
Schemas for incremental context updates.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class ContextUpdatePayload(BaseModel):
    """Encapsulates a batch or single incremental update to the context."""
    answers: Dict[str, Any] = Field(default_factory=dict, description="Key-value answer updates")
    user_updates: Dict[str, Any] = Field(default_factory=dict, description="Updated user experience/skills")
    business_updates: Dict[str, Any] = Field(default_factory=dict, description="Updated business details/stage")
    resource_updates: Dict[str, Any] = Field(default_factory=dict, description="Updated resource items or flags")
    source_message: Optional[str] = Field(None, description="User raw text message that yielded this update")
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.USER_MESSAGE,
            claim_type=ClaimType.USER_PROVIDED
        )
    )


class ContextUpdateResult(BaseModel):
    """Result of applying an incremental context update."""
    success: bool = True
    updated_fields: List[str] = Field(default_factory=list, description="Names of fields that changed")
    quality_score_delta: float = Field(default=0.0, description="Change in completeness score")
    notes: Optional[str] = None
