"""
Configuration settings for Udaan AI Engine Core.
"""

import os
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()


class Settings(BaseModel):
    app_name: str = "Udaan AI Context Engine"
    app_version: str = "1.0.0"
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))
    
    # AI Service Host / Port
    host: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))

    # Quality and confidence thresholds
    confidence_threshold: float = Field(default_factory=lambda: float(os.getenv("CONFIDENCE_THRESHOLD", "0.82")))
    default_search_radius_km: float = Field(default_factory=lambda: float(os.getenv("LOCATION_INTELLIGENCE_DEFAULT_RADIUS_KM", "5.0")))


settings = Settings()
