import axios from 'axios';
import { env } from '../utils/env';

const OAUTH_BASE = env.ALLEGRO_SANDBOX
  ? 'https://allegro.pl.allegrosandbox.pl'
  : 'https://allegro.pl';

interface AppTokenCache {
  token: string;
  expiresAt: number;
}

let cache: AppTokenCache | null = null;

export async function getAllegroAppToken(): Promise<string> {
  // Return cached token if still valid (with 60s margin)
  if (cache && Date.now() < cache.expiresAt - 60_000) {
    return cache.token;
  }

  if (!env.ALLEGRO_CLIENT_ID || !env.ALLEGRO_CLIENT_SECRET) {
    throw new Error('Allegro client credentials not configured (ALLEGRO_CLIENT_ID, ALLEGRO_CLIENT_SECRET)');
  }

  const auth = Buffer.from(`${env.ALLEGRO_CLIENT_ID}:${env.ALLEGRO_CLIENT_SECRET}`).toString('base64');

  const { data } = await axios.post<{ access_token: string; expires_in: number }>(
    `${OAUTH_BASE}/auth/oauth/token`,
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': env.ALLEGRO_USER_AGENT,
      },
    },
  );

  cache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cache.token;
}
