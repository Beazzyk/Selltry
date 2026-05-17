import { startPublishWorker } from './publish.job';
import { startCategorySyncWorker } from './category-sync.job';

export function startWorkers(): void {
  try {
    startPublishWorker();
    console.log('[Jobs] Publish worker started');
    startCategorySyncWorker();
    console.log('[Jobs] Category sync worker started');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Jobs] Worker start failed (Redis unavailable?):', message);
  }
}
