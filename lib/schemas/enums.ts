import { z } from "zod";

export const reviewSourceSchema = z.enum(["google_play", "app_store", "internal"]);
export type ReviewSource = z.infer<typeof reviewSourceSchema>;

export const reviewCategorySchema = z.enum([
  "bug",
  "payment",
  "refund",
  "performance",
  "login_account",
  "ux_ui",
  "feature_request",
  "policy_inquiry",
  "complaint",
  "praise",
  "spam",
  "other",
]);
export type ReviewCategory = z.infer<typeof reviewCategorySchema>;

export const sentimentSchema = z.enum(["positive", "neutral", "negative"]);
export type Sentiment = z.infer<typeof sentimentSchema>;

export const urgencySchema = z.enum(["low", "medium", "high", "critical"]);
export type Urgency = z.infer<typeof urgencySchema>;

export const policyActionSchema = z.enum([
  "auto_reply",
  "draft_reply",
  "request_clarification",
  "route_to_human",
  "create_issue",
  "ignore",
]);
export type PolicyAction = z.infer<typeof policyActionSchema>;

export const replyToneSchema = z.enum(["formal", "empathetic", "brief"]);
export type ReplyTone = z.infer<typeof replyToneSchema>;

export const replyStatusSchema = z.enum(["pending", "approved", "rejected", "published"]);
export type ReplyStatus = z.infer<typeof replyStatusSchema>;

export const docTypeSchema = z.enum([
  "faq",
  "release_note",
  "announcement",
  "incident_response",
  "cs_policy",
  "forbidden_expression",
]);
export type DocType = z.infer<typeof docTypeSchema>;
