"""
Context Updater Service.
Safely applies incremental updates to canonical AssessmentContext, maintaining data integrity, audit history, and recalculating quality.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple, Union
from ..schemas.canonical_context import AssessmentContext, ContextAuditEntry
from ..schemas.updates import ContextUpdatePayload, ContextUpdateResult
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType
from ..normalizers.answer_normalizer import AnswerNormalizer
from ..normalizers.resource_normalizer import ResourceNormalizer
from .context_quality import ContextQualityEvaluator


class ContextUpdater:
    """Applies incremental updates and new answers to an existing canonical context."""

    @classmethod
    def update_context(
        cls,
        existing_context: AssessmentContext,
        update: Union[ContextUpdatePayload, Dict[str, Any]],
    ) -> Tuple[AssessmentContext, ContextUpdateResult]:
        """
        Incrementally merges updates into existing context.
        
        Args:
            existing_context: Current canonical AssessmentContext.
            update: ContextUpdatePayload or dictionary containing answers/updates.
            
        Returns:
            Tuple of (Updated AssessmentContext, ContextUpdateResult).
        """
        if isinstance(update, dict):
            update_payload = ContextUpdatePayload.model_validate(update)
        else:
            update_payload = update

        initial_quality_score = existing_context.quality.completeness_score
        updated_fields: List[str] = []

        # 1. Update Answers
        if update_payload.answers:
            normalized_new_answers = AnswerNormalizer.normalize_answers(update_payload.answers)
            for k, v in normalized_new_answers.items():
                if existing_context.business.raw_answers.get(k) != v:
                    existing_context.business.raw_answers[k] = v
                    updated_fields.append(f"answers.{k}")

            # Re-normalize resources based on updated combined answers
            existing_context.resources = ResourceNormalizer.normalize(
                existing_context.business.raw_answers,
                provenance=update_payload.provenance
            )
            updated_fields.append("resources")

        # 2. Update User Profile Attributes
        if update_payload.user_updates:
            u_up = update_payload.user_updates
            if "previous_experience" in u_up:
                existing_context.user.previous_experience = str(u_up["previous_experience"])
                updated_fields.append("user.previous_experience")
            if "skills" in u_up:
                skills_val = u_up["skills"]
                if isinstance(skills_val, list):
                    existing_context.user.skills = [str(s) for s in skills_val]
                elif isinstance(skills_val, str):
                    existing_context.user.skills = [s.strip() for s in skills_val.split(",") if s.strip()]
                updated_fields.append("user.skills")
            if "expected_working_hours" in u_up:
                try:
                    existing_context.user.expected_working_hours_per_day = float(u_up["expected_working_hours"])
                    updated_fields.append("user.expected_working_hours_per_day")
                except (ValueError, TypeError):
                    pass

        # 3. Update Business Attributes
        if update_payload.business_updates:
            b_up = update_payload.business_updates
            if "proposed_business_name" in b_up:
                existing_context.business.proposed_business_name = str(b_up["proposed_business_name"])
                updated_fields.append("business.proposed_business_name")
            if "business_stage" in b_up:
                existing_context.business.business_stage = str(b_up["business_stage"]).upper()
                updated_fields.append("business.business_stage")
            if "target_customer_segment" in b_up:
                existing_context.business.target_customer_segment = str(b_up["target_customer_segment"])
                updated_fields.append("business.target_customer_segment")
            if "has_known_customers" in b_up:
                existing_context.business.has_known_customers = bool(b_up["has_known_customers"])
                updated_fields.append("business.has_known_customers")

        # 4. Touch updated_at
        existing_context.updated_at = datetime.now(timezone.utc)

        # 5. Re-evaluate Quality
        new_quality = ContextQualityEvaluator.evaluate(existing_context)
        existing_context.quality = new_quality

        delta = round(new_quality.completeness_score - initial_quality_score, 2)

        # 6. Record Audit History
        existing_context.history.append(ContextAuditEntry(
            timestamp=existing_context.updated_at,
            updated_fields=updated_fields,
            source_message=update_payload.source_message,
            completeness_score_after=new_quality.completeness_score,
            notes=f"Applied update of {len(updated_fields)} attributes."
        ))

        result = ContextUpdateResult(
            success=True,
            updated_fields=updated_fields,
            quality_score_delta=delta,
            notes=f"Successfully applied update with {len(updated_fields)} modified attributes."
        )

        return existing_context, result
