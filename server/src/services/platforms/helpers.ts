import { Platform, PlatformStatus } from '@prisma/client';
import { PublishResult, SyncStatusResult } from './base.platform.service';

export async function mockPublish(platform: Platform, baseUrl: string): Promise<PublishResult> {
  // MOCK MODE — wymaga X_MOCK=false i prawdziwego tokenu
  await delay(800 + Math.random() * 1200);
  const timestamp = Date.now();
  return {
    externalId: `MOCK-${platform}-${timestamp}`,
    externalUrl: `${baseUrl}/mock-${timestamp}`,
    status: 'ACTIVE',
  };
}

export async function mockSync(_externalId: string): Promise<SyncStatusResult> {
  // MOCK MODE — zwraca ACTIVE bez wywołania zewnętrznego API
  await delay(100 + Math.random() * 200);
  return { status: PlatformStatus.ACTIVE };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
