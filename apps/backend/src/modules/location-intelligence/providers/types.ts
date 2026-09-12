export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodedLocation extends Coordinates {
  formattedAddress: string;
}

export interface CompetitorData {
  providerPlaceId?: string;
  name: string;
  category?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  formattedAddress?: string;
  source: string;
}

export interface PopulationData {
  estimatedPopulation?: number;
  radiusKm: number;
  source: string;
  dataYear?: number;
}
