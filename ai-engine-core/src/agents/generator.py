"""
Groq LLM Generator Agent Subsystem.
Synthesizes RAG retrieved grounding context (Mandi prices, Census demographics, Business & Industrial Economics principles)
and pre-calculated deterministic financial roadmap math into a structured executive business advisory.
"""

import os
import requests
from typing import List, Dict, Any, Optional

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = os.getenv("PRIMARY_MODEL", "openai/gpt-oss-120b")


class AdvisoryGeneratorAgent:
    """
    Groq LLM Generator synthesizing ground truth math and RAG context into executive advice.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = DEFAULT_MODEL):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = model

    def generate_advisory_report(
        self,
        trade_category: str,
        location: str,
        margin_capital: float,
        financial_roadmap: Dict[str, Any],
        grounding_chunks: List[Dict[str, Any]],
        language_code: str = "en"
    ) -> str:
        """
        Generates structured 7-section business advisory report.
        """
        if not self.api_key:
            return self._build_fallback_report(trade_category, location, margin_capital, financial_roadmap)

        # Format context chunks for prompt injection
        context_str = "\n".join([f"- {c.get('document', '')}" for c in grounding_chunks])

        fin_summary = (
            f"Scheme: {financial_roadmap.get('scheme_name')}\n"
            f"Margin Capital (10%): Rs {financial_roadmap.get('margin_capital'):,.2f}\n"
            f"Total Project Cost (100%): Rs {financial_roadmap.get('project_cost'):,.2f}\n"
            f"Sanctioned Loan (90%): Rs {financial_roadmap.get('loan_sanction'):,.2f}\n"
            f"Interest Rate: {financial_roadmap.get('annual_interest_rate') * 100:.1f}% p.a.\n"
            f"Moratorium: {financial_roadmap.get('moratorium_months')} Months\n"
            f"Tenure: {financial_roadmap.get('tenure_years')} Years\n"
            f"Fixed Quarterly EMI: Rs {financial_roadmap.get('quarterly_emi'):,.2f}"
        )

        system_prompt = (
            "You are Udaan AI, an elite Master Business Advisor and Industrial Economist specializing in rural micro-enterprises in Gujarat.\n"
            "Your advice MUST apply sound Business Economics (Unit economics, COGS, Gross Margins, Breakeven Analysis) "
            "and Industrial Organization (Tiered Pack Pricing, Competitor Saturation, Distribution Linkages).\n\n"
            "Format your response cleanly in GitHub Markdown using these exact 6 executive headers:\n"
            "1. 🎯 Executive Market Strategy & Target Reach\n"
            "2. 💡 Underserved Local Opportunity Niche\n"
            "3. 📈 Unit Economics & Tiered Pack Pricing (Making Cost vs Selling Price)\n"
            "4. 🛡️ Grassroots Risk Mitigation & Competitor Differentiation\n"
            "5. 🏦 Concessional Financial Roadmap & Loan Execution\n"
            "6. 🚀 Step-by-Step 30-Day Operational Action Plan\n\n"
            "Do NOT output raw data or JSON code blocks. Write as an empowering, authoritative business mentor."
        )

        user_prompt = (
            f"PROPOSED TRADE: {trade_category}\n"
            f"LOCATION: {location}\n"
            f"ENTREPRENEUR SAVINGS CAPITAL: Rs {margin_capital:,.2f}\n\n"
            f"DETERMINISTIC FINANCIAL TRUTH:\n{fin_summary}\n\n"
            f"GROUNDING CONTEXT & MANDI/ECONOMIC DATA:\n{context_str}\n\n"
            f"Please generate the complete executive business feasibility and strategic roadmap report."
        )

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 2048
            }
            resp = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=12)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                if content:
                    return content
        except Exception:
            pass

        return self._build_fallback_report(trade_category, location, margin_capital, financial_roadmap)

    def _build_fallback_report(self, trade, location, margin, fin) -> str:
        """Deterministic markdown fallback report when LLM key is unavailable."""
        return f"""# 🎯 Executive Business Advisory Report: {trade}
**Location:** {location} | **Beneficiary Margin Capital:** ₹{margin:,.2f}

---

### 1. 🎯 Executive Market Strategy & Target Reach
- Target a 5–10 km catchment radius serving local households, daily commuters, and rural weekly haat markets.
- Establish direct raw material procurement linkages with nearby APMC Mandis to lower unit COGS.

### 2. 💡 Underserved Local Opportunity Niche
- Address the unmet demand for fresh daily production rather than stale packaged goods.
- Introduce tiered pack pricing to capture high-margin impulse customers and high-volume Kirana buyers.

### 3. 📈 Unit Economics & Tiered Pack Pricing
* **Impulse Tier (100g Plate/Pouch)**: Making Cost ₹7.50 ➔ Retail MRP ₹20.00 (**62.5% Gross Margin**).
* **Retail Distribution Tier (250g Pouch)**: Making Cost ₹18.00 ➔ Wholesale ₹28.00 ➔ MRP ₹35.00 (**48.5% Margin**).
* **Bulk Tier (1 kg Box)**: Making Cost ₹66.00 ➔ Catering Wholesale ₹100.00 (**45.0% Margin**).

### 4. 🛡️ Grassroots Risk Mitigation
- Protect against seasonal raw material price swings by maintaining a 15-day inventory buffer.
- Differing from local competitors via hygiene certification, digital weighing scales, and custom spice blends.

### 5. 🏦 Concessional Financial Roadmap
* **Applied Scheme**: {fin.get('scheme_name')}
* **Total Project Cost ($P$)**: ₹{fin.get('project_cost'):,.2f}
* **Sanctioned Loan ($L = 90\%$)**: ₹{fin.get('loan_sanction'):,.2f}
* **Interest Rate**: {fin.get('annual_interest_rate', 0.065) * 100:.1f}% p.a.
* **Moratorium Period**: {fin.get('moratorium_months')} Months
* **Fixed Quarterly EMI**: ₹{fin.get('quarterly_emi'):,.2f} / quarter

### 6. 🚀 Step-by-Step 30-Day Operational Action Plan
1. **Days 1–7**: Submit scheme application to GBCDC/GSCDF channelizing agency.
2. **Days 8–15**: Procure machinery & set up stainless steel workspace.
3. **Days 16–22**: Establish raw material supply line from local APMC Mandi.
4. **Days 23–30**: Onboard 15 local Kirana retail partners & launch operations.
"""
