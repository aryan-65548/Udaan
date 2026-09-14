"""
Answer and value normalizer.
Standardizes heterogeneous types, parses numbers, booleans, Indian notations, and trims strings deterministically.
"""

from typing import Any, Dict, Optional
from .converters import CurrencyConverter


class AnswerNormalizer:
    """Normalizes raw key-value answers into canonical types."""

    TRUE_VALUES = {"true", "yes", "y", "1", "haan", "ha", "हाँ", "હા", "sahi", "true"}
    FALSE_VALUES = {"false", "no", "n", "0", "nahi", "na", "नहीं", "ના", "galat", "false"}

    @classmethod
    def normalize_value(cls, val: Any) -> Any:
        """Converts raw value to python canonical type preserving null vs zero vs boolean."""
        if val is None:
            return None

        if isinstance(val, bool):
            return val

        if isinstance(val, (int, float)):
            return val

        if isinstance(val, str):
            cleaned = val.strip()
            if not cleaned:
                return None
            
            # Check boolean representations
            lower = cleaned.lower()
            if lower in cls.TRUE_VALUES:
                return True
            if lower in cls.FALSE_VALUES:
                return False

            # Check Indian currency expression (e.g. "2.5 lakh", "50k")
            parsed_inr = CurrencyConverter.parse_inr(cleaned)
            if parsed_inr is not None and any(kw in lower for kw in ["lakh", "lac", "cr", "crore", "k", "rs", "₹"]):
                return parsed_inr

            # Try parsing numerical with commas (e.g. Indian numbering '2,00,000')
            numeric_str = cleaned.replace(",", "")
            try:
                if "." in numeric_str:
                    return float(numeric_str)
                return int(numeric_str)
            except ValueError:
                pass

            return cleaned

        if isinstance(val, dict):
            return {k: cls.normalize_value(v) for k, v in val.items()}

        if isinstance(val, list):
            return [cls.normalize_value(item) for item in val]

        return val

    @classmethod
    def normalize_answers(cls, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes an entire dictionary of assessment answers."""
        if not answers:
            return {}
        normalized = {}
        for k, v in answers.items():
            clean_key = str(k).strip()
            normalized[clean_key] = cls.normalize_value(v)
        return normalized
