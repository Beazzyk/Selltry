import axios, { AxiosError } from 'axios';
import { AppError } from '../middleware/error.middleware';
import { env } from '../utils/env';
import { getPresignedUrl } from './image.service';
import { getValidAccessToken } from './otomoto-oauth.service';
import { RawPlatformCategory } from '../types/platform.types';
import { flattenCategoryTree } from '../utils/category.utils';

const BASE_URL = 'https://www.otomoto.pl/api/open';

// User-Agent jest wymagany przez Otomoto API
const USER_AGENT = env.ALLEGRO_USER_AGENT;

const CONDITION_MAP: Record<string, string> = {
  NEW: 'new',
  USED: 'used',
  DAMAGED: 'used',
};

interface OtomotoAdvert {
  id: string;
  url?: string;
  status?: string;
}

interface OtomotoCategoryResponse {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

interface OtomotoAdvertsResponse {
  data?: unknown[];
  [key: string]: unknown;
}

interface ImageCollection {
  id: string;
}

export async function createImageCollection(
  userId: string,
  s3Keys: string[],
): Promise<string> {
  const token = await getValidAccessToken(userId);
  const urls = await Promise.all(s3Keys.map((key) => getPresignedUrl(key)));

  const response = await otomotoRequest<ImageCollection>(token, 'POST', '/imageCollections', {
    photos: urls.map((url) => ({ url })),
  });
  return response.id;
}

export async function createAdvert(
  userId: string,
  payload: Record<string, unknown>,
): Promise<OtomotoAdvert> {
  const token = await getValidAccessToken(userId);
  return otomotoRequest<OtomotoAdvert>(token, 'POST', '/account/adverts', payload);
}

export async function deleteAdvert(userId: string, advertId: string): Promise<void> {
  const token = await getValidAccessToken(userId);
  await otomotoRequest(token, 'DELETE', `/account/adverts/${advertId}`, undefined);
}

export async function getCategory(userId: string, categoryId: string): Promise<OtomotoCategoryResponse> {
  const token = await getValidAccessToken(userId);
  return otomotoRequest<OtomotoCategoryResponse>(token, 'GET', `/categories/${encodeURIComponent(categoryId)}`);
}

export async function getAccountAdvert(
  userId: string,
  advertId: string,
): Promise<{ id?: unknown; status?: unknown; url?: unknown }> {
  const token = await getValidAccessToken(userId);
  return otomotoRequest<{ id?: unknown; status?: unknown; url?: unknown }>(
    token, 'GET', `/account/adverts/${encodeURIComponent(advertId)}`,
  );
}

export async function getAccountAdverts(userId: string): Promise<OtomotoAdvertsResponse> {
  const token = await getValidAccessToken(userId);
  return otomotoRequest<OtomotoAdvertsResponse>(token, 'GET', '/account/adverts');
}

async function otomotoRequest<T>(
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
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const status = axiosError.response?.status ?? 502;
    const message =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    throw new AppError(status, `Otomoto API error: ${message}`);
  }
}

interface OtomotoCategoryListItem {
  id: string | number;
  name: string;
  children?: OtomotoCategoryListItem[];
}

interface OtomotoCategoryListResponse {
  data?: OtomotoCategoryListItem[];
  [key: string]: unknown;
}

export async function fetchAllOtomotoCategories(userId: string): Promise<RawPlatformCategory[]> {
  const token = await getValidAccessToken(userId);
  const response = await otomotoRequest<OtomotoCategoryListResponse>(token, 'GET', '/categories', undefined);
  return flattenCategoryTree(response.data ?? []);
}

export function buildAdvertPayload(params: {
  title: string;
  description: string;
  categoryId: string;
  condition: string;
  basePrice: number;
  currency: string;
  quantity: number;
  imageCollectionId?: string;
}): Record<string, unknown> {
  return {
    title: params.title,
    description: params.description,
    category_id: Number(params.categoryId),
    new_used: CONDITION_MAP[params.condition] ?? 'used',
    params: {
      price: {
        value: params.basePrice,
        currency: params.currency,
        gross_net: 'gross',
      },
    },
    ...(params.imageCollectionId && { photo_set_id: params.imageCollectionId }),
    stock: { quantity: params.quantity },
  };
}
