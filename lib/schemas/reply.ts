import { z } from "zod";

import { replyStatusSchema, replyToneSchema } from "./enums";

export const replyDraftResponseSchema = z.object({
  id: z.number().int(),
  review_id: z.number().int(),
  tone: replyToneSchema,
  template_id: z.string().nullable(),
  grounded_sources: z.array(z.string()).nullable(),
  generated_text: z.string(),
  requires_human_approval: z.boolean(),
  model_version: z.string().nullable(),
  status: replyStatusSchema,
  approved_by: z.number().int().nullable(),
  approved_at: z.string().nullable(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ReplyDraftResponse = z.infer<typeof replyDraftResponseSchema>;

export const replyGenerateRequestSchema = z.object({
  tone: replyToneSchema.optional(),
  template_id: z.string().nullable().optional(),
  ground_with_kb: z.boolean().optional(),
});
export type ReplyGenerateRequest = z.infer<typeof replyGenerateRequestSchema>;
