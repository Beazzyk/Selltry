import { Platform } from '@prisma/client';
import { fetchAllegroOrders } from './allegro-orders.service';
import { fetchOlxOrders } from './olx-orders.service';
import { upsertOrders } from './order.service';

const SUPPORTED: Platform[] = [Platform.ALLEGRO, Platform.OLX];

export async function syncOrdersForUser(
  userId: string,
  platforms: Platform[] = SUPPORTED,
): Promise<Record<string, number | string>> {
  const results: Record<string, number | string> = {};

  for (const platform of platforms) {
    try {
      let orders;
      if (platform === Platform.ALLEGRO) orders = await fetchAllegroOrders(userId);
      else if (platform === Platform.OLX) orders = await fetchOlxOrders(userId);
      else { results[platform] = 'not_supported'; continue; }

      results[platform] = await upsertOrders(userId, platform, orders);
    } catch (err) {
      results[platform] = `error: ${String(err)}`;
    }
  }

  return results;
}
