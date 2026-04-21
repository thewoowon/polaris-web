import { api } from "./client";
import { type Page } from "../schemas/common";
import { type QueueItem, queuePageSchema } from "../schemas/queue";

export function listQueue(
  params: { limit?: number; offset?: number } = {},
): Promise<Page<QueueItem>> {
  return api.get("/api/v1/queue", {
    query: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
    schema: queuePageSchema,
  });
}
