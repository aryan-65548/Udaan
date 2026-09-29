"""
Location and population context schemas.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class PopulationStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ESTIMATED = "ESTIMATED"
    UNAVAILABLE = "UNAVAILABLE"


class PopulationContext(BaseModel):
    """Canonical representation of local population intelligence."""
    status: PopulationStatus = Field(default=PopulationStatus.UNAVAILABLE)
    estimated_population: Optional[int] = Field(None, description="Reported or calculated population count")
    radius_km: Optional[float] = Field(None, description="Catchment radius for the population count")
    source: Optional[str] = Field(None, description="Data source (e.g. Census 2011, PCA, WorldPop)")
    data_year: Optional[int] = Field(None, description="Vintage year of the census or population source")
    limitations: Optional[str] = Field(None, description="Notes on age or precision of demographic data")
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.BACKEND_POPULATION,
            claim_type=ClaimType.FACT
        )
    )


class LocationContext(BaseModel):
    """Canonical representation of the geographic territory for the assessment."""
    location_id: str = Field(..., description="UUID of primary location node in database hierarchy")
    village_name: Optional[str] = Field(None)
    village_code: Optional[str] = Field(None)
    block_name: Optional[str] = Field(None)
    block_code: Optional[str] = Field(None)
    district_name: Optional[str] = Field(None)
    district_code: Optional[str] = Field(None)
    state_name: Optional[str] = Field(None)
    state_code: Optional[str] = Field(None)
    pincode: Optional[str] = Field(None)
    
    formatted_address: str = Field(..., description="Full resolved address string")
    latitude: float = Field(..., description="WGS84 latitude")
    longitude: float = Field(..., description="WGS84 longitude")
    
    search_radius_km: float = Field(default=5.0, description="Analysis boundary radius in kilometers")
    population: PopulationContext = Field(default_factory=PopulationContext)
    
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.BACKEND_LOCATION,
            claim_type=ClaimType.FACT
        )
    )
