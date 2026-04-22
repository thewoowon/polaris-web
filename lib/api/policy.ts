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

const rulesRawSchema = z.object({
  path: z.string(),
  yaml: z.string(),
});
export type PolicyRulesRaw = z.infer<typeof rulesRawSchema>;

export function getPolicyRulesRaw(): Promise<PolicyRulesRaw> {
  return api.get("/api/v1/policy/rules/raw", { schema: rulesRawSchema });
}

const rulesValidationSchema = z.object({
  ok: z.boolean(),
  rule_count: z.number().int(),
  version: z.string().nullable().optional(),
});
export type PolicyRulesValidation = z.infer<typeof rulesValidationSchema>;

export function validatePolicyRules(yaml: string): Promise<PolicyRulesValidation> {
  return api.post("/api/v1/policy/rules/validate", { yaml }, { schema: rulesValidationSchema });
}

export function savePolicyRules(yaml: string): Promise<PolicyRulesValidation> {
  return api.put("/api/v1/policy/rules/raw", { yaml }, { schema: rulesValidationSchema });
}
