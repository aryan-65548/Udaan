"""
Context Formatter Service.
Serializes canonical AssessmentContext into clean, structured Markdown prompts for downstream AI modules.
"""

from ..schemas.canonical_context import AssessmentContext


class ContextFormatter:
    """Renders canonical context into structured LLM-ready markdown summaries."""

    @classmethod
    def format_as_prompt_context(cls, context: AssessmentContext) -> str:
        """
        Generates clean Markdown context ready to be injected into system/user prompts.
        """
        lines = [
            f"# Business Assessment Context (ID: {context.assessment_id})",
            "",
            "## 1. Entrepreneur Profile",
            f"- **User ID**: `{context.user.user_id}`",
            f"- **Communication Language**: {context.user.language}",
            f"- **Prior Experience**: {context.user.previous_experience or 'Not specified'}",
            f"- **Declared Skills**: {', '.join(context.user.skills) if context.user.skills else 'None declared'}",
            f"- **Daily Working Hours**: {context.user.expected_working_hours_per_day or 'Not specified'} hrs/day",
            "",
            "## 2. Proposed Business Opportunity",
            f"- **Category**: {context.business.category_name} (ID: `{context.business.category_id}`)",
            f"- **Venture Name**: {context.business.proposed_business_name or 'Not named yet'}",
            f"- **Current Stage**: {context.business.business_stage}",
            f"- **Known Customers / Buyers**: {'Yes' if context.business.has_known_customers else ('No' if context.business.has_known_customers is False else 'Unknown')}",
            f"- **Target Customer Segment**: {context.business.target_customer_segment or 'Not specified'}",
            "",
            "## 3. Location & Demographics",
            f"- **Target Location**: {context.location.formatted_address}",
            f"- **Hierarchy**: Village: {context.location.village_name or 'N/A'}, Block: {context.location.block_name or 'N/A'}, District: {context.location.district_name or 'N/A'}, State: {context.location.state_name or 'N/A'}",
            f"- **Coordinates**: Lat {context.location.latitude}, Lng {context.location.longitude}",
            f"- **Catchment Radius**: {context.location.search_radius_km} km",
            f"- **Population Status**: {context.location.population.status.value}",
        ]

        if context.location.population.estimated_population:
            lines.append(f"- **Estimated Population**: {context.location.population.estimated_population:,} (Source: {context.location.population.source or 'Demographic DB'}, Year: {context.location.population.data_year or 'N/A'})")

        lines.extend([
            "",
            "## 4. Competition Intelligence",
            f"- **Total Detected Competitors**: {context.competition.total_competitors}",
            f"- **Discovery Provider**: {context.competition.provider}",
        ])

        if context.competition.competitors:
            lines.append("- **Detected Competitors List**:")
            for idx, comp in enumerate(context.competition.competitors[:10], start=1):
                dist = f"({comp.distance_km} km away)" if comp.distance_km else ""
                lines.append(f"  {idx}. {comp.name} {dist} - {comp.category or 'General'}")

        lines.extend([
            "",
            "## 5. Entrepreneur Resources & Assets",
            f"- **Commercial Shop**: {'Available (' + str(context.resources.physical.shop_area) + ' sqft, ' + str(context.resources.physical.shop_ownership) + ')' if context.resources.physical.has_shop else ('No shop' if context.resources.physical.has_shop is False else 'Unknown')}",
            f"- **Land**: {'Available (' + str(context.resources.physical.land_area) + ' ' + str(context.resources.physical.land_unit) + ')' if context.resources.physical.has_land else ('No land' if context.resources.physical.has_land is False else 'Unknown')}",
            f"- **Available Own Capital**: ₹{context.resources.financial.available_capital:,.2f}" if context.resources.financial.available_capital is not None else "- **Available Own Capital**: Not reported",
            f"- **Three-Phase Electricity**: {'Yes' if context.resources.physical.has_three_phase_power else ('No' if context.resources.physical.has_three_phase_power is False else 'Unknown')}",
            f"- **Water Supply**: {'Yes' if context.resources.physical.has_water_supply else ('No' if context.resources.physical.has_water_supply is False else 'Unknown')}",
        ])

        if context.resources.physical.equipment_items:
            eq_names = [eq.name for eq in context.resources.physical.equipment_items]
            lines.append(f"- **Existing Equipment**: {', '.join(eq_names)}")

        lines.extend([
            "",
            "## 6. Financial Structure",
            f"- **Financial Run Performed**: {'Yes' if context.finance.is_calculated else 'No'}",
        ])

        if context.finance.is_calculated:
            lines.extend([
                f"- **Total Project Cost**: ₹{context.finance.project_cost:,.2f}" if context.finance.project_cost else "- **Total Project Cost**: N/A",
                f"- **Promoter Contribution**: ₹{context.finance.own_contribution:,.2f}" if context.finance.own_contribution else "- **Promoter Contribution**: N/A",
                f"- **Required Loan**: ₹{context.finance.loan_amount:,.2f}" if context.finance.loan_amount else "- **Required Loan**: N/A",
                f"- **Interest Rate**: {context.finance.interest_rate}% per annum",
                f"- **Tenure**: {context.finance.tenure_months} months (Moratorium: {context.finance.moratorium_months} months)",
                f"- **Monthly EMI**: ₹{context.finance.emi:,.2f}" if context.finance.emi else "- **Monthly EMI**: N/A",
                f"- **DSCR**: {context.finance.dscr:.2f}" if context.finance.dscr else "- **DSCR**: N/A",
                f"- **Applied Scheme**: {context.finance.scheme_name or context.finance.scheme_code or 'General Bank Financing'}"
            ])

        lines.extend([
            "",
            "## 7. Context Quality & Intelligence Limitations",
            f"- **Quality State**: {context.quality.status.value}",
            f"- **Completeness Ratio**: {int(context.quality.completeness_score * 100)}%",
            f"- **Evaluation Summary**: {context.quality.evaluation_summary}",
        ])

        if context.quality.missing_information:
            lines.append("- **Known Information Gaps**:")
            for item in context.quality.missing_information:
                lines.append(f"  - [{item.importance.value}] `{item.field_name}` ({item.category}): {item.reason}")

        if context.quality.limitations:
            lines.append("- **Explicit Limitations**:")
            for lim in context.quality.limitations:
                lines.append(f"  - {lim}")

        return "\n".join(lines)
