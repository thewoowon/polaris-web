import { z } from "zod";

import { reviewCategorySchema, sentimentSchema, urgencySchema } from "./enums";

export const topCandidateSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(1),
});

export const classificationResponseSchema = z.object({
  id: z.number().int(),
  review_id: z.number().int(),
  categories: z.array(z.string()),
  sentiment: sentimentSchema,
  urgency: urgencySchema,
  confidence: z.number().min(0).max(1),
  entropy: z.number().nullable(),
  ambiguity_score: z.number().nullable(),
  top_candidates: z.array(topCandidateSchema.partial().passthrough()).nullable(),
  needs_clarification: z.boolean(),
  out_of_distribution: z.boolean(),
  model_version: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ClassificationResponse = z.infer<typeof classificationResponseSchema>;

export const classificationPayloadSchema = z.object({
  categories: z.array(reviewCategorySchema),
  sentiment: sentimentSchema,
  urgency: urgencySchema,
  confidence: z.number().min(0).max(1),
  entropy: z.number().nullable().optional(),
  ambiguity_score: z.number().nullable().optional(),
  top_candidates: z.array(topCandidateSchema).nullable().optional(),
  needs_clarification: z.boolean().default(false),
  out_of_distribution: z.boolean().default(false),
  model_version: z.string(),
});
export type ClassificationPayload = z.infer<typeof classificationPayloadSchema>;

export const shadowCompareResponseSchema = z.object({
  stub: classificationPayloadSchema,
  llm: classificationPayloadSchema.nullable(),
  llm_error: z.string().nullable(),
});
export type ShadowCompareResponse = z.infer<typeof shadowCompareResponseSchema>;
