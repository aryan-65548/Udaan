"""
Data models for adaptive questioning and user interview sessions.
Matches the contract defined in 04_AI_BACKEND_CONTRACT.md.
"""

from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class QuestionInputType(str, Enum):
    BOOLEAN = "BOOLEAN"
    NUMBER = "NUMBER"
    SELECT = "SELECT"
    MULTI_SELECT = "MULTI_SELECT"
    TEXT = "TEXT"


class QuestionOption(BaseModel):
    label: str
    value: Any


class QuestionItem(BaseModel):
    key: str = Field(..., description="Unique input key corresponding to assessment_inputs.input_key")
    text: str = Field(..., description="Human-readable question prompt in the user's preferred language")
    inputType: QuestionInputType = Field(default=QuestionInputType.TEXT)
    options: Optional[List[QuestionOption]] = Field(None, description="Selectable options for boolean or enum inputs")
    category: str = Field(default="general", description="business, resources, finance, operations, customer")
    importance: str = Field(default="HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    help_text: Optional[str] = None


class InterviewSessionState(BaseModel):
    session_id: str
    assessment_id: str
    language: str = "en"
    asked_question_keys: List[str] = Field(default_factory=list)
    max_questions: int = 5
    current_status: str = "QUESTIONING"
