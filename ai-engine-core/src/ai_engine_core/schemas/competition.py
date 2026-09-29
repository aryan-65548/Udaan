"""
Competition intelligence context schemas.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class CompetitorItem(BaseModel):
    name: str = Field(..., description="Business name of detected competitor")
    category: Optional[str] = Field(None, description="Trade classification or primary place type")
    latitude: Optional[float] = Field(None)
    longitude: Optional[float] = Field(None)
    distance_km: float = Field(..., description="Geodesic distance from target location in km")
    formatted_address: Optional[str] = Field(None)
    provider_place_id: Optional[str] = Field(None, description="External provider identifier")
    source: str = Field(default="google_places", description="Origin provider or registry")


class CompetitionContext(BaseModel):
    """Canonical representation of competitors in the target catchment radius."""
    radius_km: float = Field(default=5.0, description="Spatial search radius used for discovery")
    total_competitors: int = Field(default=0, description="Count of detected active competitors")
    competitors: List[CompetitorItem] = Field(default_factory=list, description="List of individual competitor records")
    provider: str = Field(default="unavailable", description="Discovery provider: google_places, census, local_survey, unavailable")
    retrieved_at: Optional[str] = Field(None, description="ISO timestamp of provider query")
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.BACKEND_COMPETITION,
            claim_type=ClaimType.FACT
        )
    )
