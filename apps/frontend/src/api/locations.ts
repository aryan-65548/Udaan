import { apiClient } from './client';

export type LocationType = 'STATE' | 'DISTRICT' | 'BLOCK' | 'VILLAGE';

export interface LocationItem {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
  stateCode: string | null;
  districtCode: string | null;
  blockCode: string | null;
  villageCode: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  createdAt: string;
}

export interface LocationWithHierarchy extends LocationItem {
  hierarchy: LocationItem[];
}

export interface UnifiedLocationSelection {
  locationSelectionMethod: 'ADMINISTRATIVE' | 'GOOGLE_MAPS';
  locationId: string;
  countryCode: string;
  stateName?: string | null;
  districtName?: string | null;
  blockName?: string | null;
  villageName?: string | null;
  formattedAddress?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  googlePlaceId?: string | null;
}

export async function getStates(search?: string): Promise<LocationItem[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient<LocationItem[]>(`/locations/states${query}`);
}

export async function getDistricts(stateId: string, search?: string): Promise<LocationItem[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient<LocationItem[]>(`/locations/${stateId}/districts${query}`);
}

export async function getBlocks(districtId: string, search?: string): Promise<LocationItem[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient<LocationItem[]>(`/locations/${districtId}/blocks${query}`);
}

export async function getVillages(
  blockId: string,
  options?: { search?: string; page?: number; limit?: number }
): Promise<LocationItem[]> {
  const params = new URLSearchParams();
  if (options?.search) params.append('search', options.search);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiClient<LocationItem[]>(`/locations/${blockId}/villages${qs}`);
}

export async function searchLocations(q: string): Promise<LocationItem[]> {
  return apiClient<LocationItem[]>(`/locations/search?q=${encodeURIComponent(q)}`);
}

export async function getLocationById(id: string): Promise<LocationWithHierarchy> {
  return apiClient<LocationWithHierarchy>(`/locations/${id}`);
}

export interface ManualLocationPayload {
  stateName: string;
  districtName: string;
  blockName?: string;
  villageName?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  stateCode?: string | null;
}

export async function createManualLocation(payload: ManualLocationPayload): Promise<LocationItem> {
  return apiClient<LocationItem>('/locations/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
