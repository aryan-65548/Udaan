"""
End-to-end tests for ContextBuilder service.
"""

import pytest
from ai_engine_core.services.context_builder import ContextBuilder
from ai_engine_core.schemas.quality import QualityStatus
from ai_engine_core.schemas.provenance import SourceType
from ai_engine_core.exceptions import ContextValidationError


def test_context_builder_full_payload(mock_backend_payload):
    context = ContextBuilder.build_context(mock_backend_payload)

    # 1. Core identification
    assert context.assessment_id == mock_backend_payload["assessmentId"]
    assert context.user.user_id == mock_backend_payload["user"]["id"]
    assert context.user.language == "hi"

    # 2. Business
    assert context.business.category_name == "Kirana Store / Grocery"
    assert context.business.proposed_business_name == "Shree Ram Kirana"
    assert context.business.has_known_customers is True

    # 3. Resources
    assert context.resources.physical.has_shop is True
    assert context.resources.physical.shop_area == 350.0
    assert context.resources.financial.available_capital == 150000.0
    assert len(context.resources.physical.equipment_items) == 2

    # 4. Finance
    assert context.finance.is_calculated is True
    assert context.finance.project_cost == 500000.0
    assert context.finance.loan_amount == 350000.0
    assert context.finance.scheme_code == "PMEGP_MICRO"

    # 5. Location & Competition
    assert context.location.village_name == "Moti Khavdi"
    assert context.location.latitude == 22.4707
    assert context.competition.total_competitors == 2
    assert len(context.competition.competitors) == 2

    # 6. Quality
    assert context.quality.status in (QualityStatus.COMPLETE, QualityStatus.PARTIAL)
    assert context.quality.completeness_score >= 0.70

    # 7. Provenance preservation
    assert context.user.provenance.source_type == SourceType.USER_PROFILE
    assert context.finance.provenance.source_type == SourceType.BACKEND_FINANCE
    assert context.location.provenance.source_type == SourceType.BACKEND_LOCATION


def test_context_builder_minimal_payload(mock_minimal_payload):
    context = ContextBuilder.build_context(mock_minimal_payload)

    assert context.assessment_id == "minimal-ast-001"
    assert context.finance.is_calculated is False
    assert context.finance.project_cost is None
    assert context.competition.total_competitors == 0
    assert context.location.population.status.value == "UNAVAILABLE"
    assert context.quality.status in (QualityStatus.PARTIAL, QualityStatus.INSUFFICIENT)
    assert len(context.quality.missing_information) > 0


def test_context_builder_invalid_payload_raises():
    with pytest.raises(ContextValidationError):
        ContextBuilder.build_context({"invalid_key": 123})
