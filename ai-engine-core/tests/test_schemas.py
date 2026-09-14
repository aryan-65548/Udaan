"""
Unit tests for Context Engine Pydantic v2 schemas and validation rules.
"""

import pytest
from pydantic import ValidationError
from ai_engine_core.schemas import (
    BackendAssessmentContextPayload,
    AssessmentContext,
    UserContext,
    BusinessContext,
    ResourceContext,
    FinanceContext,
    LocationContext,
    CompetitionContext,
    PopulationContext,
    PopulationStatus,
    SourceType,
    ClaimType,
    ProvenanceRecord,
)


def test_provenance_record_defaults():
    prov = ProvenanceRecord(source_type=SourceType.BACKEND_ASSESSMENT)
    assert prov.source_type == SourceType.BACKEND_ASSESSMENT
    assert prov.claim_type == ClaimType.USER_PROVIDED
    assert prov.recorded_at is not None


def test_population_context_unavailable_by_default():
    pop = PopulationContext()
    assert pop.status == PopulationStatus.UNAVAILABLE
    assert pop.estimated_population is None


def test_finance_context_is_calculated_flag():
    fin = FinanceContext(is_calculated=False)
    assert not fin.is_calculated
    assert fin.project_cost is None
    assert fin.currency == "INR"


def test_backend_payload_validation_success(mock_backend_payload):
    payload = BackendAssessmentContextPayload.model_validate(mock_backend_payload)
    assert payload.assessmentId == mock_backend_payload["assessmentId"]
    assert payload.user.language == "hi"
    assert payload.business.categoryName == "Kirana Store / Grocery"
    assert payload.locationIntelligence.location.latitude == 22.4707


def test_backend_payload_validation_failure_on_missing_required_fields():
    invalid_data = {
        "assessmentId": "123",
        # missing user, business, locationIntelligence
    }
    with pytest.raises(ValidationError):
        BackendAssessmentContextPayload.model_validate(invalid_data)
