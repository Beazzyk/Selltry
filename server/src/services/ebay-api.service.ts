import axios, { AxiosError } from 'axios';
import { AppError } from '../middleware/error.middleware';
import { env } from '../utils/env';
import { getValidAccessToken } from './ebay-oauth.service';

const BASE_URL = env.EBAY_SANDBOX ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';

function ebayHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function getFulfillmentPolicies(userId: string, marketplaceId: string) {
  const token = await getValidAccessToken(userId);
  return ebayRequest(token, 'GET', `/sell/account/v1/fulfillment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`);
}

export async function getPaymentPolicies(userId: string, marketplaceId: string) {
  const token = await getValidAccessToken(userId);
  return ebayRequest(token, 'GET', `/sell/account/v1/payment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`);
}

export async function getReturnPolicies(userId: string, marketplaceId: string) {
  const token = await getValidAccessToken(userId);
  return ebayRequest(token, 'GET', `/sell/account/v1/return_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`);
}

export async function getOffers(userId: string, limit = 25) {
  const token = await getValidAccessToken(userId);
  return ebayRequest(token, 'GET', `/sell/inventory/v1/offer?limit=${limit}`);
}

async function ebayRequest<T = unknown>(
  token: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: unknown,
): Promise<T> {
  try {
    const response = await axios.request<T>({
      method,
      url: `${BASE_URL}${path}`,
      data,
      headers: ebayHeaders(token),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ errors?: Array<{ message?: string }>; message?: string; error?: string }>;
    const status = axiosError.response?.status ?? 502;
    const message =
      axiosError.response?.data?.errors?.[0]?.message ??
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    throw new AppError(status, `eBay API error: ${message}`);
  }
}
