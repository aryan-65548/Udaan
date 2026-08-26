"""
Deterministic Financial Engine Module.
Executes scheme routing, project cost sizing, loan capping, and moratorium amortization.
Zero LLM arithmetic - strictly Python deterministic execution.
"""

from src.interface.schemas import FinancialRoadmap
from src.calculator.amortization import calculate_quarterly_amortization


# Scheme Constants
MICRO_FINANCE_MAX_PROJECT = 140000.00
MICRO_FINANCE_MAX_LOAN = 125000.00
MICRO_FINANCE_INTEREST_RATE = 0.065
MICRO_FINANCE_TENURE_YEARS = 3
MICRO_FINANCE_MORATORIUM_MONTHS = 3

TERM_LOAN_MAX_PROJECT = 5000000.00
TERM_LOAN_MAX_LOAN = 4500000.00
TERM_LOAN_INTEREST_RATE = 0.080
TERM_LOAN_TENURE_YEARS = 7
TERM_LOAN_MORATORIUM_MONTHS = 6


def calculate_financial_roadmap(margin_capital: float) -> FinancialRoadmap:
    """
    Computes deterministic financial roadmap based on beneficiary margin capital (Cm).

    Rule A:
    1. P = Cm / 0.10 = 10 * Cm
    2. L = 0.90 * P = 9 * Cm
    3. Scheme Selection:
       - If P <= 1,40,000 INR -> "Micro Finance Scheme"
         * Cap P at 1,40,000 INR (Max Loan L = 125,000 INR)
         * r = 6.5% p.a., N = 3 years, M = 3 months
       - If P > 1,40,000 INR -> "Term Loan Scheme"
         * Cap P at 5,00,0000 INR (Max Loan L = 45,00,000 INR)
         * r = 8.0% p.a., N = 7 years, M = 6 months

    Args:
        margin_capital: Beneficiary contributed margin capital in INR (Cm > 0).

    Returns:
        Populated FinancialRoadmap Pydantic model.
    """
    if margin_capital <= 0:
        raise ValueError("Margin capital must be strictly positive.")

    # 1. Uncapped Project Cost & Loan Sizing
    raw_project_cost = margin_capital * 10.0
    raw_loan_sanction = margin_capital * 9.0

    # 2. Scheme Routing & Cap Enforcement
    if raw_project_cost <= MICRO_FINANCE_MAX_PROJECT:
        scheme_name = "Micro Finance Scheme"
        project_cost = min(raw_project_cost, MICRO_FINANCE_MAX_PROJECT)
        loan_sanction = min(raw_loan_sanction, MICRO_FINANCE_MAX_LOAN)
        interest_rate = MICRO_FINANCE_INTEREST_RATE
        tenure_years = MICRO_FINANCE_TENURE_YEARS
        moratorium_months = MICRO_FINANCE_MORATORIUM_MONTHS
    else:
        scheme_name = "Term Loan Scheme"
        project_cost = min(raw_project_cost, TERM_LOAN_MAX_PROJECT)
        loan_sanction = min(raw_loan_sanction, TERM_LOAN_MAX_LOAN)
        interest_rate = TERM_LOAN_INTEREST_RATE
        tenure_years = TERM_LOAN_TENURE_YEARS
        moratorium_months = TERM_LOAN_MORATORIUM_MONTHS

    # 3. Moratorium Capitalization & Amortization
    _, quarterly_emi, schedule = calculate_quarterly_amortization(
        loan_sanction=loan_sanction,
        annual_interest_rate=interest_rate,
        tenure_years=tenure_years,
        moratorium_months=moratorium_months
    )

    return FinancialRoadmap(
        margin_capital=round(margin_capital, 2),
        project_cost=round(project_cost, 2),
        loan_sanction=round(loan_sanction, 2),
        scheme_name=scheme_name,
        annual_interest_rate=interest_rate,
        tenure_years=tenure_years,
        moratorium_months=moratorium_months,
        quarterly_emi=quarterly_emi,
        repayment_schedule=schedule
    )
