"""
Business opportunity context schema.
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class BusinessContext(BaseModel):
    """Canonical representation of the proposed business venture."""
    category_id: str = Field(..., description="Business category UUID from backend")
    category_name: str = Field(..., description="Business category human name (e.g., Grocery, Dairy, Tailoring)")
    proposed_business_name: Optional[str] = Field(None, description="Specific trade or venture name if provided")
    business_stage: str = Field(default="IDEA", description="Current stage: IDEA, PLANNING, OPERATING, EXPANDING")
    business_description: Optional[str] = Field(None, description="Narrative description of the intended activity")
    target_customer_segment: Optional[str] = Field(None, description="Intended audience (e.g., local village, highway traffic)")
    operating_scale: Optional[str] = Field(None, description="Intended scale (e.g., micro, small, household)")
    has_known_customers: Optional[bool] = Field(None, description="Whether the entrepreneur already has established client relationships")
    raw_answers: Dict[str, Any] = Field(default_factory=dict, description="Normalized key-value map of all assessment answers")
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.BACKEND_ASSESSMENT,
            claim_type=ClaimType.USER_PROVIDED
        )
    )
