"""
Domain knowledge and category-specific requirement definitions.
Defines mandatory and recommended business assets for rural/semi-urban trade categories.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CategoryRequirements(BaseModel):
    category_code: str
    category_name: str
    essential_physical_assets: List[str] = Field(default_factory=list)
    recommended_skills: List[str] = Field(default_factory=list)
    requires_three_phase_power: bool = False
    requires_water_supply: bool = False
    requires_commercial_space: bool = True
    typical_min_working_capital_inr: float = 25000.0


# Registry of trade-specific requirements
CATEGORY_REGISTRY: Dict[str, CategoryRequirements] = {
    "grocery": CategoryRequirements(
        category_code="grocery",
        category_name="Kirana / Grocery / Provision Store",
        essential_physical_assets=["commercial_shop", "storage_shelves", "weighing_scale"],
        recommended_skills=["inventory_management", "customer_service", "basic_bookkeeping"],
        requires_commercial_space=True,
        typical_min_working_capital_inr=50000.0
    ),
    "dairy": CategoryRequirements(
        category_code="dairy",
        category_name="Dairy Farming / Milk Collection",
        essential_physical_assets=["cattle_shed", "water_source", "milk_cans"],
        recommended_skills=["animal_husbandry", "feed_management", "hygiene_practices"],
        requires_water_supply=True,
        requires_commercial_space=False,
        typical_min_working_capital_inr=75000.0
    ),
    "tailoring": CategoryRequirements(
        category_code="tailoring",
        category_name="Tailoring / Apparel Boutique",
        essential_physical_assets=["sewing_machine", "cutting_table", "ironing_station"],
        recommended_skills=["garment_cutting", "stitching", "fabric_knowledge"],
        requires_commercial_space=False,  # Can be home-based
        typical_min_working_capital_inr=15000.0
    ),
    "flour_mill": CategoryRequirements(
        category_code="flour_mill",
        category_name="Flour Mill / Atta Chakki",
        essential_physical_assets=["commercial_shop", "flour_grinding_mill", "weighing_scale"],
        recommended_skills=["machine_maintenance", "grain_handling"],
        requires_three_phase_power=True,
        requires_commercial_space=True,
        typical_min_working_capital_inr=30000.0
    ),
    "cyber_cafe": CategoryRequirements(
        category_code="cyber_cafe",
        category_name="CSC / Cyber Cafe / Digital Services",
        essential_physical_assets=["computer_system", "multifunction_printer", "internet_connection", "power_backup"],
        recommended_skills=["computer_literacy", "portal_navigation", "data_entry"],
        requires_commercial_space=True,
        typical_min_working_capital_inr=20000.0
    ),
    "poultry": CategoryRequirements(
        category_code="poultry",
        category_name="Poultry Farming",
        essential_physical_assets=["poultry_shed", "feeders_and_drinkers", "water_source"],
        recommended_skills=["biosecurity", "vaccination", "feed_formulation"],
        requires_water_supply=True,
        requires_commercial_space=False,
        typical_min_working_capital_inr=100000.0
    )
}


class CategoryRuleEngine:
    """Matches business categories and returns specific advisory constraints."""

    @classmethod
    def match_category(cls, category_name_or_id: str) -> Optional[CategoryRequirements]:
        query = category_name_or_id.lower().replace("_", " ").replace("-", " ")
        for key, reqs in CATEGORY_REGISTRY.items():
            if key in query or reqs.category_name.lower() in query:
                return reqs
        # Fuzzy match keywords
        if any(w in query for w in ["kirana", "retail", "shop", "general"]):
            return CATEGORY_REGISTRY["grocery"]
        if any(w in query for w in ["milk", "cow", "buffalo", "dairy"]):
            return CATEGORY_REGISTRY["dairy"]
        if any(w in query for w in ["dress", "cloth", "sewing", "boutique", "tailor"]):
            return CATEGORY_REGISTRY["tailoring"]
        if any(w in query for w in ["chakki", "grain", "grinding", "mill"]):
            return CATEGORY_REGISTRY["flour_mill"]
        if any(w in query for w in ["digital", "csc", "internet", "online", "computer"]):
            return CATEGORY_REGISTRY["cyber_cafe"]
        if any(w in query for w in ["chicken", "bird", "broiler", "layer", "poultry"]):
            return CATEGORY_REGISTRY["poultry"]

        return None
