import { Queue, Worker, Job } from 'bullmq';
import { getRedis } from '../utils/redis';
import { executePublish, PublishJobData } from '../services/listing-publish.service';

const QUEUE_NAME = 'publish';

let publishQueue: Queue | null = null;

function getQueue(): Queue {
  if (!publishQueue) {
    publishQueue = new Queue(QUEUE_NAME, { connection: getRedis() });
  }
  return publishQueue;
}

export async function enqueuePublish(data: PublishJobData): Promise<void> {
  await getQueue().add('publish-listing', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  });
}

export function startPublishWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job<PublishJobData>) => {
      console.log(`[PublishWorker] Job ${job.id} — listing ${job.data.listingId}`);
      await executePublish(job.data);
    },
    { connection: getRedis(), concurrency: 5 },
  );

  worker.on('completed', (job) => {
    console.log(`[PublishWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[PublishWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
