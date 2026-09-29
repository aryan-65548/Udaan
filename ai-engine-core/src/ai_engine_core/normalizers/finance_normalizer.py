"""
Finance normalizer for financial run payloads.
"""

from typing import Any, Dict, Optional
from ..schemas.finance import FinanceContext
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType


class FinanceNormalizer:
    """Standardizes financial run records into canonical FinanceContext."""

    @classmethod
    def _parse_float(cls, val: Any) -> Optional[float]:
        if val is None or val == "":
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    @classmethod
    def _parse_int(cls, val: Any) -> Optional[int]:
        if val is None or val == "":
            return None
        try:
            return int(val)
        except (ValueError, TypeError):
            return None

    @classmethod
    def normalize(
        cls,
        raw_finance: Optional[Dict[str, Any]],
        provenance: Optional[ProvenanceRecord] = None
    ) -> FinanceContext:
        if not raw_finance:
            # Explicitly not calculated
            return FinanceContext(
                is_calculated=False,
                provenance=provenance or ProvenanceRecord(
                    source_type=SourceType.BACKEND_FINANCE,
                    claim_type=ClaimType.DERIVED,
                    notes="No financial run available"
                )
            )

        prov = provenance or ProvenanceRecord(
            source_type=SourceType.BACKEND_FINANCE,
            claim_type=ClaimType.DERIVED,
            source_reference=str(raw_finance.get("id", "financial_run"))
        )

        return FinanceContext(
            is_calculated=True,
            project_cost=cls._parse_float(raw_finance.get("projectCost") or raw_finance.get("project_cost")),
            own_contribution=cls._parse_float(raw_finance.get("ownContribution") or raw_finance.get("own_contribution")),
            loan_amount=cls._parse_float(raw_finance.get("loanAmount") or raw_finance.get("loan_amount")),
            monthly_revenue=cls._parse_float(raw_finance.get("monthlyRevenue") or raw_finance.get("monthly_revenue")),
            monthly_operating_cost=cls._parse_float(raw_finance.get("monthlyOperatingCost") or raw_finance.get("monthly_operating_cost")),
            interest_rate=cls._parse_float(raw_finance.get("interestRate") or raw_finance.get("interest_rate")),
            tenure_months=cls._parse_int(raw_finance.get("tenureMonths") or raw_finance.get("tenure_months")),
            moratorium_months=cls._parse_int(raw_finance.get("moratoriumMonths") or raw_finance.get("moratorium_months")),
            payment_frequency=raw_finance.get("paymentFrequency") or raw_finance.get("payment_frequency"),
            emi=cls._parse_float(raw_finance.get("emi")),
            installment_amount=cls._parse_float(raw_finance.get("installmentAmount") or raw_finance.get("installment_amount")),
            annual_debt_service=cls._parse_float(raw_finance.get("annualDebtService") or raw_finance.get("annual_debt_service")),
            dscr=cls._parse_float(raw_finance.get("dscr")),
            total_interest=cls._parse_float(raw_finance.get("totalInterest") or raw_finance.get("total_interest")),
            total_repayment=cls._parse_float(raw_finance.get("totalRepayment") or raw_finance.get("total_repayment")),
            scheme_code=raw_finance.get("schemeCode") or raw_finance.get("scheme_code"),
            scheme_name=raw_finance.get("schemeName") or raw_finance.get("scheme_name"),
            calculation_version=raw_finance.get("calculationVersion") or raw_finance.get("calculation_version", "1.0"),
            currency=raw_finance.get("currency", "INR"),
            provenance=prov
        )
