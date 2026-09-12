import { CompetitorData } from './types';
import { calculateDistanceKm } from '../domain/distance';

// Mapping from generic Udaan business categories to Google Places Types
// This can be expanded based on exact business categories in the DB.
const CATEGORY_TO_PLACE_TYPES: Record<string, string[]> = {
  'Agriculture': ['farm'],
  'Retail': ['store', 'supermarket', 'convenience_store'],
  'Manufacturing': ['manufacturer'],
  'Services': ['hair_care', 'plumber', 'electrician'],
  'Food & Beverage': ['restaurant', 'cafe', 'bakery'],
};

export class PlacesProvider {
  /**
   * Discovers competitors around a location using Google Places API (New) - Nearby Search
   */
  static async discoverCompetitors(
    latitude: number,
    longitude: number,
    radiusKm: number,
    businessCategoryName: string
  ): Promise<CompetitorData[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }

    // Google Places (New) Nearby Search endpoint
    const url = 'https://places.googleapis.com/v1/places:searchNearby';

    // Map business category to place types
    const includedTypes = CATEGORY_TO_PLACE_TYPES[businessCategoryName] || ['store', 'point_of_interest'];

    const requestBody = {
      includedTypes,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude,
          },
          radius: radiusKm * 1000, // convert km to meters
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Request only the fields we need to minimize cost
        'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryType,places.location,places.formattedAddress',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google Places API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const places = data.places || [];

    const competitors: CompetitorData[] = places.map((place: any) => {
      const placeLat = place.location?.latitude || 0;
      const placeLng = place.location?.longitude || 0;
      const distanceKm = calculateDistanceKm(latitude, longitude, placeLat, placeLng);

      return {
        providerPlaceId: place.id,
        name: place.displayName?.text || 'Unknown Business',
        category: place.primaryType,
        latitude: placeLat,
        longitude: placeLng,
        distanceKm,
        formattedAddress: place.formattedAddress,
        source: 'google_places',
      };
    });

    // Filter by strict radius and sort by distance
    return competitors
      .filter((c) => c.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
