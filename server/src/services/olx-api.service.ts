import axios, { AxiosError } from 'axios';
import { AppError } from '../middleware/error.middleware';
import { getPresignedUrl } from './image.service';
import { getValidAccessToken } from './olx-oauth.service';

const BASE_URL = 'https://www.olx.pl/api/open';

// OLX wymaga nagłówka Version: 2.0 we wszystkich requestach
const OLX_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  Version: '2.0',
});

const CONDITION_MAP: Record<string, string> = {
  NEW: 'new',
  USED: 'used',
  DAMAGED: 'used',
};

interface OlxAdvert {
  id: number;
  url?: string;
  status?: string;
}

interface OlxDeliverySettingsResponse {
  data?: unknown[];
  [key: string]: unknown;
}

interface OlxCategoryAttributesResponse {
  data?: unknown[];
  [key: string]: unknown;
}

interface OlxAdvertsResponse {
  data?: unknown[];
  [key: string]: unknown;
}

export async function createAdvert(
  userId: string,
  payload: Record<string, unknown>,
): Promise<OlxAdvert> {
  const token = await getValidAccessToken(userId);
  return olxRequest<OlxAdvert>(token, 'POST', '/adverts', payload);
}

export async function deactivateAdvert(userId: string, advertId: number): Promise<void> {
  const token = await getValidAccessToken(userId);
  await olxRequest(token, 'POST', `/adverts/${advertId}/commands`, { command: 'deactivate' });
}

export async function getDeliverySettings(userId: string): Promise<OlxDeliverySettingsResponse> {
  const token = await getValidAccessToken(userId);
  return olxRequest<OlxDeliverySettingsResponse>(token, 'GET', '/delivery/settings');
}

export async function getCategoryAttributes(
  userId: string,
  categoryId: string,
): Promise<OlxCategoryAttributesResponse> {
  const token = await getValidAccessToken(userId);
  return olxRequest<OlxCategoryAttributesResponse>(token, 'GET', `/categories/${encodeURIComponent(categoryId)}/attributes`);
}

export async function getAdverts(userId: string): Promise<OlxAdvertsResponse> {
  const token = await getValidAccessToken(userId);
  return olxRequest<OlxAdvertsResponse>(token, 'GET', '/adverts');
}

export function buildAdvertPayload(params: {
  title: string;
  description: string;
  categoryId: string;
  condition: string;
  basePrice: number;
  currency: string;
  imageUrls: string[];
}): Record<string, unknown> {
  return {
    title: params.title,
    description: params.description,
    category_id: Number(params.categoryId),
    advertiser_type: 'business',
    contact: { name: 'AutoLister' },
    attributes: [
      { code: 'price', value: String(params.basePrice) },
      { code: 'price_type', value: 'fixed' },
      { code: 'state', value: CONDITION_MAP[params.condition] ?? 'used' },
    ],
    images: params.imageUrls,
  };
}

export async function getImagePresignedUrls(s3Keys: string[]): Promise<string[]> {
  return Promise.all(s3Keys.map((key) => getPresignedUrl(key)));
}

async function olxRequest<T>(
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
      headers: OLX_HEADERS(token),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    const status = axiosError.response?.status ?? 502;
    const message =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    throw new AppError(status, `OLX API error: ${message}`);
  }
}
