"""
Structured domain exceptions for Udaan AI Context Engine.
"""

from typing import Any, Dict, Optional


class ContextEngineError(Exception):
    """Base exception for all Context Engine domain errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ContextValidationError(ContextEngineError):
    """Raised when an incoming payload violates structural or semantic validation."""
    pass


class ContextNormalizationError(ContextEngineError):
    """Raised when data cannot be normalized reliably without data corruption."""
    pass


class ContextUpdateError(ContextEngineError):
    """Raised when an incremental context update fails validation or conflict check."""
    pass


class UnsupportedContextError(ContextEngineError):
    """Raised when context version or unsupported business modality is encountered."""
    pass


class ContextSerializationError(ContextEngineError):
    """Raised when canonical context cannot be safely serialized."""
    pass
