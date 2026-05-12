import apiClient from './client';
import { Listing, ListingStatus } from '../types';

export interface CreateListingData {
  title: string;
  description: string;
  basePrice: number;
  condition: 'NEW' | 'USED' | 'DAMAGED';
  quantity?: number;
  identMethod: 'VIN' | 'CATALOG_NUMBER' | 'MANUAL' | 'AI_PARSED';
  vin?: string;
  catalogNumber?: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'OTHER';
  vehicleMakeId?: string;
  vehicleModelId?: string;
  vehicleGenId?: string;
  vehicleYearRaw?: number;
  vehicleEngine?: string;
  categoryId: string;
  partSide?: string;
  partDetails?: string;
  damageDescription?: string;
  rawUserInput?: string;
  attributes?: Record<string, string | number | undefined>;
}

export interface ListingsResponse {
  items: Listing[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function createListing(data: CreateListingData): Promise<Listing> {
  const { data: res } = await apiClient.post<Listing>('/listings', data);
  return res;
}

export async function getListings(params?: {
  status?: ListingStatus;
  search?: string;
  cursor?: string;
  limit?: number;
}): Promise<ListingsResponse> {
  const { data } = await apiClient.get<ListingsResponse>('/listings', { params });
  return data;
}

export async function getListing(id: string): Promise<Listing> {
  const { data } = await apiClient.get<Listing>(`/listings/${id}`);
  return data;
}

export async function updateListing(id: string, data: Partial<CreateListingData>): Promise<Listing> {
  const { data: res } = await apiClient.put<Listing>(`/listings/${id}`, data);
  return res;
}

export async function deleteListing(id: string): Promise<void> {
  await apiClient.delete(`/listings/${id}`);
}

export async function duplicateListing(id: string): Promise<Listing> {
  const { data } = await apiClient.post<Listing>(`/listings/${id}/duplicate`);
  return data;
}

export async function uploadImages(listingId: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  await apiClient.post(`/listings/${listingId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteImage(listingId: string, imageId: string): Promise<void> {
  await apiClient.delete(`/listings/${listingId}/images/${imageId}`);
}

export interface PlatformSyncResult {
  platform: string;
  status: string;
  synced: boolean;
  error?: string;
}

export interface GenerateDescriptionInput {
  categoryType: string;
  categoryName?: string;
  brand?: string;
  productModel?: string;
  condition: string;
  title: string;
  partSide?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  attributes?: Record<string, unknown>;
}

export interface GenerateResult {
  title: string;
  platformTitles: Record<string, string>;
  description: string;
}

export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateResult> {
  const { data } = await apiClient.post<GenerateResult>('/listings/generate-description', input);
  return data;
}

export async function syncListingStatus(listingId: string): Promise<{ results: PlatformSyncResult[] }> {
  const { data } = await apiClient.post<{ results: PlatformSyncResult[] }>(`/listings/${listingId}/sync`);
  return data;
}
