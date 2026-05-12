import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Platform } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { encrypt } from '../utils/crypto';
import { env } from '../utils/env';
import { prisma } from '../utils/prisma';
import { isExpiringSoon, storeTokens, tryDecrypt } from '../utils/token-refresh';

interface OAuthStatePayload {
  userId: string;
  platform: 'EBAY';
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

const AUTH_BASE = env.EBAY_SANDBOX ? 'https://auth.sandbox.ebay.com' : 'https://auth.ebay.com';
const API_BASE = env.EBAY_SANDBOX ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
const TOKEN_URL = `${API_BASE}/identity/v1/oauth2/token`;
const SCOPES = [
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
].join(' ');

export function buildAuthorizationUrl(userId: string): string {
  validateOAuthEnv();
  const state = jwt.sign(
    { userId, platform: 'EBAY' satisfies OAuthStatePayload['platform'] },
    env.JWT_SECRET,
    { expiresIn: '10m' },
  );
  const params = new URLSearchParams({
    client_id: env.EBAY_CLIENT_ID,
    redirect_uri: env.EBAY_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state,
  });
  return `${AUTH_BASE}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeAndStoreConnection(code: string, state: string): Promise<void> {
  validateOAuthEnv();
  const payload = verifyState(state);
  const tokenResponse = await requestTokensByCode(code);
  const tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000);

  await prisma.userPlatform.upsert({
    where: { userId_platform: { userId: payload.userId, platform: Platform.EBAY } },
    create: {
      userId: payload.userId,
      platform: Platform.EBAY,
      isActive: true,
      accessToken: encrypt(tokenResponse.access_token),
      refreshToken: tokenResponse.refresh_token ? encrypt(tokenResponse.refresh_token) : null,
      tokenExpiry,
      connectedAt: new Date(),
    },
    update: {
      isActive: true,
      accessToken: encrypt(tokenResponse.access_token),
      refreshToken: tokenResponse.refresh_token ? encrypt(tokenResponse.refresh_token) : null,
      tokenExpiry,
      connectedAt: new Date(),
    },
  });
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const record = await prisma.userPlatform.findUnique({
    where: { userId_platform: { userId, platform: Platform.EBAY } },
  });
  if (!record?.accessToken) throw new AppError(400, 'eBay access token missing. Connect eBay first.');
  if (isExpiringSoon(record.tokenExpiry) && record.refreshToken) {
    const decryptedRefresh = tryDecrypt(record.refreshToken);
    if (!decryptedRefresh) throw new AppError(400, 'eBay refresh token is corrupted. Reconnect eBay.');
    const refreshed = await requestTokensByRefresh(decryptedRefresh);
    await storeTokens(
      userId,
      Platform.EBAY,
      refreshed.access_token,
      refreshed.refresh_token ?? null,
      refreshed.expires_in,
    );
    return refreshed.access_token;
  }
  const decryptedAccess = tryDecrypt(record.accessToken);
  if (!decryptedAccess) throw new AppError(400, 'eBay access token is corrupted. Reconnect eBay.');
  return decryptedAccess;
}

function verifyState(state: string): OAuthStatePayload {
  try {
    const payload = jwt.verify(state, env.JWT_SECRET) as OAuthStatePayload;
    if (!payload.userId || payload.platform !== 'EBAY') throw new Error();
    return payload;
  } catch {
    throw new AppError(400, 'Invalid or expired OAuth state');
  }
}

async function requestTokensByCode(code: string): Promise<TokenResponse> {
  const auth = Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post<TokenResponse>(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.EBAY_REDIRECT_URI,
    }),
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return response.data;
}

async function requestTokensByRefresh(refreshToken: string): Promise<TokenResponse> {
  const auth = Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post<TokenResponse>(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: SCOPES,
    }),
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return response.data;
}

function validateOAuthEnv(): void {
  const missing: string[] = [];
  if (!env.EBAY_CLIENT_ID) missing.push('EBAY_CLIENT_ID');
  if (!env.EBAY_CLIENT_SECRET) missing.push('EBAY_CLIENT_SECRET');
  if (!env.EBAY_REDIRECT_URI) missing.push('EBAY_REDIRECT_URI');
  if (missing.length > 0) {
    throw new AppError(400, `eBay OAuth not configured. Missing: ${missing.join(', ')}`);
  }
}
