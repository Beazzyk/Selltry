import apiClient from './client';
import { Order, OrderStatus, Platform } from '../types';

export interface OrdersFilters {
  platform?: Platform;
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function getOrders(filters: OrdersFilters = {}): Promise<OrdersResponse> {
  const { data } = await apiClient.get<OrdersResponse>('/orders', { params: filters });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
  return data;
}

export async function syncOrders(platforms?: Platform[]): Promise<{ synced: Record<string, number | string> }> {
  const params = platforms?.length ? { platforms: platforms.join(',') } : {};
  const { data } = await apiClient.post('/orders/sync', null, { params });
  return data;
}

export async function getOrderStats(): Promise<Record<string, number>> {
  const { data } = await apiClient.get<Record<string, number>>('/orders/stats');
  return data;
}
