"""
Deterministic Amortization & Moratorium Schedule Engine.
Strictly python math, zero LLM arithmetic.
"""

from typing import List, Tuple
from src.interface.schemas import QuarterlyInstallment


def calculate_quarterly_amortization(
    loan_sanction: float,
    annual_interest_rate: float,
    tenure_years: int,
    moratorium_months: int
) -> Tuple[float, float, List[QuarterlyInstallment]]:
    """
    Computes Moratorium Interest Capitalization, Adjusted Loan Principal,
    Fixed Quarterly EMI Amount, and the Itemized Quarterly Repayment Schedule.

    Args:
        loan_sanction: Initial loan sanction amount (L) in INR.
        annual_interest_rate: Annual concessional interest rate (r) e.g. 0.065 or 0.080.
        tenure_years: Total tenure in years (N).
        moratorium_months: Moratorium period in months (M).

    Returns:
        Tuple of (adjusted_principal, quarterly_emi, repayment_schedule)
    """
    r_q = annual_interest_rate / 4.0
    total_quarters = tenure_years * 4
    moratorium_quarters = moratorium_months // 3
    active_quarters = total_quarters - moratorium_quarters

    if active_quarters <= 0:
        raise ValueError("Total tenure quarters must exceed moratorium quarters.")

    # 1. Moratorium Interest Capitalization: L_adj = L * ((1 + r_q) ** M_q)
    adjusted_principal = loan_sanction * ((1.0 + r_q) ** moratorium_quarters)

    # 2. Quarterly EMI Formula: EMI_q = L_adj * (r_q * (1 + r_q)^A_q) / ((1 + r_q)^A_q - 1)
    factor = (1.0 + r_q) ** active_quarters
    quarterly_emi = adjusted_principal * (r_q * factor) / (factor - 1.0)

    # 3. Itemized Schedule Generation
    schedule: List[QuarterlyInstallment] = []
    current_balance = loan_sanction

    # Moratorium Quarters (Interest Capitalization)
    for q in range(1, moratorium_quarters + 1):
        interest_comp = current_balance * r_q
        current_balance += interest_comp  # Capitalized into principal
        schedule.append(
            QuarterlyInstallment(
                quarter_number=q,
                is_moratorium=True,
                installment_amount=0.0,
                principal_component=0.0,
                interest_component=round(interest_comp, 2),
                remaining_balance=round(current_balance, 2)
            )
        )

    # Active Repayment Quarters
    for q in range(moratorium_quarters + 1, total_quarters + 1):
        interest_comp = current_balance * r_q
        principal_comp = quarterly_emi - interest_comp

        if q == total_quarters:
            # Last installment adjustment to zero out balance cleanly
            principal_comp = current_balance
            installment_amt = principal_comp + interest_comp
            current_balance = 0.0
        else:
            installment_amt = quarterly_emi
            current_balance -= principal_comp

        schedule.append(
            QuarterlyInstallment(
                quarter_number=q,
                is_moratorium=False,
                installment_amount=round(installment_amt, 2),
                principal_component=round(principal_comp, 2),
                interest_component=round(interest_comp, 2),
                remaining_balance=round(max(0.0, current_balance), 2)
            )
        )

    return round(adjusted_principal, 2), round(quarterly_emi, 2), schedule
