import { z } from "zod";

import { policyActionSchema } from "./enums";

export const policyDecisionResponseSchema = z.object({
  id: z.number().int(),
  review_id: z.number().int(),
  action: policyActionSchema,
  risk_score: z.number().min(0).max(1),
  reason_codes: z.array(z.string()),
  policy_version: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PolicyDecisionResponse = z.infer<typeof policyDecisionResponseSchema>;
