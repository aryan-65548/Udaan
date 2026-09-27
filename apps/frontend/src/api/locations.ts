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

export async function getStates(): Promise<LocationItem[]> {
  return apiClient<LocationItem[]>('/locations/states');
}

export async function getDistricts(stateId: string): Promise<LocationItem[]> {
  return apiClient<LocationItem[]>(`/locations/${stateId}/districts`);
}

export async function getBlocks(districtId: string): Promise<LocationItem[]> {
  return apiClient<LocationItem[]>(`/locations/${districtId}/blocks`);
}

export async function getVillages(blockId: string): Promise<LocationItem[]> {
  return apiClient<LocationItem[]>(`/locations/${blockId}/villages`);
}

export async function getLocationById(id: string): Promise<LocationWithHierarchy> {
  return apiClient<LocationWithHierarchy>(`/locations/${id}`);
}
