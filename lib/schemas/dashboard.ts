import { z } from "zod";

export const dashboardSummarySchema = z.object({
  total_reviews: z.number().int(),
  negative_ratio: z.number(),
  auto_reply_rate: z.number(),
  human_review_rate: z.number(),
  high_risk_count: z.number().int(),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export const trendPointSchema = z.object({
  day: z.string(),
  total: z.number().int(),
  negative: z.number().int(),
});
export type TrendPoint = z.infer<typeof trendPointSchema>;

export const categoryBreakdownSchema = z.object({
  category: z.string(),
  count: z.number().int(),
  share: z.number(),
});
export type CategoryBreakdown = z.infer<typeof categoryBreakdownSchema>;

export const highRiskItemSchema = z.object({
  review_id: z.number().int(),
  action: z.string(),
  risk_score: z.number(),
  category: z.string(),
  created_at: z.string(),
});
export type HighRiskItem = z.infer<typeof highRiskItemSchema>;
