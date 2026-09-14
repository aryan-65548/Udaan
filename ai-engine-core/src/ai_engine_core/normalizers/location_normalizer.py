"""
Location intelligence normalizer.
Standardizes administrative hierarchy, coordinates, and resolves population context.
"""

from typing import Any, Dict, Optional
from ..schemas.location import LocationContext, PopulationContext
from ..schemas.provenance import ProvenanceRecord, SourceType, ClaimType
from .population_normalizer import PopulationNormalizer


class LocationNormalizer:
    """Standardizes geographic hierarchy and location attributes into canonical LocationContext."""

    @classmethod
    def normalize(
        cls,
        raw_location_intel: Optional[Dict[str, Any]],
        provenance: Optional[ProvenanceRecord] = None
    ) -> LocationContext:
        if not raw_location_intel or not raw_location_intel.get("location"):
            # Minimal fallback location
            return LocationContext(
                location_id="unknown_location",
                formatted_address="Location not provided",
                latitude=0.0,
                longitude=0.0,
                provenance=provenance or ProvenanceRecord(
                    source_type=SourceType.UNKNOWN,
                    claim_type=ClaimType.ASSUMPTION,
                    notes="Location intelligence payload was empty"
                )
            )

        loc = raw_location_intel["location"]
        prov = provenance or ProvenanceRecord(
            source_type=SourceType.BACKEND_LOCATION,
            claim_type=ClaimType.FACT,
            source_reference=str(loc.get("locationId") or loc.get("location_id", "locations_table"))
        )

        # Coordinate parsing
        try:
            lat = float(loc.get("latitude", 0.0))
            lng = float(loc.get("longitude", 0.0))
        except (ValueError, TypeError):
            lat = 0.0
            lng = 0.0

        # Formatted address fallback
        formatted_address = loc.get("formattedAddress") or loc.get("formatted_address")
        if not formatted_address:
            parts = [
                loc.get("villageName") or loc.get("village_name"),
                loc.get("blockName") or loc.get("block_name"),
                loc.get("districtName") or loc.get("district_name"),
                loc.get("stateName") or loc.get("state_name"),
            ]
            formatted_address = ", ".join([p for p in parts if p]) or "Resolved Coordinates Location"

        # Population
        pop_payload = raw_location_intel.get("population")
        pop_context = PopulationNormalizer.normalize(pop_payload)

        # Radius
        search_radius = float(
            raw_location_intel.get("competition", {}).get("radiusKm", 5.0)
            if isinstance(raw_location_intel.get("competition"), dict)
            else 5.0
        )

        return LocationContext(
            location_id=str(loc.get("locationId") or loc.get("location_id", "loc_unknown")),
            village_name=loc.get("villageName") or loc.get("village_name"),
            village_code=loc.get("villageCode") or loc.get("village_code"),
            block_name=loc.get("blockName") or loc.get("block_name"),
            block_code=loc.get("blockCode") or loc.get("block_code"),
            district_name=loc.get("districtName") or loc.get("district_name"),
            district_code=loc.get("districtCode") or loc.get("district_code"),
            state_name=loc.get("stateName") or loc.get("state_name"),
            state_code=loc.get("stateCode") or loc.get("state_code"),
            pincode=loc.get("pincode"),
            formatted_address=formatted_address,
            latitude=lat,
            longitude=lng,
            search_radius_km=search_radius,
            population=pop_context,
            provenance=prov
        )
