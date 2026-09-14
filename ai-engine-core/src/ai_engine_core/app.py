"""
FastAPI application interface for Udaan AI Engine Core.
Exposes internal endpoints consumed by Node.js AI Gateway.
"""

import uuid
import logging
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse

from .config import settings
from .schemas.input_payload import StartSessionRequest, SessionMessageRequest, ReportRequest
from .schemas.updates import ContextUpdatePayload
from .schemas.quality import QualityStatus
from .services.context_builder import ContextBuilder
from .services.context_updater import ContextUpdater
from .exceptions import ContextEngineError, ContextValidationError

# Configure structured logger
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger("ai_engine_core")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Context Engine and Advisory Intelligence Service"
)


# Exception handler for domain errors
@app.exception_handler(ContextEngineError)
async def context_engine_exception_handler(request: Request, exc: ContextEngineError):
    logger.error(f"ContextEngineError: {exc.message}", extra={"details": exc.details})
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.details
            }
        }
    )


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment
    }


@app.post("/internal/ai/session/start", tags=["Session"])
async def start_session(payload: StartSessionRequest):
    """
    Constructs initial canonical AssessmentContext and initializes AI session.
    """
    try:
        context = ContextBuilder.build_context(payload.context)
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        
        logger.info(
            f"Initialized AI session {session_id} for assessment {context.assessment_id} "
            f"(Quality: {context.quality.status.value}, Score: {context.quality.completeness_score})"
        )

        return {
            "sessionId": session_id,
            "status": "QUESTIONING",
            "message": f"Welcome to Udaan AI advisory. Assessing opportunity for {context.business.category_name} in {context.location.district_name or context.location.formatted_address}.",
            "contextQuality": context.quality.model_dump(),
            "contextVersion": context.context_version
        }
    except ContextValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Failed to start session")
        raise HTTPException(status_code=500, detail=f"Internal context construction error: {str(e)}")


@app.post("/internal/ai/session/message", tags=["Session"])
async def session_message(payload: SessionMessageRequest):
    """
    Receives user message/answers, updates canonical context, and tracks quality evolution.
    """
    try:
        session_id = payload.sessionId or f"session_{uuid.uuid4().hex[:12]}"
        
        if not payload.context:
            raise HTTPException(status_code=400, detail="Missing context payload in message request")

        # Reconstruct canonical context
        context = ContextBuilder.build_context(payload.context)

        # If an answer or message is present, apply incremental update
        update_answers: Dict[str, Any] = {}
        if payload.answer:
            update_answers[payload.answer.key] = payload.answer.value

        if update_answers:
            update_payload = ContextUpdatePayload(
                answers=update_answers,
                source_message=payload.message
            )
            context, update_result = ContextUpdater.update_context(context, update_payload)
            logger.info(
                f"Updated session {session_id} context: {update_result.updated_fields} "
                f"(Score delta: {update_result.quality_score_delta})"
            )

        # Status check
        next_status = "QUESTIONING"
        if context.quality.status == QualityStatus.COMPLETE or context.quality.completeness_score >= 0.85:
            next_status = "COMPLETED"

        return {
            "sessionId": session_id,
            "status": next_status,
            "message": "Information recorded and context updated successfully.",
            "contextQuality": context.quality.model_dump()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to process message")
        raise HTTPException(status_code=500, detail=f"Internal message processing error: {str(e)}")


@app.post("/internal/ai/report", tags=["Report"])
async def get_report(payload: ReportRequest):
    """
    Returns structured canonical context synthesis for report generation.
    """
    try:
        if not payload.context:
            raise HTTPException(status_code=400, detail="Context is required for report generation")

        context = ContextBuilder.build_context(payload.context)
        
        return {
            "reportId": f"rep_{uuid.uuid4().hex[:12]}",
            "assessmentId": context.assessment_id,
            "contextQuality": context.quality.model_dump(),
            "businessSummary": {
                "category": context.business.category_name,
                "stage": context.business.business_stage,
                "location": context.location.formatted_address,
                "competitorCount": context.competition.total_competitors,
                "financeCalculated": context.finance.is_calculated
            },
            "canonicalContext": context.model_dump(mode="json")
        }
    except Exception as e:
        logger.exception("Failed to generate report payload")
        raise HTTPException(status_code=500, detail=f"Internal report generation error: {str(e)}")
