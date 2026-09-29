"""
Unit and currency conversion helpers for Indian business contexts.
Handles regional land units (bigha, guntha, acre) and currency notations (Lakh, Crore, K).
"""

import re
from typing import Optional, Tuple


class UnitConverter:
    """Standardizes regional measurement units to SI / standard canonical units."""

    # Standard area conversion factors to Square Feet (sqft)
    AREA_TO_SQFT = {
        "sqft": 1.0,
        "sq_ft": 1.0,
        "square_feet": 1.0,
        "sqft.": 1.0,
        "sqm": 10.7639,
        "sq_m": 10.7639,
        "square_meter": 10.7639,
        "sqyd": 9.0,
        "sq_yd": 9.0,
        "square_yard": 9.0,
        "gaj": 9.0,
        "guntha": 1089.0,
        "gunta": 1089.0,
        "bigha": 17424.0,  # Standard western India (Gujarat/Maharashtra) Pucca Bigha (~17,424 sqft)
        "acre": 43560.0,
        "hectare": 107639.0,
    }

    @classmethod
    def normalize_area(cls, value: Optional[float], unit: Optional[str]) -> Tuple[Optional[float], str]:
        """
        Converts given area value and unit to canonical square feet (sqft).
        
        Returns:
            Tuple of (standardized_sqft_value, "sqft") or (original_value, unit) if unknown.
        """
        if value is None or value <= 0:
            return None, "sqft"

        if not unit:
            return value, "sqft"

        cleaned_unit = unit.strip().lower().replace(" ", "_").replace("-", "_")
        factor = cls.AREA_TO_SQFT.get(cleaned_unit)

        if factor:
            converted = round(value * factor, 2)
            return converted, "sqft"

        return value, unit


class CurrencyConverter:
    """Parses Indian financial expressions into numeric INR values."""

    # Match patterns like: "2.5 lakh", "15L", "1.2 crore", "50k", "₹ 2,50,000"
    LAKH_PATTERN = re.compile(r"^\s*([\d,.]+)\s*(?:lakh|lacs|lac|l)\b", re.IGNORECASE)
    CRORE_PATTERN = re.compile(r"^\s*([\d,.]+)\s*(?:crore|crores|cr)\b", re.IGNORECASE)
    THOUSAND_PATTERN = re.compile(r"^\s*([\d,.]+)\s*(?:thousand|k)\b", re.IGNORECASE)

    @classmethod
    def parse_inr(cls, val: str) -> Optional[float]:
        """Parses colloquial or formatted currency strings to float INR."""
        if not val or not isinstance(val, str):
            return None

        cleaned = val.strip().replace("₹", "").replace("Rs.", "").replace("Rs", "").replace(",", "").strip()

        # Try Crore
        cr_match = cls.CRORE_PATTERN.match(cleaned)
        if cr_match:
            try:
                num = float(cr_match.group(1))
                return num * 10000000.0
            except ValueError:
                pass

        # Try Lakh
        lakh_match = cls.LAKH_PATTERN.match(cleaned)
        if lakh_match:
            try:
                num = float(lakh_match.group(1))
                return num * 100000.0
            except ValueError:
                pass

        # Try Thousand / K
        k_match = cls.THOUSAND_PATTERN.match(cleaned)
        if k_match:
            try:
                num = float(k_match.group(1))
                return num * 1000.0
            except ValueError:
                pass

        # Try plain float
        try:
            return float(cleaned)
        except ValueError:
            return None
