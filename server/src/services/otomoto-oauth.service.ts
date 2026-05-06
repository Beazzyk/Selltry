import axios from 'axios';
import { Platform } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { env } from '../utils/env';
import { prisma } from '../utils/prisma';
import { tryDecrypt, isExpiringSoon, storeTokens } from '../utils/token-refresh';

// Otomoto używa Resource Owner Password Credentials — seller podaje login/hasło konta Otomoto Business
const TOKEN_URL = 'https://www.otomoto.pl/api/open/oauth/token/';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function connectWithCredentials(
  userId: string,
  username: string,
  password: string,
): Promise<void> {
  validateOAuthEnv();
  const tokenResponse = await requestTokens(username, password);

  await prisma.userPlatform.upsert({
    where: { userId_platform: { userId, platform: Platform.OTOMOTO } },
    create: {
      userId,
      platform: Platform.OTOMOTO,
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
    where: { userId_platform: { userId, platform: Platform.OTOMOTO } },
  });

  if (!record?.accessToken) {
    throw new AppError(400, 'Otomoto access token missing. Connect Otomoto first.');
  }

  if (isExpiringSoon(record.tokenExpiry) && record.refreshToken) {
    const refreshed = await refreshToken(tryDecrypt(record.refreshToken)!);
    await storeTokens(
      userId,
      Platform.OTOMOTO,
      refreshed.access_token,
      refreshed.refresh_token,
      refreshed.expires_in,
    );
    return refreshed.access_token;
  }

  return tryDecrypt(record.accessToken)!;
}

async function requestTokens(username: string, password: string): Promise<TokenResponse> {
  const auth = Buffer.from(`${env.OTOMOTO_CLIENT_ID}:${env.OTOMOTO_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post<TokenResponse>(
    TOKEN_URL,
    new URLSearchParams({ grant_type: 'password', username, password }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': env.ALLEGRO_USER_AGENT,
      },
    },
  );
  return response.data;
}

async function refreshToken(currentRefreshToken: string): Promise<TokenResponse> {
  const auth = Buffer.from(`${env.OTOMOTO_CLIENT_ID}:${env.OTOMOTO_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post<TokenResponse>(
    TOKEN_URL,
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: currentRefreshToken }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': env.ALLEGRO_USER_AGENT,
      },
    },
  );
  return response.data;
}

function validateOAuthEnv(): void {
  if (!env.OTOMOTO_CLIENT_ID || !env.OTOMOTO_CLIENT_SECRET) {
    throw new AppError(400, 'Otomoto OAuth not configured. Missing: OTOMOTO_CLIENT_ID, OTOMOTO_CLIENT_SECRET');
  }
}
