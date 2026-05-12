import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function requireEnv32Chars(key: string): string {
  const value = requireEnv(key);
  if (value.length !== 32) throw new Error(`${key} must be exactly 32 characters (got ${value.length})`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  CLIENT_URL: requireEnv('CLIENT_URL'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  ENCRYPTION_KEY: requireEnv32Chars('ENCRYPTION_KEY'),
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  S3_ENDPOINT: process.env.S3_ENDPOINT ?? '',
  S3_BUCKET: process.env.S3_BUCKET ?? '',
  S3_REGION: process.env.S3_REGION ?? 'us-east-1',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
  ALLEGRO_SANDBOX: process.env.ALLEGRO_SANDBOX !== 'false',
  ALLEGRO_USER_AGENT:
    process.env.ALLEGRO_USER_AGENT ?? 'AutoLister/0.1.0 (+https://example.com/autolister)',
  ALLEGRO_CLIENT_ID: process.env.ALLEGRO_CLIENT_ID ?? '',
  ALLEGRO_CLIENT_SECRET: process.env.ALLEGRO_CLIENT_SECRET ?? '',
  ALLEGRO_REDIRECT_URI: process.env.ALLEGRO_REDIRECT_URI ?? '',
  ALLEGRO_MOCK: process.env.ALLEGRO_MOCK !== 'false',
  OTOMOTO_MOCK: process.env.OTOMOTO_MOCK !== 'false',
  OTOMOTO_CLIENT_ID: process.env.OTOMOTO_CLIENT_ID ?? '',
  OTOMOTO_CLIENT_SECRET: process.env.OTOMOTO_CLIENT_SECRET ?? '',
  OLX_MOCK: process.env.OLX_MOCK !== 'false',
  OLX_CLIENT_ID: process.env.OLX_CLIENT_ID ?? '',
  OLX_CLIENT_SECRET: process.env.OLX_CLIENT_SECRET ?? '',
  OLX_REDIRECT_URI: process.env.OLX_REDIRECT_URI ?? '',
  OVOKO_MOCK: process.env.OVOKO_MOCK !== 'false',
  EBAY_MOCK: process.env.EBAY_MOCK !== 'false',
  EBAY_SANDBOX: process.env.EBAY_SANDBOX !== 'false',
  EBAY_CLIENT_ID: process.env.EBAY_CLIENT_ID ?? '',
  EBAY_CLIENT_SECRET: process.env.EBAY_CLIENT_SECRET ?? '',
  EBAY_REDIRECT_URI: process.env.EBAY_REDIRECT_URI ?? '',
};
