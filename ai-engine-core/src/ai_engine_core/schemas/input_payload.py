"""
Input payload schemas representing the incoming data over HTTP from Node.js AI Gateway.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class BackendUserPayload(BaseModel):
    id: str
    language: str = "en"


class BackendBusinessPayload(BaseModel):
    categoryId: str
    categoryName: str = "Unknown"


class BackendLocationNode(BaseModel):
    locationId: str
    villageName: Optional[str] = None
    villageCode: Optional[str] = None
    blockName: Optional[str] = None
    blockCode: Optional[str] = None
    districtName: Optional[str] = None
    districtCode: Optional[str] = None
    stateName: Optional[str] = None
    stateCode: Optional[str] = None
    pincode: Optional[str] = None
    formattedAddress: Optional[str] = None
    latitude: float = 0.0
    longitude: float = 0.0


class BackendCompetitorItem(BaseModel):
    providerPlaceId: Optional[str] = None
    name: str
    category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distanceKm: float = 0.0
    formattedAddress: Optional[str] = None
    source: Optional[str] = "google_places"


class BackendCompetitionPayload(BaseModel):
    radiusKm: float = 5.0
    totalCompetitors: int = 0
    competitors: List[BackendCompetitorItem] = Field(default_factory=list)
    provider: Optional[str] = "unavailable"
    retrievedAt: Optional[str] = None


class BackendPopulationPayload(BaseModel):
    estimatedPopulation: Optional[int] = None
    radiusKm: Optional[float] = None
    source: Optional[str] = None
    dataYear: Optional[int] = None


class BackendLocationIntelligencePayload(BaseModel):
    location: BackendLocationNode
    competition: Optional[BackendCompetitionPayload] = None
    population: Optional[BackendPopulationPayload] = None


class BackendAssessmentContextPayload(BaseModel):
    assessmentId: str
    user: BackendUserPayload
    business: BackendBusinessPayload
    answers: Dict[str, Any] = Field(default_factory=dict)
    finance: Optional[Dict[str, Any]] = None
    locationIntelligence: BackendLocationIntelligencePayload


class StartSessionRequest(BaseModel):
    context: BackendAssessmentContextPayload


class AnswerPayload(BaseModel):
    key: str
    value: Union[str, int, float, bool, Dict[str, Any], List[Any]]
    questionText: Optional[str] = None
    inputType: Optional[str] = None


class SessionMessageRequest(BaseModel):
    assessmentId: Optional[str] = None
    sessionId: Optional[str] = None
    message: Optional[str] = None
    answer: Optional[AnswerPayload] = None
    context: Optional[BackendAssessmentContextPayload] = None


class ReportRequest(BaseModel):
    assessmentId: Optional[str] = None
    sessionId: Optional[str] = None
    context: Optional[BackendAssessmentContextPayload] = None
