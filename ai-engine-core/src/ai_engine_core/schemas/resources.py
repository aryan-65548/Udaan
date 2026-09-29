"""
Resource context schemas for entrepreneurial capabilities and assets.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class ResourceAvailability(str, Enum):
    AVAILABLE = "AVAILABLE"
    UNAVAILABLE = "UNAVAILABLE"
    UNKNOWN = "UNKNOWN"
    PARTIAL = "PARTIAL"


class ResourceItem(BaseModel):
    name: str = Field(..., description="Resource identifier/name (e.g., 'refrigerator', 'commercial_shop')")
    category: str = Field(..., description="Category: physical, human, operational, financial")
    availability: ResourceAvailability = Field(default=ResourceAvailability.UNKNOWN)
    quantity: Optional[float] = Field(None, description="Reported quantity or numerical measure")
    unit: Optional[str] = Field(None, description="Measurement unit (e.g., 'sqft', 'units', 'hours')")
    ownership_type: Optional[str] = Field(None, description="Ownership status (e.g., 'owned', 'rented', 'leased', 'family')")
    estimated_value: Optional[float] = Field(None, description="Monetary value if estimated or reported")
    currency: str = Field(default="INR")
    notes: Optional[str] = Field(None)
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.BACKEND_ASSESSMENT,
            claim_type=ClaimType.USER_PROVIDED
        )
    )


class PhysicalResources(BaseModel):
    has_land: Optional[bool] = Field(None, description="Explicit land ownership or availability")
    land_area: Optional[float] = Field(None, description="Land area in specified unit")
    land_unit: Optional[str] = Field(None, description="e.g. sqft, acres, bigha, guntas")
    
    has_shop: Optional[bool] = Field(None, description="Explicit commercial shop availability")
    shop_area: Optional[float] = Field(None)
    shop_ownership: Optional[str] = Field(None, description="owned, rented, none")
    
    has_room: Optional[bool] = Field(None, description="Dedicated workspace / residential room availability")
    has_equipment: Optional[bool] = Field(None, description="Key operational equipment availability")
    equipment_items: List[ResourceItem] = Field(default_factory=list, description="Specific named equipment items")
    
    has_vehicles: Optional[bool] = Field(None)
    has_three_phase_power: Optional[bool] = Field(None)
    has_water_supply: Optional[bool] = Field(None)


class HumanResources(BaseModel):
    experience_level: Optional[str] = Field(None, description="None, Beginner, Intermediate, Expert")
    relevant_skills: List[str] = Field(default_factory=list)
    has_family_support: Optional[bool] = Field(None)
    available_workers_count: Optional[int] = Field(None)
    dedicated_daily_hours: Optional[float] = Field(None)


class OperationalResources(BaseModel):
    has_supplier_access: Optional[bool] = Field(None)
    raw_materials_accessible: Optional[bool] = Field(None)
    has_storage_facility: Optional[bool] = Field(None)
    distribution_reach: Optional[str] = Field(None, description="local_village, block_level, district_level")


class FinancialResources(BaseModel):
    available_capital: Optional[float] = Field(None, description="Own liquid contribution ready to invest")
    existing_debt: Optional[float] = Field(None, description="Prior active debt obligations")
    has_bank_account: Optional[bool] = Field(None)
    eligible_for_collateral: Optional[bool] = Field(None)
    currency: str = Field(default="INR")


class ResourceContext(BaseModel):
    """Complete canonical representation of entrepreneurial resources."""
    physical: PhysicalResources = Field(default_factory=PhysicalResources)
    human: HumanResources = Field(default_factory=HumanResources)
    operational: OperationalResources = Field(default_factory=OperationalResources)
    financial: FinancialResources = Field(default_factory=FinancialResources)
    all_items: List[ResourceItem] = Field(default_factory=list, description="Flat registry of all cataloged resource items")
