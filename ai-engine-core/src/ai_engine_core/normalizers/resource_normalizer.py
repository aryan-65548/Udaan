"""
Resource normalizer mapping raw answers and updates into structured ResourceContext.
"""

from typing import Any, Dict, List, Optional
from ..schemas.resources import (
    ResourceContext,
    PhysicalResources,
    HumanResources,
    OperationalResources,
    FinancialResources,
    ResourceItem,
    ResourceAvailability,
)
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType
from .converters import UnitConverter


class ResourceNormalizer:
    """Extracts and standardizes physical, human, operational, and financial resources."""

    @classmethod
    def normalize(
        cls,
        answers: Dict[str, Any],
        provenance: Optional[ProvenanceRecord] = None
    ) -> ResourceContext:
        prov = provenance or ProvenanceRecord(
            source_type=SourceType.BACKEND_ASSESSMENT,
            claim_type=ClaimType.USER_PROVIDED
        )

        physical = PhysicalResources()
        human = HumanResources()
        operational = OperationalResources()
        financial = FinancialResources()
        items: List[ResourceItem] = []

        # 1. Physical Resources
        if "has_land" in answers:
            val = answers["has_land"]
            physical.has_land = bool(val) if val is not None else None

        if "land_area" in answers and answers["land_area"] is not None:
            try:
                raw_area = float(answers["land_area"])
                raw_unit = str(answers.get("land_unit", "sqft"))
                norm_area, norm_unit = UnitConverter.normalize_area(raw_area, raw_unit)
                physical.land_area = norm_area
                physical.land_unit = norm_unit
                if physical.has_land is None:
                    physical.has_land = True
            except (ValueError, TypeError):
                pass

        if physical.has_land:
            items.append(ResourceItem(
                name="land",
                category="physical",
                availability=ResourceAvailability.AVAILABLE,
                quantity=physical.land_area,
                unit=physical.land_unit or "sqft",
                provenance=prov
            ))

        if "has_shop" in answers:
            val = answers["has_shop"]
            physical.has_shop = bool(val) if val is not None else None

        if "shop_area" in answers and answers["shop_area"] is not None:
            try:
                raw_shop_area = float(answers["shop_area"])
                raw_shop_unit = str(answers.get("shop_unit", "sqft"))
                norm_shop_area, norm_shop_unit = UnitConverter.normalize_area(raw_shop_area, raw_shop_unit)
                physical.shop_area = norm_shop_area
                physical.shop_ownership = str(answers.get("shop_ownership", "owned"))
                if physical.has_shop is None:
                    physical.has_shop = True
            except (ValueError, TypeError):
                pass

        if physical.has_shop:
            items.append(ResourceItem(
                name="commercial_shop",
                category="physical",
                availability=ResourceAvailability.AVAILABLE,
                quantity=physical.shop_area,
                unit="sqft",
                ownership_type=physical.shop_ownership or "owned",
                provenance=prov
            ))

        if "has_room" in answers:
            val = answers["has_room"]
            physical.has_room = bool(val) if val is not None else None

        if "has_equipment" in answers:
            val = answers["has_equipment"]
            physical.has_equipment = bool(val) if val is not None else None

        # Equipment items list if given as structured answer
        equipment_raw = answers.get("equipment_items") or answers.get("equipment_list")
        if isinstance(equipment_raw, list):
            for eq in equipment_raw:
                if isinstance(eq, str) and eq.strip():
                    item = ResourceItem(
                        name=eq.strip(),
                        category="physical",
                        availability=ResourceAvailability.AVAILABLE,
                        provenance=prov
                    )
                    physical.equipment_items.append(item)
                    items.append(item)
                elif isinstance(eq, dict) and eq.get("name"):
                    item = ResourceItem(
                        name=str(eq["name"]),
                        category="physical",
                        availability=ResourceAvailability.AVAILABLE if eq.get("available", True) else ResourceAvailability.UNAVAILABLE,
                        quantity=eq.get("quantity"),
                        unit=eq.get("unit"),
                        ownership_type=eq.get("ownership"),
                        provenance=prov
                    )
                    physical.equipment_items.append(item)
                    items.append(item)

        if "has_vehicles" in answers:
            physical.has_vehicles = bool(answers["has_vehicles"])
        if "has_three_phase_power" in answers:
            physical.has_three_phase_power = bool(answers["has_three_phase_power"])
        if "has_water_supply" in answers:
            physical.has_water_supply = bool(answers["has_water_supply"])

        # 2. Human Resources
        if "previous_experience" in answers and answers["previous_experience"]:
            exp_text = str(answers["previous_experience"]).strip()
            human.experience_level = exp_text
            items.append(ResourceItem(
                name="domain_experience",
                category="human",
                availability=ResourceAvailability.AVAILABLE,
                notes=exp_text,
                provenance=prov
            ))

        if "skills" in answers:
            skills_val = answers["skills"]
            if isinstance(skills_val, list):
                human.relevant_skills = [str(s).strip() for s in skills_val if str(s).strip()]
            elif isinstance(skills_val, str):
                human.relevant_skills = [s.strip() for s in skills_val.split(",") if s.strip()]

        if "expected_working_hours" in answers and answers["expected_working_hours"] is not None:
            try:
                human.dedicated_daily_hours = float(answers["expected_working_hours"])
            except (ValueError, TypeError):
                pass

        if "has_family_support" in answers:
            human.has_family_support = bool(answers["has_family_support"])
        if "available_workers_count" in answers and answers["available_workers_count"] is not None:
            try:
                human.available_workers_count = int(answers["available_workers_count"])
            except (ValueError, TypeError):
                pass

        # 3. Operational Resources
        if "has_supplier_access" in answers:
            operational.has_supplier_access = bool(answers["has_supplier_access"])
        if "raw_materials_accessible" in answers:
            operational.raw_materials_accessible = bool(answers["raw_materials_accessible"])
        if "has_storage_facility" in answers:
            operational.has_storage_facility = bool(answers["has_storage_facility"])
        if "distribution_reach" in answers and answers["distribution_reach"]:
            operational.distribution_reach = str(answers["distribution_reach"])

        # 4. Financial Resources
        if "own_contribution" in answers and answers["own_contribution"] is not None:
            try:
                financial.available_capital = float(answers["own_contribution"])
                items.append(ResourceItem(
                    name="own_capital_contribution",
                    category="financial",
                    availability=ResourceAvailability.AVAILABLE,
                    quantity=financial.available_capital,
                    unit="INR",
                    currency="INR",
                    provenance=prov
                ))
            except (ValueError, TypeError):
                pass
        elif "available_capital" in answers and answers["available_capital"] is not None:
            try:
                financial.available_capital = float(answers["available_capital"])
            except (ValueError, TypeError):
                pass

        if "existing_debt" in answers and answers["existing_debt"] is not None:
            try:
                financial.existing_debt = float(answers["existing_debt"])
            except (ValueError, TypeError):
                pass

        if "has_bank_account" in answers:
            financial.has_bank_account = bool(answers["has_bank_account"])

        return ResourceContext(
            physical=physical,
            human=human,
            operational=operational,
            financial=financial,
            all_items=items
        )
