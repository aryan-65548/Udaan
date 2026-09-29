"""
Population intelligence normalizer.
Safely distinguishes available, estimated, and unavailable population data without fabrication.
"""

from typing import Any, Dict, Optional
from ..schemas.location import PopulationContext, PopulationStatus
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType


class PopulationNormalizer:
    """Standardizes population data into canonical PopulationContext."""

    @classmethod
    def normalize(
        cls,
        raw_population: Optional[Dict[str, Any]],
        provenance: Optional[ProvenanceRecord] = None
    ) -> PopulationContext:
        if not raw_population or raw_population.get("estimatedPopulation") is None:
            return PopulationContext(
                status=PopulationStatus.UNAVAILABLE,
                estimated_population=None,
                limitations="Demographic / census population data is unavailable for this specific radius.",
                provenance=provenance or ProvenanceRecord(
                    source_type=SourceType.BACKEND_POPULATION,
                    claim_type=ClaimType.FACT,
                    notes="Population unavailable"
                )
            )

        pop_val = raw_population.get("estimatedPopulation")
        try:
            pop_int = int(pop_val)
        except (ValueError, TypeError):
            pop_int = None

        if pop_int is None or pop_int <= 0:
            return PopulationContext(
                status=PopulationStatus.UNAVAILABLE,
                estimated_population=None,
                limitations="Population value could not be resolved.",
                provenance=provenance or ProvenanceRecord(
                    source_type=SourceType.BACKEND_POPULATION,
                    claim_type=ClaimType.FACT
                )
            )

        source = raw_population.get("source", "Census 2011 PCA")
        year = raw_population.get("dataYear")
        try:
            year_int = int(year) if year else None
        except (ValueError, TypeError):
            year_int = None

        limitations = None
        if year_int and year_int <= 2015:
            limitations = f"Population baseline is from {year_int}; rapid urbanization or demographic shifts may apply."

        prov = provenance or ProvenanceRecord(
            source_type=SourceType.BACKEND_POPULATION,
            source_reference=source,
            claim_type=ClaimType.ESTIMATE if "estimate" in source.lower() else ClaimType.FACT
        )

        return PopulationContext(
            status=PopulationStatus.ESTIMATED if "estimate" in source.lower() else PopulationStatus.AVAILABLE,
            estimated_population=pop_int,
            radius_km=float(raw_population.get("radiusKm", 5.0)),
            source=source,
            data_year=year_int,
            limitations=limitations,
            provenance=prov
        )
