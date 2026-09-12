import { PopulationData } from './types';

export class PopulationProvider {
  /**
   * Retrieves population intelligence for a given location and radius.
   * If no concrete population provider is configured, returns a clean stub
   * indicating unavailable data. DOES NOT fabricate data.
   */
  static async getPopulationEstimate(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<PopulationData> {
    // We check if a concrete population provider API key is available.
    // Since none is chosen yet by AI engineer, we preserve the clean boundary.
    const apiKey = process.env.POPULATION_API_KEY;

    if (!apiKey) {
      // Fallback: explicit unavailable/unknown result
      return {
        estimatedPopulation: undefined,
        radiusKm,
        source: 'unavailable',
      };
    }

    // In the future, if a provider like Census or WorldPop is integrated,
    // actual HTTP calls would go here.
    
    return {
      estimatedPopulation: undefined,
      radiusKm,
      source: 'unknown_provider',
    };
  }
}
