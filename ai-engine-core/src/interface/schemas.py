"""
Pydantic v2 schemas for the AI Engine Gateway.
Defines strict input and output data contracts.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class AdvisoryRequest(BaseModel):
    """Input contract for the AI Advisor Engine."""
    location: str = Field(
        ...,
        description="Village, Taluka/Block, and District in Gujarat (e.g. 'Petlad, Anand, Gujarat')",
        examples=["Petlad, Anand, Gujarat"]
    )
    margin_capital: float = Field(
        ...,
        gt=0,
        description="Available margin capital contributed by the entrepreneur in INR (10%)",
        examples=[10000.0]
    )
    trade_category: str = Field(
        ...,
        description="Proposed micro-enterprise trade (e.g. 'Snack Shop', 'Dairy Processing', 'Spices')",
        examples=["Snack Shop"]
    )
    language_code: str = Field(
        default="en",
        description="Target response language code ('en', 'hi', 'gu')",
        examples=["en"]
    )
    output_audio: bool = Field(
        default=False,
        description="Whether to synthesize Sarvam AI TTS audio payload in the response"
    )


class QuarterlyInstallment(BaseModel):
    """Single quarter repayment installment details."""
    quarter_number: int = Field(..., description="Quarter index (1-based)")
    is_moratorium: bool = Field(..., description="True if during moratorium period (interest-only capitalization)")
    installment_amount: float = Field(..., description="Total installment payable for the quarter in INR")
    principal_component: float = Field(..., description="Principal amount repaid in INR")
    interest_component: float = Field(..., description="Interest amount paid in INR")
    remaining_balance: float = Field(..., description="Remaining loan principal balance in INR after payment")


class FinancialRoadmap(BaseModel):
    """Deterministic loan structuring and repayment roadmap."""
    margin_capital: float = Field(..., description="10% Beneficiary Margin Capital in INR")
    project_cost: float = Field(..., description="Total Feasible Project Cost in INR (10 * Cm)")
    loan_sanction: float = Field(..., description="90% Concessional Loan Sanction in INR (9 * Cm, capped by scheme)")
    scheme_name: str = Field(..., description="Selected State Channelizing Agency Scheme ('Micro Finance Scheme' or 'Term Loan Scheme')")
    annual_interest_rate: float = Field(..., description="Annual concessional interest rate (e.g. 0.065 for 6.5%)")
    tenure_years: int = Field(..., description="Total repayment tenure in years")
    moratorium_months: int = Field(..., description="Moratorium period in months")
    quarterly_emi: float = Field(..., description="Fixed quarterly EMI amount after moratorium in INR")
    repayment_schedule: List[QuarterlyInstallment] = Field(
        default_factory=list,
        description="Quarterly repayment schedule"
    )


class PackPricingDetail(BaseModel):
    """Pack-level product pricing breakdown for micro-entrepreneurs."""
    pack_size: str = Field(..., description="Pack size label (e.g. '100g Hot Plate', '250g Sealed Pouch', '1 kg Bulk Box')")
    cogs_per_pack: float = Field(..., description="Cost of Goods Sold (Raw material + packaging + fuel) in INR")
    recommended_wholesale_price: float = Field(..., description="Recommended wholesale price to local retailers in INR")
    recommended_retail_mrp: float = Field(..., description="Recommended Maximum Retail Price (MRP) in INR")
    gross_margin_pct: float = Field(..., description="Estimated gross margin percentage")


class FeasibilityReport(BaseModel):
    """Structured 7-section AI Feasibility Report."""
    market_reach: str = Field(..., description="Section 1: Market Reach & Catchment Analysis (5-10 km radius)")
    opportunity_niche: str = Field(..., description="Section 2: Opportunity & Underserved Niche Analysis")
    swot_analysis: Dict[str, List[str]] = Field(
        ...,
        description="Section 3: SWOT Matrix (strengths, weaknesses, opportunities, threats)"
    )
    hyper_local_threats: str = Field(..., description="Section 4: Hyper-Local Threats & Grassroots Mitigation")
    competitor_density: str = Field(..., description="Section 5: Competitor Density & Saturation Analysis")
    pricing_strategy: List[PackPricingDetail] = Field(
        ...,
        description="Section 6: Product Pricing & Growth-Oriented Pack Strategy"
    )
    financial_summary: str = Field(..., description="Section 7: Structured Financial Summary")


class AdvisoryResponse(BaseModel):
    """Output contract returned by the AI Engine Gateway."""
    request_id: str = Field(..., description="Unique UUID for tracing execution")
    location: str = Field(..., description="User input location")
    trade_category: str = Field(..., description="User input trade category")
    language_code: str = Field(..., description="Response language code")
    financial_roadmap: FinancialRoadmap = Field(..., description="Pre-calculated deterministic financial roadmap")
    feasibility_report: FeasibilityReport = Field(..., description="Verified 7-section feasibility advisory report")
    composite_confidence_score: float = Field(..., description="LLM-as-a-Judge composite confidence score (S_conf >= 0.82)")
    audio_payload_base64: Optional[str] = Field(
        default=None,
        description="Synthesized audio stream (Base64 encoded) if output_audio was requested"
    )
