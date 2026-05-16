import { api } from "./client";

export type Platform = "ios" | "android" | "both";

export type AppProfile = {
  id: string;
  company_id: string;
  company_name: string | null;
  app_name: string;
  platform: Platform;
  app_store_id: string | null;
  play_store_package: string | null;
  category: string | null;
  country: string;
  is_target: boolean;
  is_competitor: boolean;
  review_count: number;
  average_rating: number | null;
  negative_ratio: number | null;
  created_at: string;
  updated_at: string;
};

export type AppCreate = {
  company_id: string;
  app_name: string;
  platform: Platform;
  app_store_id?: string;
  play_store_package?: string;
  category?: string;
  is_target?: boolean;
  is_competitor?: boolean;
};

export type AppPage = {
  items: AppProfile[];
  total: number;
  limit: number;
  offset: number;
};

export type AppSummary = {
  app_id: string;
  total_reviews: number;
  average_rating: number | null;
  negative_ratio: number;
  critical_count: number;
  recent_7d_count: number;
  first_review_at: string | null;
  last_review_at: string | null;
  rating_distribution: Record<string, number>;
  top_categories: Array<{ category: string; count: number }>;
  sentiment_distribution: Record<string, number>;
};

export type Trend = {
  date: string;
  count: number;
  avg_rating: number | null;
  negative_ratio: number;
};

export type ReviewCluster = {
  id: string;
  app_id: string;
  title: string;
  summary: string;
  issue_type: string;
  review_count: number;
  negative_ratio: number;
  average_rating: number | null;
  severity: "low" | "medium" | "high" | "critical";
  representative_review_ids: string[];
  created_at: string;
};

export type Insight = {
  id: string;
  app_id: string;
  company_id: string;
  insight_type: string;
  title: string;
  summary: string;
  evidence_review_ids: string[];
  severity: "low" | "medium" | "high" | "critical";
  business_impact: string;
  recommended_action: string;
  created_at: string;
};

export const appsApi = {
  list: (params?: { company_id?: string; limit?: number; offset?: number }) =>
    api.get<AppPage>("/api/v1/apps", { query: params }),

  get: (id: string) =>
    api.get<AppProfile>(`/api/v1/apps/${id}`),

  create: (body: AppCreate) =>
    api.post<AppProfile>("/api/v1/apps", body),

  update: (id: string, body: Partial<AppCreate>) =>
    api.put<AppProfile>(`/api/v1/apps/${id}`, body),

  delete: (id: string) =>
    api.delete<void>(`/api/v1/apps/${id}`),

  mockIngest: (id: string, count = 100) =>
    api.post<{ created: number; app_id: string }>(
      `/api/v1/apps/${id}/ingest/mock`,
      undefined,
      { query: { count } },
    ),

  summary: (id: string) =>
    api.get<AppSummary>(`/api/v1/apps/${id}/summary`),

  trends: (id: string, days = 30) =>
    api.get<{ app_id: string; period_days: number; daily: Trend[] }>(
      `/api/v1/apps/${id}/trends`,
      { query: { days } },
    ),

  cluster: (id: string) =>
    api.post<ReviewCluster[]>(`/api/v1/apps/${id}/cluster`),

  clusters: (id: string) =>
    api.get<ReviewCluster[]>(`/api/v1/apps/${id}/clusters`),

  generateInsights: (id: string) =>
    api.post<Insight[]>(`/api/v1/apps/${id}/insights`),

  insights: (id: string) =>
    api.get<Insight[]>(`/api/v1/apps/${id}/insights`),
};
