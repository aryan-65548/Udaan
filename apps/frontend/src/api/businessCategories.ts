import { apiClient } from './client';

export interface BusinessCategoryItem {
  id: string;
  code?: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export async function getBusinessCategories(): Promise<BusinessCategoryItem[]> {
  return apiClient<BusinessCategoryItem[]>('/business-categories');
}

export async function getBusinessCategoryById(id: string): Promise<BusinessCategoryItem> {
  return apiClient<BusinessCategoryItem>(`/business-categories/${id}`);
}
