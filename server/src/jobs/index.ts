import { startPublishWorker } from './publish.job';

export function startWorkers(): void {
  try {
    startPublishWorker();
    console.log('[Jobs] Publish worker started');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Jobs] Worker start failed (Redis unavailable?):', message);
  }
}
