import apiClient from './client';
import { CategoryType, InternalCategory, VehicleMake, VehicleModel, VehicleGeneration, VehicleType } from '../types';

export interface CategoryTypeInfo {
  type: CategoryType;
  count: number;
}

export interface Brand {
  id: string;
  name: string;
}

export async function getBrands(type: CategoryType): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>('/brands', { params: { type } });
  return data;
}

export async function getCategoryTypes(): Promise<CategoryTypeInfo[]> {
  const { data } = await apiClient.get<CategoryTypeInfo[]>('/category-types');
  return data;
}

export async function getCategories(type?: CategoryType): Promise<InternalCategory[]> {
  const { data } = await apiClient.get<InternalCategory[]>('/categories', {
    params: type ? { type } : {},
  });
  return data;
}

export interface CategoryMappingExport {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  parentSlug: string | null;
  mappings: Record<
    string,
    { externalCategoryId: string; externalCategoryName: string | null } | null
  >;
}

export async function getCategoryMappings(): Promise<CategoryMappingExport[]> {
  const { data } = await apiClient.get<CategoryMappingExport[]>('/categories/mappings');
  return data;
}

export async function getVehicleMakes(type?: VehicleType): Promise<VehicleMake[]> {
  const { data } = await apiClient.get<VehicleMake[]>('/vehicles/makes', {
    params: type ? { type } : {},
  });
  return data;
}

export async function getVehicleModels(makeId: string): Promise<VehicleModel[]> {
  const { data } = await apiClient.get<VehicleModel[]>(`/vehicles/makes/${makeId}/models`);
  return data;
}

export async function getVehicleGenerations(modelId: string): Promise<VehicleGeneration[]> {
  const { data } = await apiClient.get<VehicleGeneration[]>(`/vehicles/models/${modelId}/generations`);
  return data;
}

export interface PlatformCategoryNode {
  id: string;
  externalId: string;
  parentExternalId: string | null;
  name: string;
  isLeaf: boolean;
  depth: number;
}

export interface PlatformSyncStatus {
  count: number;
  lastSync: string | null;
  supported: boolean;
}

export async function searchPlatformCategories(platform: string, q: string): Promise<PlatformCategoryNode[]> {
  const { data } = await apiClient.get<PlatformCategoryNode[]>(`/platform/${platform.toLowerCase()}/search`, { params: { q } });
  return data;
}

export async function getPlatformSyncStatus(platform: string): Promise<PlatformSyncStatus> {
  const { data } = await apiClient.get<PlatformSyncStatus>(`/platform/${platform.toLowerCase()}/sync-status`);
  return data;
}

export async function getPlatformCategoryBreadcrumb(platform: string, externalId: string): Promise<PlatformCategoryNode[]> {
  const { data } = await apiClient.get<PlatformCategoryNode[]>(`/platform/${platform.toLowerCase()}/breadcrumb/${externalId}`);
  return data;
}
