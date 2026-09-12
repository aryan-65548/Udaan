import { GeocodedLocation } from './types';

export class GeocodingProvider {
  /**
   * Geocodes a free-form address string to coordinates and a formatted address.
   * If GOOGLE_MAPS_API_KEY is not set, throws an error (or can be mocked).
   */
  static async geocodeAddress(address: string): Promise<GeocodedLocation> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', address);
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Geocoding API returned status: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No geocoding results found for the provided address');
    }

    const result = data.results[0];
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  }
}
