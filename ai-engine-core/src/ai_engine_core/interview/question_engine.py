"""
Adaptive Questioning & Interview Engine.
Selects optimal follow-up questions to fill information gaps and drive context completeness.
"""

from typing import List, Optional, Set
from ..schemas.canonical_context import AssessmentContext
from ..schemas.quality import FieldImportance, QualityStatus
from .question_models import QuestionItem
from .question_bank import QuestionBank


# Mapping from quality missing_information field_name to question bank keys
FIELD_TO_QUESTION_KEY = {
    "commercial_space": "has_shop",
    "own_capital_contribution": "own_contribution",
    "previous_experience": "previous_experience",
    "target_customer_segment": "has_known_customers",
    "three_phase_power": "three_phase_power",
    "water_supply": "water_supply",
    "equipment_availability": "has_equipment",
    "supplier_access": "has_supplier_access",
    "working_hours": "expected_working_hours"
}


class QuestionEngine:
    """Intelligently prioritizes and selects next question for interview sessions."""

    MAX_QUESTIONS_PER_SESSION = 5

    @classmethod
    def select_next_question(
        cls,
        context: AssessmentContext,
        asked_keys: Optional[List[str]] = None
    ) -> Optional[QuestionItem]:
        """
        Determines the single most impactful question to ask the user next.
        
        Args:
            context: Current canonical AssessmentContext.
            asked_keys: List of question keys already presented in this session.
            
        Returns:
            Localized QuestionItem or None if session is complete.
        """
        asked_set: Set[str] = set(asked_keys or [])
        lang = context.user.language or "en"

        # If already asked max questions or context is complete, stop interview
        if len(asked_set) >= cls.MAX_QUESTIONS_PER_SESSION:
            return None

        if context.quality.status == QualityStatus.COMPLETE or context.quality.completeness_score >= 0.85:
            return None

        # Sort missing items by importance priority
        importance_rank = {
            FieldImportance.CRITICAL: 0,
            FieldImportance.HIGH: 1,
            FieldImportance.MEDIUM: 2,
            FieldImportance.LOW: 3
        }

        sorted_gaps = sorted(
            context.quality.missing_information,
            key=lambda item: importance_rank.get(item.importance, 99)
        )

        # Find first gap that maps to an unasked question
        for gap in sorted_gaps:
            q_key = FIELD_TO_QUESTION_KEY.get(gap.field_name, gap.field_name)
            
            # Check if already answered in raw_answers
            if q_key in context.business.raw_answers and context.business.raw_answers[q_key] is not None:
                continue

            if q_key not in asked_set:
                question = QuestionBank.get_question(q_key, language=lang)
                if question:
                    return question

        # Fallback to general unasked questions if gaps didn't directly yield one
        candidate_fallbacks = ["has_shop", "own_contribution", "previous_experience", "has_known_customers", "has_supplier_access"]
        for fb_key in candidate_fallbacks:
            if fb_key not in asked_set and fb_key not in context.business.raw_answers:
                question = QuestionBank.get_question(fb_key, language=lang)
                if question:
                    return question

        return None
