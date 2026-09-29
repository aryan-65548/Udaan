"""
Pytest fixtures for Udaan AI Context Engine.
"""

import sys
from pathlib import Path
import pytest

# Add src to pythonpath
src_dir = Path(__file__).resolve().parent.parent / "src"
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))


@pytest.fixture
def mock_backend_payload():
    """Standard valid payload matching AiGatewayService.buildAssessmentContext()."""
    return {
        "assessmentId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "user": {
            "id": "11111111-2222-3333-4444-555555555555",
            "language": "hi"
        },
        "business": {
            "categoryId": "cat_grocery_001",
            "categoryName": "Kirana Store / Grocery"
        },
        "answers": {
            "has_land": True,
            "land_area": 1200,
            "land_unit": "sqft",
            "has_shop": True,
            "shop_area": 350,
            "shop_ownership": "owned",
            "has_equipment": True,
            "equipment_items": ["Refrigerator", "Digital Weighing Scale"],
            "previous_experience": "3 years as assistant in village grocery",
            "skills": ["inventory_management", "customer_service", "basic_accounting"],
            "expected_working_hours": 10,
            "has_known_customers": True,
            "has_supplier_access": True,
            "own_contribution": 150000,
            "proposed_business_name": "Shree Ram Kirana"
        },
        "finance": {
            "id": "fin_run_123",
            "projectCost": "500000.00",
            "ownContribution": "150000.00",
            "loanAmount": "350000.00",
            "monthlyRevenue": "85000.00",
            "monthlyOperatingCost": "55000.00",
            "interestRate": "8.500",
            "tenureMonths": 60,
            "moratoriumMonths": 3,
            "paymentFrequency": "MONTHLY",
            "emi": "7181.50",
            "dscr": "2.0885",
            "totalInterest": "80890.00",
            "totalRepayment": "430890.00",
            "schemeCode": "PMEGP_MICRO",
            "schemeName": "Prime Minister Employment Generation Programme"
        },
        "locationIntelligence": {
            "location": {
                "locationId": "loc_village_01",
                "villageName": "Moti Khavdi",
                "blockName": "Jamnagar",
                "districtName": "Jamnagar",
                "stateName": "Gujarat",
                "pincode": "361140",
                "formattedAddress": "Moti Khavdi, Jamnagar, Gujarat",
                "latitude": 22.4707,
                "longitude": 70.0577
            },
            "competition": {
                "radiusKm": 5.0,
                "totalCompetitors": 2,
                "provider": "google_places",
                "retrievedAt": "2026-09-14T10:00:00Z",
                "competitors": [
                    {
                        "name": "Patel General Store",
                        "category": "grocery_store",
                        "latitude": 22.4720,
                        "longitude": 70.0585,
                        "distanceKm": 0.25,
                        "formattedAddress": "Main Bazaar, Moti Khavdi",
                        "providerPlaceId": "ChIJ12345"
                    },
                    {
                        "name": "Ambica Provision",
                        "category": "supermarket",
                        "latitude": 22.4750,
                        "longitude": 70.0610,
                        "distanceKm": 0.85,
                        "formattedAddress": "Station Road, Moti Khavdi",
                        "providerPlaceId": "ChIJ67890"
                    }
                ]
            },
            "population": {
                "estimatedPopulation": 14500,
                "radiusKm": 5.0,
                "source": "Census 2011 PCA",
                "dataYear": 2011
            }
        }
    }


@pytest.fixture
def mock_minimal_payload():
    """Minimal valid payload with absent finance, population, and empty competition."""
    return {
        "assessmentId": "minimal-ast-001",
        "user": {
            "id": "user-001",
            "language": "en"
        },
        "business": {
            "categoryId": "cat_dairy_002",
            "categoryName": "Dairy Farming"
        },
        "answers": {},
        "finance": None,
        "locationIntelligence": {
            "location": {
                "locationId": "loc_002",
                "formattedAddress": "Anand, Gujarat",
                "latitude": 22.5645,
                "longitude": 72.9289
            },
            "competition": None,
            "population": None
        }
    }
