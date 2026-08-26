"""
Unit tests for the Deterministic Financial Engine.
Verifies exact loan math, moratorium capitalization, scheme auto-routing, and repayment schedules.
"""

import pytest
from src.calculator.financial_engine import (
    calculate_financial_roadmap,
    MICRO_FINANCE_MAX_PROJECT,
    MICRO_FINANCE_MAX_LOAN,
    TERM_LOAN_MAX_PROJECT,
    TERM_LOAN_MAX_LOAN
)
from src.calculator.amortization import calculate_quarterly_amortization


def test_micro_finance_scheme_routing():
    """Test Micro Finance scheme selection for Cm = 10,000 INR."""
    margin_capital = 10000.0
    roadmap = calculate_financial_roadmap(margin_capital)

    assert roadmap.scheme_name == "Micro Finance Scheme"
    assert roadmap.project_cost == 100000.0  # 10 * 10,000
    assert roadmap.loan_sanction == 90000.0   # 9 * 10,000
    assert roadmap.annual_interest_rate == 0.065
    assert roadmap.tenure_years == 3
    assert roadmap.moratorium_months == 3
    assert roadmap.quarterly_emi > 0
    assert len(roadmap.repayment_schedule) == 12  # 3 years * 4 quarters


def test_micro_finance_capping_limit():
    """Test Micro Finance cap when raw project cost exceeds 1,40,000 INR limit for Micro Finance."""
    # Cm = 15,000 -> raw P = 1,50,000 > 1,40,000 -> routes to Term Loan
    margin_capital = 15000.0
    roadmap = calculate_financial_roadmap(margin_capital)

    assert roadmap.scheme_name == "Term Loan Scheme"
    assert roadmap.project_cost == 150000.0
    assert roadmap.loan_sanction == 135000.0

    # Cm = 14,000 -> raw P = 1,40,000 -> exactly Micro Finance cap
    margin_capital_boundary = 14000.0
    roadmap_boundary = calculate_financial_roadmap(margin_capital_boundary)
    assert roadmap_boundary.scheme_name == "Micro Finance Scheme"
    assert roadmap_boundary.project_cost == 140000.0
    assert roadmap_boundary.loan_sanction == 125000.0  # Capped at max loan cap


def test_term_loan_scheme_routing():
    """Test Term Loan scheme selection for Cm = 50,000 INR."""
    margin_capital = 50000.0
    roadmap = calculate_financial_roadmap(margin_capital)

    assert roadmap.scheme_name == "Term Loan Scheme"
    assert roadmap.project_cost == 500000.0
    assert roadmap.loan_sanction == 450000.0
    assert roadmap.annual_interest_rate == 0.080
    assert roadmap.tenure_years == 7
    assert roadmap.moratorium_months == 6
    assert roadmap.quarterly_emi > 0
    assert len(roadmap.repayment_schedule) == 28  # 7 years * 4 quarters


def test_term_loan_upper_cap():
    """Test upper capping limit for Term Loan (P capped at 50 Lakhs, L capped at 45 Lakhs)."""
    margin_capital = 600000.0  # Raw P = 60 Lakhs
    roadmap = calculate_financial_roadmap(margin_capital)

    assert roadmap.scheme_name == "Term Loan Scheme"
    assert roadmap.project_cost == TERM_LOAN_MAX_PROJECT  # 50,00,000
    assert roadmap.loan_sanction == TERM_LOAN_MAX_LOAN        # 45,00,000


def test_moratorium_interest_capitalization():
    """Test moratorium interest capitalization logic."""
    loan = 100000.0
    r = 0.08  # 8% p.a -> rq = 2% per quarter
    tenure_years = 2
    moratorium_months = 6  # 2 quarters

    adj_principal, emi, schedule = calculate_quarterly_amortization(
        loan_sanction=loan,
        annual_interest_rate=r,
        tenure_years=tenure_years,
        moratorium_months=moratorium_months
    )

    # 2 quarters moratorium -> L_adj = 100,000 * (1.02)^2 = 104,040
    assert adj_principal == 104040.0

    # Quarters 1 & 2 must be moratorium installments (0 principal repayment)
    assert schedule[0].is_moratorium is True
    assert schedule[0].installment_amount == 0.0
    assert schedule[0].interest_component == 2000.0
    assert schedule[0].remaining_balance == 102000.0

    assert schedule[1].is_moratorium is True
    assert schedule[1].installment_amount == 0.0
    assert schedule[1].interest_component == 2040.0
    assert schedule[1].remaining_balance == 104040.0

    # Final quarter remaining balance must be 0.0
    assert schedule[-1].remaining_balance == 0.0


def test_invalid_margin_capital():
    """Test exception raising for invalid zero or negative margin capital."""
    with pytest.raises(ValueError, match="Margin capital must be strictly positive"):
        calculate_financial_roadmap(0.0)

    with pytest.raises(ValueError, match="Margin capital must be strictly positive"):
        calculate_financial_roadmap(-5000.0)
