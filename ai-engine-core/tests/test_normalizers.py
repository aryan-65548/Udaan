"""
Unit tests for Context Engine normalizers.
"""

from ai_engine_core.normalizers import (
    AnswerNormalizer,
    ResourceNormalizer,
    FinanceNormalizer,
    LocationNormalizer,
    CompetitionNormalizer,
    PopulationNormalizer,
)
from ai_engine_core.schemas.resources import ResourceAvailability
from ai_engine_core.schemas.location import PopulationStatus


def test_answer_normalizer_booleans_and_numbers():
    raw = {
        "is_active": "yes",
        "has_loan": "0",
        "budget": "2,50,000",
        "hours": "8.5",
        "blank": "   ",
        "none_val": None,
        "already_bool": True
    }
    norm = AnswerNormalizer.normalize_answers(raw)
    assert norm["is_active"] is True
    assert norm["has_loan"] is False
    assert norm["budget"] == 250000
    assert norm["hours"] == 8.5
    assert norm["blank"] is None
    assert norm["none_val"] is None
    assert norm["already_bool"] is True


def test_resource_normalizer_extraction():
    answers = {
        "has_land": True,
        "land_area": 500,
        "land_unit": "sqft",
        "has_shop": True,
        "shop_area": 200,
        "previous_experience": "Retail helper",
        "skills": ["sales", "accounting"],
        "own_contribution": 50000,
        "has_supplier_access": True
    }
    res = ResourceNormalizer.normalize(answers)
    assert res.physical.has_land is True
    assert res.physical.land_area == 500.0
    assert res.physical.has_shop is True
    assert res.human.experience_level == "Retail helper"
    assert "sales" in res.human.relevant_skills
    assert res.financial.available_capital == 50000.0
    assert res.operational.has_supplier_access is True
    assert len(res.all_items) >= 3


def test_finance_normalizer_null_handling():
    # Null finance run
    fin = FinanceNormalizer.normalize(None)
    assert fin.is_calculated is False
    assert fin.project_cost is None

    # Valid finance run
    fin_valid = FinanceNormalizer.normalize({
        "projectCost": "300000.00",
        "loanAmount": "210000.00",
        "interestRate": "9.2",
        "emi": "4380.00",
        "dscr": "1.85",
        "schemeCode": "PMEGP"
    })
    assert fin_valid.is_calculated is True
    assert fin_valid.project_cost == 300000.0
    assert fin_valid.loan_amount == 210000.0
    assert fin_valid.emi == 4380.0
    assert fin_valid.dscr == 1.85


def test_population_normalizer_vintage_and_unavailable():
    # Unavailable
    pop_none = PopulationNormalizer.normalize(None)
    assert pop_none.status == PopulationStatus.UNAVAILABLE
    assert pop_none.estimated_population is None

    # Available with vintage caveat
    pop_data = PopulationNormalizer.normalize({
        "estimatedPopulation": 25000,
        "radiusKm": 5.0,
        "source": "Census 2011",
        "dataYear": 2011
    })
    assert pop_data.status == PopulationStatus.AVAILABLE
    assert pop_data.estimated_population == 25000
    assert pop_data.data_year == 2011
    assert "2011" in (pop_data.limitations or "")


def test_competition_normalizer():
    comp_raw = {
        "radiusKm": 3.0,
        "totalCompetitors": 1,
        "provider": "google_places",
        "competitors": [
            {
                "name": "Local Store",
                "category": "store",
                "distanceKm": 0.4,
                "latitude": 19.0,
                "longitude": 72.8
            }
        ]
    }
    comp = CompetitionNormalizer.normalize(comp_raw)
    assert comp.radius_km == 3.0
    assert comp.total_competitors == 1
    assert len(comp.competitors) == 1
    assert comp.competitors[0].name == "Local Store"
    assert comp.competitors[0].distance_km == 0.4
