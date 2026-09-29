"""
Context Quality Evaluator.
Deterministic, evidence-based assessment of context completeness, missing information, and limitations.
Tailored with domain category rules for rural and semi-urban enterprises.
"""

from typing import List
from ..schemas.quality import (
    ContextQuality,
    QualityStatus,
    MissingInformationItem,
    FieldImportance,
)
from ..schemas.canonical_context import AssessmentContext
from ..schemas.location import PopulationStatus
from ..domain.category_rules import CategoryRuleEngine


class ContextQualityEvaluator:
    """Evaluates canonical context to detect missing data and calculate completeness ratio."""

    @classmethod
    def evaluate(cls, context: AssessmentContext) -> ContextQuality:
        missing_items: List[MissingInformationItem] = []
        limitations: List[str] = []
        
        score = 0.0

        # Match category rules
        category_reqs = CategoryRuleEngine.match_category(
            f"{context.business.category_id} {context.business.category_name}"
        )

        # 1. Business Category & Intended Business (Weight: 15)
        if context.business.category_id and context.business.category_name != "Unknown":
            score += 15.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="category_name",
                category="business",
                importance=FieldImportance.CRITICAL,
                reason="Business category is mandatory to evaluate feasibility and competitors."
            ))

        # 2. Location Intelligence (Weight: 20)
        if context.location.latitude != 0.0 and context.location.longitude != 0.0:
            score += 20.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="coordinates",
                category="location",
                importance=FieldImportance.CRITICAL,
                reason="Geographic coordinates are required for spatial analysis."
            ))
            limitations.append("Exact geographic coordinates are unavailable.")

        # 3. Population Intelligence (Weight: 10)
        if context.location.population.status != PopulationStatus.UNAVAILABLE and context.location.population.estimated_population:
            score += 10.0
            if context.location.population.limitations:
                limitations.append(context.location.population.limitations)
        else:
            missing_items.append(MissingInformationItem(
                field_name="estimated_population",
                category="location",
                importance=FieldImportance.MEDIUM,
                reason="Local demographic counts help calibrate catchment demand."
            ))
            limitations.append("Local census/population data is unavailable.")

        # 4. Competition Intelligence (Weight: 10)
        if context.competition.provider != "unavailable":
            score += 10.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="competition_data",
                category="competition",
                importance=FieldImportance.MEDIUM,
                reason="Competitor directory was unavailable during location generation."
            ))
            limitations.append("Live Google Places competitor discovery was unavailable.")

        # 5. Finance (Weight: 15)
        if context.finance.is_calculated and context.finance.project_cost is not None:
            score += 15.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="project_cost",
                category="finance",
                importance=FieldImportance.HIGH,
                reason="Project cost and financial run are needed to verify loan feasibility."
            ))

        # 6. Physical & Operational Resources (Weight: 20)
        res = context.resources
        resource_score = 0.0
        
        # Space evaluation
        requires_space = category_reqs.requires_commercial_space if category_reqs else True
        if res.physical.has_shop is not None or res.physical.has_land is not None or res.physical.has_room is not None:
            resource_score += 5.0
        else:
            importance = FieldImportance.HIGH if requires_space else FieldImportance.MEDIUM
            missing_items.append(MissingInformationItem(
                field_name="commercial_space",
                category="resources",
                importance=importance,
                reason=f"Need to know if entrepreneur has commercial space or land for {context.business.category_name}."
            ))

        # Power / Water category requirements
        if category_reqs and category_reqs.requires_three_phase_power:
            if res.physical.has_three_phase_power is not None:
                resource_score += 2.5
            else:
                missing_items.append(MissingInformationItem(
                    field_name="three_phase_power",
                    category="resources",
                    importance=FieldImportance.HIGH,
                    reason=f"{category_reqs.category_name} requires 3-phase industrial/commercial electricity connection."
                ))
        elif category_reqs and category_reqs.requires_water_supply:
            if res.physical.has_water_supply is not None:
                resource_score += 2.5
            else:
                missing_items.append(MissingInformationItem(
                    field_name="water_supply",
                    category="resources",
                    importance=FieldImportance.HIGH,
                    reason=f"{category_reqs.category_name} requires reliable dedicated water supply."
                ))
        else:
            resource_score += 2.5

        # Equipment
        if res.physical.has_equipment is not None or len(res.physical.equipment_items) > 0:
            resource_score += 5.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="equipment_availability",
                category="resources",
                importance=FieldImportance.MEDIUM,
                reason="Inventory of existing machinery or tools reduces required capital."
            ))

        # Own Capital
        if res.financial.available_capital is not None:
            resource_score += 7.5
        else:
            missing_items.append(MissingInformationItem(
                field_name="own_capital_contribution",
                category="resources",
                importance=FieldImportance.HIGH,
                reason="Entrepreneur's own capital contribution is critical for loan sizing."
            ))

        score += min(20.0, resource_score)

        # 7. Human & Experience (Weight: 10)
        if context.user.previous_experience is not None:
            score += 5.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="previous_experience",
                category="user",
                importance=FieldImportance.MEDIUM,
                reason="Prior business knowledge influences operational risk assessment."
            ))

        if context.business.has_known_customers is not None or context.business.target_customer_segment is not None:
            score += 5.0
        else:
            missing_items.append(MissingInformationItem(
                field_name="target_customer_segment",
                category="business",
                importance=FieldImportance.LOW,
                reason="Specifying initial buyer base improves revenue viability."
            ))

        completeness_ratio = round(min(1.0, max(0.0, score / 100.0)), 2)

        # Categorical state
        if completeness_ratio >= 0.80 and not any(m.importance == FieldImportance.CRITICAL for m in missing_items):
            status = QualityStatus.COMPLETE
            summary = "Context is comprehensive and ready for in-depth advisory reasoning."
        elif completeness_ratio >= 0.40:
            status = QualityStatus.PARTIAL
            summary = f"Context is partially populated ({int(completeness_ratio*100)}%). Adaptive questions can clarify remaining parameters."
        else:
            status = QualityStatus.INSUFFICIENT
            summary = "Context lacks critical baseline data. Foundational inputs are required."

        return ContextQuality(
            status=status,
            completeness_score=completeness_ratio,
            missing_information=missing_items,
            limitations=limitations,
            evaluation_summary=summary
        )
