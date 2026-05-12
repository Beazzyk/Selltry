import apiClient from './client';
import { CategoryType, InternalCategory, VehicleMake, VehicleModel, VehicleGeneration, VehicleType } from '../types';

export interface CategoryTypeInfo {
  type: CategoryType;
  count: number;
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
