import { z } from "zod";

import { api } from "./client";
import {
  type PolicyDecisionResponse,
  policyDecisionResponseSchema,
} from "../schemas/policy";

export function evaluatePolicy(reviewId: number): Promise<PolicyDecisionResponse> {
  return api.post(`/api/v1/policy/evaluate/${reviewId}`, undefined, {
    schema: policyDecisionResponseSchema,
  });
}

export function getPolicyDecision(reviewId: number): Promise<PolicyDecisionResponse> {
  return api.get(`/api/v1/policy/decisions/${reviewId}`, {
    schema: policyDecisionResponseSchema,
  });
}

const policyRulesDocSchema = z.object({
  version: z.string(),
  rules: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      risk: z.number(),
      reasons: z.array(z.string()).optional(),
      when: z.unknown(),
    }),
  ),
});

export type PolicyRulesDoc = z.infer<typeof policyRulesDocSchema>;

export function getPolicyRules(): Promise<PolicyRulesDoc> {
  return api.get("/api/v1/policy/rules", { schema: policyRulesDocSchema });
}
