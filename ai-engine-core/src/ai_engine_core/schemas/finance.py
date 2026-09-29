"""
Finance context schema representing financial calculations and loan parameters.
"""

from typing import Optional
from pydantic import BaseModel, Field
from .provenance import ProvenanceRecord, SourceType, ClaimType


class FinanceContext(BaseModel):
    """Canonical representation of backend-derived financial feasibility data."""
    is_calculated: bool = Field(default=False, description="True if a formal financial run has executed")
    
    project_cost: Optional[float] = Field(None, description="Total estimated initial project setup cost")
    own_contribution: Optional[float] = Field(None, description="Equity/promoter contribution in INR")
    loan_amount: Optional[float] = Field(None, description="Required institutional loan amount in INR")
    
    monthly_revenue: Optional[float] = Field(None, description="Projected monthly gross revenue")
    monthly_operating_cost: Optional[float] = Field(None, description="Projected monthly operating cost")
    
    interest_rate: Optional[float] = Field(None, description="Annual percentage rate (%)")
    tenure_months: Optional[int] = Field(None, description="Loan repayment duration in months")
    moratorium_months: Optional[int] = Field(None, description="Grace period before principal repayment starts")
    payment_frequency: Optional[str] = Field(None, description="MONTHLY, QUARTERLY, or YEARLY")
    
    emi: Optional[float] = Field(None, description="Equated Monthly Installment in INR")
    installment_amount: Optional[float] = Field(None, description="Scheduled installment amount in INR")
    annual_debt_service: Optional[float] = Field(None, description="Total annual repayment commitment in INR")
    dscr: Optional[float] = Field(None, description="Debt Service Coverage Ratio (Net Operating Income / Debt Service)")
    total_interest: Optional[float] = Field(None, description="Total cumulative interest over loan life")
    total_repayment: Optional[float] = Field(None, description="Total debt cash outflow (Principal + Interest)")
    
    scheme_code: Optional[str] = Field(None, description="Government or institutional scheme code if applied")
    scheme_name: Optional[str] = Field(None, description="Government or institutional scheme name if applied")
    calculation_version: Optional[str] = Field(None, description="Backend calculator version for auditability")
    
    currency: str = Field(default="INR")
    provenance: ProvenanceRecord = Field(
        default_factory=lambda: ProvenanceRecord(
            source_type=SourceType.BACKEND_FINANCE,
            claim_type=ClaimType.DERIVED
        )
    )
