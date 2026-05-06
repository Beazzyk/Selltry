// Redis removed — BullMQ not used, publishing is synchronous
export function getRedis() {
  throw new Error('Redis is not configured');
}
