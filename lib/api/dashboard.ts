import { z } from "zod";

import { api } from "./client";
import {
  type CategoryBreakdown,
  type DashboardSummary,
  type HighRiskItem,
  type TrendPoint,
  categoryBreakdownSchema,
  dashboardSummarySchema,
  highRiskItemSchema,
  trendPointSchema,
} from "../schemas/dashboard";

export function getSummary(): Promise<DashboardSummary> {
  return api.get("/api/v1/dashboard/summary", { schema: dashboardSummarySchema });
}

export function getTrends(days = 14): Promise<TrendPoint[]> {
  return api.get("/api/v1/dashboard/trends", {
    query: { days },
    schema: z.array(trendPointSchema),
  });
}

export function getCategories(): Promise<CategoryBreakdown[]> {
  return api.get("/api/v1/dashboard/categories", {
    schema: z.array(categoryBreakdownSchema),
  });
}

export function getHighRisk(limit = 20): Promise<HighRiskItem[]> {
  return api.get("/api/v1/dashboard/high-risk", {
    query: { limit },
    schema: z.array(highRiskItemSchema),
  });
}
