import { z } from "zod";

import { classificationResponseSchema } from "./classification";
import { pageSchema } from "./common";
import { reviewSourceSchema } from "./enums";
import { policyDecisionResponseSchema } from "./policy";
import { replyDraftResponseSchema } from "./reply";

export const reviewResponseSchema = z.object({
  id: z.number().int(),
  source: reviewSourceSchema,
  source_review_id: z.string().nullable(),
  app_version: z.string().nullable(),
  os: z.string().nullable(),
  locale: z.string().nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  author_name: z.string().nullable(),
  raw_text: z.string(),
  normalized_text: z.string(),
  ingested_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  extra: z.record(z.string(), z.unknown()).default({}),
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

export const reviewDetailResponseSchema = reviewResponseSchema.extend({
  classification: classificationResponseSchema.nullable().default(null),
  policy_decision: policyDecisionResponseSchema.nullable().default(null),
  reply_draft: replyDraftResponseSchema.nullable().default(null),
});
export type ReviewDetailResponse = z.infer<typeof reviewDetailResponseSchema>;

export const reviewIngestSchema = z.object({
  source: reviewSourceSchema,
  source_review_id: z.string().nullable().optional(),
  app_version: z.string().nullable().optional(),
  os: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  author_name: z.string().nullable().optional(),
  raw_text: z.string(),
  normalized_text: z.string().nullable().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});
export type ReviewIngest = z.infer<typeof reviewIngestSchema>;

export const reviewPageSchema = pageSchema(reviewResponseSchema);
