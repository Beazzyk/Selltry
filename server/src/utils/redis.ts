import IORedis from 'ioredis';
import { env } from './env';

let instance: IORedis | null = null;

export function getRedis(): IORedis {
  if (!instance) {
    instance = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // required by BullMQ workers
      enableReadyCheck: false,
      lazyConnect: true,
    });
    instance.on('error', (err: Error) => {
      console.warn('[Redis] Connection error:', err.message);
    });
  }
  return instance;
}

export async function isRedisAvailable(): Promise<boolean> {
  try {
    const redis = getRedis();
    await redis.connect().catch(() => {});
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
