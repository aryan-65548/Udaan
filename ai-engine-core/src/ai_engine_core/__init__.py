"""
Udaan AI Engine Core
====================

The authoritative context engine and foundational intelligence pipeline for the Udaan platform.
"""

from .schemas.canonical_context import AssessmentContext
from .services.context_builder import ContextBuilder
from .services.context_updater import ContextUpdater
from .services.context_quality import ContextQualityEvaluator
from .services.context_formatter import ContextFormatter

__version__ = "0.2.0"
__all__ = [
    "AssessmentContext",
    "ContextBuilder",
    "ContextUpdater",
    "ContextQualityEvaluator",
    "ContextFormatter",
]
