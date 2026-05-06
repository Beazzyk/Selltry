import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Platform } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { env } from '../utils/env';
import { prisma } from '../utils/prisma';
import { tryDecrypt, isExpiringSoon, storeTokens } from '../utils/token-refresh';

// OLX używa Authorization Code — identyczny pattern do Allegro
const TOKEN_URL = 'https://www.olx.pl/api/open/oauth/token';
const AUTH_URL = 'https://www.olx.pl/oauth/authorize';

interface OAuthStatePayload {
  userId: string;
  platform: 'OLX';
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export function buildAuthorizationUrl(userId: string): string {
  validateOAuthEnv();
  const state = jwt.sign(
    { userId, platform: 'OLX' satisfies OAuthStatePayload['platform'] },
    env.JWT_SECRET,
    { expiresIn: '10m' },
  );
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.OLX_CLIENT_ID,
    client_secret: env.OLX_CLIENT_SECRET,
    scope: 'v2 read write',
    redirect_uri: env.OLX_REDIRECT_URI,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeAndStoreConnection(code: string, state: string): Promise<void> {
  validateOAuthEnv();
  const payload = verifyState(state);
  const tokenResponse = await requestTokens(code);

  await prisma.userPlatform.upsert({
    where: { userId_platform: { userId: payload.userId, platform: Platform.OLX } },
    create: {
      userId: payload.userId,
      platform: Platform.OLX,
      isActive: true,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
      connectedAt: new Date(),
    },
    update: {
      isActive: true,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
      connectedAt: new Date(),
    },
  });
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const record = await prisma.userPlatform.findUnique({
    where: { userId_platform: { userId, platform: Platform.OLX } },
  });

  if (!record?.accessToken) {
    throw new AppError(400, 'OLX access token missing. Connect OLX first.');
  }

  if (isExpiringSoon(record.tokenExpiry) && record.refreshToken) {
    // UWAGA: OLX może zmienić refresh_token przy każdym odświeżeniu — zawsze zapisuj nowy
    const refreshed = await doRefresh(tryDecrypt(record.refreshToken)!);
    await storeTokens(
      userId,
      Platform.OLX,
      refreshed.access_token,
      refreshed.refresh_token,
      refreshed.expires_in,
    );
    return refreshed.access_token;
  }

  return tryDecrypt(record.accessToken)!;
}

async function requestTokens(code: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.OLX_CLIENT_ID,
      client_secret: env.OLX_CLIENT_SECRET,
      code,
      scope: 'v2 read write',
      redirect_uri: env.OLX_REDIRECT_URI,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return response.data;
}

async function doRefresh(currentRefreshToken: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.OLX_CLIENT_ID,
      client_secret: env.OLX_CLIENT_SECRET,
      refresh_token: currentRefreshToken,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return response.data;
}

function verifyState(state: string): OAuthStatePayload {
  try {
    const payload = jwt.verify(state, env.JWT_SECRET) as OAuthStatePayload;
    if (!payload.userId || payload.platform !== 'OLX') throw new Error();
    return payload;
  } catch {
    throw new AppError(400, 'Invalid or expired OAuth state');
  }
}

function validateOAuthEnv(): void {
  if (!env.OLX_CLIENT_ID || !env.OLX_CLIENT_SECRET || !env.OLX_REDIRECT_URI) {
    throw new AppError(400, 'OLX OAuth not configured. Missing: OLX_CLIENT_ID, OLX_CLIENT_SECRET, OLX_REDIRECT_URI');
  }
}
