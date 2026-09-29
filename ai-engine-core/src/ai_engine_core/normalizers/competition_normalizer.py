"""
Competition intelligence normalizer.
Standardizes nearby competitor listings, distance measurements, and provider metadata.
"""

from typing import Any, Dict, List, Optional
from ..schemas.competition import CompetitionContext, CompetitorItem
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType


class CompetitionNormalizer:
    """Standardizes competition intelligence into canonical CompetitionContext."""

    @classmethod
    def normalize(
        cls,
        raw_competition: Optional[Dict[str, Any]],
        provenance: Optional[ProvenanceRecord] = None
    ) -> CompetitionContext:
        if not raw_competition:
            return CompetitionContext(
                radius_km=5.0,
                total_competitors=0,
                competitors=[],
                provider="unavailable",
                provenance=provenance or ProvenanceRecord(
                    source_type=SourceType.BACKEND_COMPETITION,
                    claim_type=ClaimType.FACT,
                    notes="No competition intelligence supplied"
                )
            )

        prov = provenance or ProvenanceRecord(
            source_type=SourceType.BACKEND_COMPETITION,
            claim_type=ClaimType.FACT,
            source_reference=str(raw_competition.get("provider", "google_places"))
        )

        radius_km = float(raw_competition.get("radiusKm") or raw_competition.get("radius_km") or 5.0)
        provider = str(raw_competition.get("provider", "unavailable"))
        retrieved_at = raw_competition.get("retrievedAt") or raw_competition.get("retrieved_at")

        raw_competitors = raw_competition.get("competitors") or []
        competitor_items: List[CompetitorItem] = []

        for item in raw_competitors:
            if not isinstance(item, dict) or not item.get("name"):
                continue

            try:
                lat = float(item["latitude"]) if item.get("latitude") is not None else None
            except (ValueError, TypeError):
                lat = None

            try:
                lng = float(item["longitude"]) if item.get("longitude") is not None else None
            except (ValueError, TypeError):
                lng = None

            try:
                dist = float(item.get("distanceKm") or item.get("distance_km") or 0.0)
            except (ValueError, TypeError):
                dist = 0.0

            competitor_items.append(CompetitorItem(
                name=str(item["name"]).strip(),
                category=item.get("category"),
                latitude=lat,
                longitude=lng,
                distance_km=dist,
                formatted_address=item.get("formattedAddress") or item.get("formatted_address"),
                provider_place_id=item.get("providerPlaceId") or item.get("provider_place_id"),
                source=item.get("source", provider)
            ))

        total_count = int(raw_competition.get("totalCompetitors") or len(competitor_items))

        return CompetitionContext(
            radius_km=radius_km,
            total_competitors=total_count,
            competitors=competitor_items,
            provider=provider,
            retrieved_at=str(retrieved_at) if retrieved_at else None,
            provenance=prov
        )
