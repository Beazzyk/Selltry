/**
 * Jednorazowy skrypt do synchronizacji kategorii i marek.
 * Uruchom: npx ts-node scripts/run-sync.ts
 */
import 'dotenv/config';
import { PrismaClient, Platform } from '@prisma/client';
import { fetchAllAllegroCategoriesAsApp } from '../src/services/allegro-api.service';
import { fetchAllOlxCategoriesPublic } from '../src/services/olx-api.service';
import { syncIcecatBrands, isIcecatConfigured } from '../src/services/icecat.service';

const prisma = new PrismaClient();

async function upsertCategories(
  platform: Platform,
  items: { externalId: string; parentExternalId: string | null; name: string; isLeaf: boolean; depth: number }[],
): Promise<number> {
  const now = new Date();
  const BATCH = 100;
  let total = 0;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    await Promise.all(
      batch.map((item) =>
        prisma.platformCategory.upsert({
          where: { platform_externalId: { platform, externalId: item.externalId } },
          create: { ...item, platform, syncedAt: now },
          update: { name: item.name, isLeaf: item.isLeaf, parentExternalId: item.parentExternalId, depth: item.depth, syncedAt: now },
        }),
      ),
    );
    total += batch.length;
    process.stdout.write(`\r  ${platform}: ${total}/${items.length} kategorii...`);
  }
  console.log();
  return total;
}

async function main() {
  console.log('=== Selltry — Category & Brand Sync ===\n');

  // 1. Allegro
  console.log('► Allegro — pobieranie kategorii (app token)...');
  try {
    const cats = await fetchAllAllegroCategoriesAsApp();
    const n = await upsertCategories(Platform.ALLEGRO, cats);
    console.log(`  ✓ Allegro: ${n} kategorii zapisano.\n`);
  } catch (err) {
    console.error('  ✗ Allegro błąd:', String(err), '\n');
  }

  // 2. OLX
  console.log('► OLX — pobieranie kategorii (public API)...');
  try {
    const cats = await fetchAllOlxCategoriesPublic();
    const n = await upsertCategories(Platform.OLX, cats);
    console.log(`  ✓ OLX: ${n} kategorii zapisano.\n`);
  } catch (err) {
    console.error('  ✗ OLX błąd:', String(err), '\n');
  }

  // 3. Icecat brands
  if (isIcecatConfigured()) {
    console.log('► Icecat — pobieranie marek...');
    try {
      const { upserted } = await syncIcecatBrands();
      console.log(`  ✓ Icecat: ${upserted} marek zapisano.\n`);
    } catch (err) {
      console.error('  ✗ Icecat błąd:', String(err), '\n');
    }
  } else {
    console.log('  ⚠ Icecat pominięty — brak ICECAT_USERNAME/ICECAT_PASSWORD w .env\n');
  }

  console.log('=== Sync zakończony ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
