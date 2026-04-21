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
