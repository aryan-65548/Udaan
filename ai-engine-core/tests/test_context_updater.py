"""
Tests for incremental ContextUpdater service.
"""

from ai_engine_core.services.context_builder import ContextBuilder
from ai_engine_core.services.context_updater import ContextUpdater
from ai_engine_core.schemas.updates import ContextUpdatePayload
from ai_engine_core.schemas.provenance import SourceType


def test_context_updater_incremental_answers(mock_minimal_payload):
    context = ContextBuilder.build_context(mock_minimal_payload)
    initial_score = context.quality.completeness_score

    # User answers that they have a 500 sqft shop and 200000 capital
    update_payload = ContextUpdatePayload(
        answers={
            "has_shop": True,
            "shop_area": 500,
            "own_contribution": 200000,
            "previous_experience": "Dairy farming helper for 2 years"
        },
        source_message="I own a 500 sqft shed and have 2 lakh capital."
    )

    updated_context, result = ContextUpdater.update_context(context, update_payload)

    assert result.success is True
    assert updated_context.resources.physical.has_shop is True
    assert updated_context.resources.physical.shop_area == 500.0
    assert updated_context.resources.financial.available_capital == 200000.0
    assert updated_context.resources.human.experience_level == "Dairy farming helper for 2 years"

    # Verify quality completeness improved
    assert updated_context.quality.completeness_score > initial_score
    assert result.quality_score_delta > 0
