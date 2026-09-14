"""
Context Builder Service.
Coordinating the pipeline: validation -> extraction -> normalization -> quality evaluation -> canonical context.
"""

from typing import Any, Dict, Union
from ..schemas.canonical_context import AssessmentContext
from ..schemas.input_payload import BackendAssessmentContextPayload
from ..schemas.user import UserContext
from ..schemas.business import BusinessContext
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType
from ..normalizers.answer_normalizer import AnswerNormalizer
from ..normalizers.resource_normalizer import ResourceNormalizer
from ..normalizers.finance_normalizer import FinanceNormalizer
from ..normalizers.location_normalizer import LocationNormalizer
from ..normalizers.competition_normalizer import CompetitionNormalizer
from .context_quality import ContextQualityEvaluator
from ..exceptions import ContextValidationError


class ContextBuilder:
    """Constructs canonical AssessmentContext from backend payload."""

    @classmethod
    def build_context(
        cls,
        payload: Union[Dict[str, Any], BackendAssessmentContextPayload]
    ) -> AssessmentContext:
        """
        Main entrypoint for context construction.
        
        Args:
            payload: Raw dictionary or parsed BackendAssessmentContextPayload.
            
        Returns:
            Canonical AssessmentContext instance.
            
        Raises:
            ContextValidationError: If mandatory fields are malformed or missing.
        """
        # 1. Validate / Cast Payload
        if isinstance(payload, dict):
            try:
                validated = BackendAssessmentContextPayload.model_validate(payload)
            except Exception as e:
                raise ContextValidationError(f"Invalid backend context payload structure: {str(e)}") from e
        elif isinstance(payload, BackendAssessmentContextPayload):
            validated = payload
        else:
            raise ContextValidationError("Payload must be a dictionary or BackendAssessmentContextPayload")

        # 2. Normalize Answers
        normalized_answers = AnswerNormalizer.normalize_answers(validated.answers)

        # 3. Build User Context
        user_prov = ProvenanceRecord(
            source_type=SourceType.USER_PROFILE,
            source_reference=validated.user.id,
            claim_type=ClaimType.USER_PROVIDED
        )
        user_skills = []
        if "skills" in normalized_answers:
            s_val = normalized_answers["skills"]
            if isinstance(s_val, list):
                user_skills = [str(x) for x in s_val]
            elif isinstance(s_val, str):
                user_skills = [x.strip() for x in s_val.split(",") if x.strip()]

        working_hours = None
        if "expected_working_hours" in normalized_answers:
            try:
                working_hours = float(normalized_answers["expected_working_hours"])
            except (ValueError, TypeError):
                pass

        user_context = UserContext(
            user_id=validated.user.id,
            language=validated.user.language or "en",
            previous_experience=str(normalized_answers.get("previous_experience")) if normalized_answers.get("previous_experience") else None,
            skills=user_skills,
            expected_working_hours_per_day=working_hours,
            provenance=user_prov
        )

        # 4. Build Business Context
        biz_prov = ProvenanceRecord(
            source_type=SourceType.BACKEND_ASSESSMENT,
            source_reference=validated.business.categoryId,
            claim_type=ClaimType.USER_PROVIDED
        )
        known_customers = None
        if "has_known_customers" in normalized_answers:
            val = normalized_answers["has_known_customers"]
            known_customers = bool(val) if val is not None else None

        biz_context = BusinessContext(
            category_id=validated.business.categoryId,
            category_name=validated.business.categoryName,
            proposed_business_name=normalized_answers.get("proposed_business_name") or normalized_answers.get("business_name"),
            business_stage=str(normalized_answers.get("business_stage", "IDEA")).upper(),
            business_description=normalized_answers.get("business_description"),
            target_customer_segment=normalized_answers.get("target_customer_segment"),
            operating_scale=normalized_answers.get("operating_scale"),
            has_known_customers=known_customers,
            raw_answers=normalized_answers,
            provenance=biz_prov
        )

        # 5. Build Resource Context
        resource_context = ResourceNormalizer.normalize(
            normalized_answers,
            provenance=ProvenanceRecord(
                source_type=SourceType.BACKEND_ASSESSMENT,
                claim_type=ClaimType.USER_PROVIDED
            )
        )

        # 6. Build Finance Context
        finance_context = FinanceNormalizer.normalize(validated.finance)

        # 7. Build Location Context & Competition Context
        loc_intel_raw = validated.locationIntelligence.model_dump()
        location_context = LocationNormalizer.normalize(loc_intel_raw)
        
        comp_payload = loc_intel_raw.get("competition")
        competition_context = CompetitionNormalizer.normalize(comp_payload)

        # 8. Assemble Pre-quality Context
        context = AssessmentContext(
            assessment_id=validated.assessmentId,
            user=user_context,
            business=biz_context,
            resources=resource_context,
            finance=finance_context,
            location=location_context,
            competition=competition_context,
            metadata={
                "engine_version": "1.0.0",
                "normalizers_applied": [
                    "AnswerNormalizer",
                    "ResourceNormalizer",
                    "FinanceNormalizer",
                    "LocationNormalizer",
                    "CompetitionNormalizer",
                    "PopulationNormalizer"
                ]
            }
        )

        # 9. Evaluate Quality & Missing Information
        quality = ContextQualityEvaluator.evaluate(context)
        context.quality = quality

        return context
