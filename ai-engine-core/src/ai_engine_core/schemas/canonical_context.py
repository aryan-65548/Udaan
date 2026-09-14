"""
Canonical Assessment Context Schema.
The foundational data structure passed to all downstream AI advisory modules.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from .user import UserContext
from .business import BusinessContext
from .resources import ResourceContext
from .finance import FinanceContext
from .location import LocationContext
from .competition import CompetitionContext
from .quality import ContextQuality


class ContextAuditEntry(BaseModel):
    """Immutable log entry of a context revision or incremental update."""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_fields: List[str] = Field(default_factory=list)
    source_message: Optional[str] = None
    completeness_score_after: float = 0.0
    notes: Optional[str] = None


class AssessmentContext(BaseModel):
    """
    Canonical Assessment Context.
    
    The authoritative representation of all validated, normalized, and provenance-tracked
    information regarding an entrepreneur's proposed business opportunity.
    """
    context_version: str = Field(default="1.0", description="Context schema version")
    assessment_id: str = Field(..., description="UUID of the assessment")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when canonical context was first constructed"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of latest context update"
    )
    
    user: UserContext
    business: BusinessContext
    resources: ResourceContext = Field(default_factory=ResourceContext)
    finance: FinanceContext = Field(default_factory=FinanceContext)
    location: LocationContext
    competition: CompetitionContext = Field(default_factory=CompetitionContext)
    quality: ContextQuality = Field(default_factory=ContextQuality)
    
    history: List[ContextAuditEntry] = Field(
        default_factory=list,
        description="Audit trail of all incremental updates and revisions"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="System or execution metadata"
    )
