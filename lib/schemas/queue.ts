import { z } from "zod";

import { pageSchema } from "./common";
import { policyActionSchema, replyStatusSchema, reviewSourceSchema } from "./enums";

export const queueItemSchema = z.object({
  review_id: z.number().int(),
  source: reviewSourceSchema,
  rating: z.number().int().nullable(),
  snippet: z.string(),
  created_at: z.string(),
  ingested_at: z.string(),
  category: z.string().nullable(),
  action: policyActionSchema,
  risk_score: z.number(),
  reason_codes: z.array(z.string()),
  draft_status: replyStatusSchema.nullable(),
});
export type QueueItem = z.infer<typeof queueItemSchema>;

export const queuePageSchema = pageSchema(queueItemSchema);
