import { db } from '../db';
import { assessments, locations, businessCategories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { GeocodingProvider } from '../modules/location-intelligence/providers/google-geocoding';
import { PlacesProvider } from '../modules/location-intelligence/providers/google-places';
import { PopulationProvider } from '../modules/location-intelligence/providers/population';

export interface LocationIntelligenceContext {
  location: {
    locationId: string;
    villageName?: string;
    villageCode?: string;
    blockName?: string;
    blockCode?: string;
    districtName?: string;
    districtCode?: string;
    stateName?: string;
    stateCode?: string;
    pincode?: string;
    formattedAddress?: string;
    latitude: number;
    longitude: number;
  };
  competition: {
    radiusKm: number;
    totalCompetitors: number;
    competitors: Array<{
      providerPlaceId?: string;
      name: string;
      category?: string;
      latitude?: number;
      longitude?: number;
      distanceKm: number;
      formattedAddress?: string;
      source?: string;
    }>;
    provider?: string;
    retrievedAt?: string;
  };
  population?: {
    estimatedPopulation?: number;
    radiusKm: number;
    source?: string;
    dataYear?: number;
  };
}

export class LocationIntelligenceService {
  /**
   * Generates Location Intelligence Context for a given assessment.
   */
  static async generateContext(assessmentId: string, requestedRadiusKm?: number): Promise<LocationIntelligenceContext> {
    const assessmentResult = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!assessmentResult.length) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const assessment = assessmentResult[0];

    // Get location
    const locationResult = await db
      .select()
      .from(locations)
      .where(eq(locations.id, assessment.locationId))
      .limit(1);

    if (!locationResult.length) {
      throw new Error(`Location ${assessment.locationId} not found`);
    }

    const location = locationResult[0];

    // Build hierarchy
    let currentLoc: typeof location | undefined = location;
    const hierarchy: typeof location[] = [];
    while (currentLoc) {
      hierarchy.push(currentLoc);
      if (currentLoc.parentId) {
        const parentResult = await db
          .select()
          .from(locations)
          .where(eq(locations.id, currentLoc.parentId))
          .limit(1);
        currentLoc = parentResult[0];
      } else {
        currentLoc = undefined;
      }
    }

    const locCtx: LocationIntelligenceContext['location'] = {
      locationId: location.id,
      latitude: 0,
      longitude: 0,
    };

    const addressParts: string[] = [];

    for (const node of hierarchy) {
      addressParts.push(node.name);
      if (node.type === 'VILLAGE') {
        locCtx.villageName = node.name;
        locCtx.villageCode = node.villageCode || undefined;
      } else if (node.type === 'BLOCK') {
        locCtx.blockName = node.name;
        locCtx.blockCode = node.blockCode || undefined;
      } else if (node.type === 'DISTRICT') {
        locCtx.districtName = node.name;
        locCtx.districtCode = node.districtCode || undefined;
      } else if (node.type === 'STATE') {
        locCtx.stateName = node.name;
        locCtx.stateCode = node.stateCode || undefined;
      }
    }

    const builtAddress = addressParts.join(', ');
    
    // Resolve coordinates
    let lat = location.latitude ? Number(location.latitude) : 0;
    let lng = location.longitude ? Number(location.longitude) : 0;
    let formattedAddress = builtAddress;

    // Geocode if coordinates are missing
    if (lat === 0 || lng === 0) {
      try {
        const geocoded = await GeocodingProvider.geocodeAddress(builtAddress);
        lat = geocoded.latitude;
        lng = geocoded.longitude;
        formattedAddress = geocoded.formattedAddress;
      } catch (err: any) {
        console.warn(`Geocoding failed for address: ${builtAddress}. Reason: ${err.message}`);
        // Cannot proceed without coordinates
        throw new Error('Location coordinates are unavailable and geocoding failed.');
      }
    }

    locCtx.latitude = lat;
    locCtx.longitude = lng;
    locCtx.formattedAddress = formattedAddress;

    // Radius determination
    const defaultRadius = Number(process.env.LOCATION_INTELLIGENCE_DEFAULT_RADIUS_KM || 5);
    const radiusKm = requestedRadiusKm || defaultRadius;

    // Get Business Category
    const categoryResult = await db
      .select()
      .from(businessCategories)
      .where(eq(businessCategories.id, assessment.businessCategoryId))
      .limit(1);

    const categoryName = categoryResult.length ? categoryResult[0].name : 'Unknown';

    // Fetch competitors
    let competitors: LocationIntelligenceContext['competition']['competitors'] = [];
    let compProvider = 'unavailable';

    try {
      competitors = await PlacesProvider.discoverCompetitors(lat, lng, radiusKm, categoryName);
      compProvider = 'google_places';
    } catch (err: any) {
      console.warn(`Competitor discovery failed: ${err.message}`);
      // Return empty competitors instead of failing
    }

    // Fetch population
    const populationData = await PopulationProvider.getPopulationEstimate(lat, lng, radiusKm);

    return {
      location: locCtx,
      competition: {
        radiusKm,
        totalCompetitors: competitors.length,
        competitors,
        provider: compProvider,
        retrievedAt: new Date().toISOString(),
      },
      population: populationData,
    };
  }
}
