"""
Tests for unit/currency converters, category rule engine, audit trails, and prompt formatting.
"""

from ai_engine_core.normalizers.converters import UnitConverter, CurrencyConverter
from ai_engine_core.domain.category_rules import CategoryRuleEngine
from ai_engine_core.services.context_builder import ContextBuilder
from ai_engine_core.services.context_updater import ContextUpdater
from ai_engine_core.services.context_formatter import ContextFormatter
from ai_engine_core.schemas.updates import ContextUpdatePayload


def test_unit_converter_areas():
    # Bigha
    val_bigha, unit_bigha = UnitConverter.normalize_area(1.0, "bigha")
    assert val_bigha == 17424.0
    assert unit_bigha == "sqft"

    # Acre
    val_acre, unit_acre = UnitConverter.normalize_area(2.0, "acre")
    assert val_acre == 87120.0
    assert unit_acre == "sqft"

    # Guntha
    val_guntha, unit_guntha = UnitConverter.normalize_area(1.0, "guntha")
    assert val_guntha == 1089.0
    assert unit_guntha == "sqft"


def test_currency_converter_indian_notations():
    assert CurrencyConverter.parse_inr("2.5 lakh") == 250000.0
    assert CurrencyConverter.parse_inr("15L") == 1500000.0
    assert CurrencyConverter.parse_inr("1.2 crore") == 12000000.0
    assert CurrencyConverter.parse_inr("50k") == 50000.0
    assert CurrencyConverter.parse_inr("₹ 3,50,000") == 350000.0


def test_category_rule_engine_matching():
    req_dairy = CategoryRuleEngine.match_category("Dairy Farm Setup")
    assert req_dairy is not None
    assert req_dairy.requires_water_supply is True
    assert req_dairy.requires_commercial_space is False

    req_chakki = CategoryRuleEngine.match_category("Flour Mill Atta Chakki")
    assert req_chakki is not None
    assert req_chakki.requires_three_phase_power is True
    assert req_chakki.requires_commercial_space is True


def test_context_updater_audit_trail(mock_backend_payload):
    context = ContextBuilder.build_context(mock_backend_payload)
    assert len(context.history) == 0

    update_payload = ContextUpdatePayload(
        answers={"shop_area": 450},
        source_message="I expanded the shop to 450 sqft"
    )
    updated_context, result = ContextUpdater.update_context(context, update_payload)

    assert len(updated_context.history) == 1
    audit = updated_context.history[0]
    assert audit.source_message == "I expanded the shop to 450 sqft"
    assert "answers.shop_area" in audit.updated_fields
    assert updated_context.resources.physical.shop_area == 450.0


def test_context_formatter_prompt_output(mock_backend_payload):
    context = ContextBuilder.build_context(mock_backend_payload)
    prompt_str = ContextFormatter.format_as_prompt_context(context)

    assert "# Business Assessment Context" in prompt_str
    assert "Entrepreneur Profile" in prompt_str
    assert "Kirana Store / Grocery" in prompt_str
    assert "Moti Khavdi" in prompt_str
    assert "₹500,000.00" in prompt_str
    assert "Context Quality & Intelligence Limitations" in prompt_str
