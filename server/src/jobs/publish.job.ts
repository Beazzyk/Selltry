// BullMQ removed — publishing is now synchronous in listing.controller.ts
export function startPublishWorker(): void {}
export async function enqueuePublish(_data: unknown): Promise<void> {}
