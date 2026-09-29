"""
Tests for ContextQualityEvaluator.
"""

from ai_engine_core.services.context_builder import ContextBuilder
from ai_engine_core.services.context_quality import ContextQualityEvaluator
from ai_engine_core.schemas.quality import QualityStatus, FieldImportance


def test_quality_evaluator_missing_fields(mock_minimal_payload):
    context = ContextBuilder.build_context(mock_minimal_payload)
    quality = ContextQualityEvaluator.evaluate(context)

    missing_field_names = [m.field_name for m in quality.missing_information]
    assert "project_cost" in missing_field_names
    assert "commercial_space" in missing_field_names
    assert "own_capital_contribution" in missing_field_names

    # Check limitations recorded
    assert any("population" in lim.lower() for lim in quality.limitations)


def test_quality_evaluator_high_completeness(mock_backend_payload):
    context = ContextBuilder.build_context(mock_backend_payload)
    quality = ContextQualityEvaluator.evaluate(context)

    assert quality.completeness_score >= 0.80
    assert quality.status == QualityStatus.COMPLETE
