import { Queue, Worker, Job } from 'bullmq';
import { Platform } from '@prisma/client';
import { getRedis } from '../utils/redis';
import { executeSync } from '../services/platform-category.service';

const QUEUE_NAME = 'category-sync';

export interface CategorySyncJobData {
  platform: Platform;
  userId: string;
}

let syncQueue: Queue | null = null;

function getQueue(): Queue {
  if (!syncQueue) {
    syncQueue = new Queue(QUEUE_NAME, { connection: getRedis() });
  }
  return syncQueue;
}

export async function enqueueCategorySync(data: CategorySyncJobData): Promise<{ jobId: string }> {
  const job = await getQueue().add('sync-categories', data, {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { count: 20 },
    removeOnFail: { count: 10 },
    jobId: `${data.platform}-${data.userId}`, // deduplikacja — jeden job per user/platforma
  });
  return { jobId: job.id as string };
}

export async function getCategorySyncJobStatus(jobId: string): Promise<{
  status: string;
  progress?: number;
  result?: unknown;
  error?: string;
}> {
  const queue = getQueue();
  const job = await queue.getJob(jobId);
  if (!job) return { status: 'not_found' };

  const state = await job.getState();
  return {
    status: state,
    progress: typeof job.progress === 'number' ? job.progress : undefined,
    result: job.returnvalue ?? undefined,
    error: job.failedReason ?? undefined,
  };
}

export function startCategorySyncWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job<CategorySyncJobData>) => {
      const { platform, userId } = job.data;
      console.log(`[CategorySyncWorker] Starting ${platform} sync for user ${userId}`);
      const result = await executeSync(platform, userId);
      console.log(`[CategorySyncWorker] Done — ${result.upserted} categories upserted for ${platform}`);
      return result;
    },
    { connection: getRedis(), concurrency: 2 },
  );

  worker.on('completed', (job) =>
    console.log(`[CategorySyncWorker] Job ${job.id} completed`),
  );
  worker.on('failed', (job, err) =>
    console.error(`[CategorySyncWorker] Job ${job?.id} failed:`, err.message),
  );

  return worker;
}
