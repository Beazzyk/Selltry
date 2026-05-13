import apiClient from './client';
import { Listing, Platform } from '@/types';

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  errorListings: number;
  endedListings: number;
  listingsByPlatform: { platform: Platform; active: number }[];
  connectedPlatforms: Platform[];
  attentionListings: Listing[];
  recentListings: Listing[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
  return data;
}
