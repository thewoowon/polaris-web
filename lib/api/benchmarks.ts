import { api } from "./client";

export type AppBenchmark = {
  id: string;
  target_app_id: string;
  competitor_app_ids: string[];
  period_start: string;
  period_end: string;
  metrics: Record<string, unknown>;
  comparison_summary: string;
  created_at: string;
  updated_at: string;
};

export type BenchmarkRequest = {
  target_app_id: string;
  competitor_app_ids: string[];
  period_start: string;
  period_end: string;
};

export const benchmarksApi = {
  list: (params?: { target_app_id?: string }) =>
    api.get<AppBenchmark[]>("/api/v1/benchmarks", { query: params }),

  get: (id: string) =>
    api.get<AppBenchmark>(`/api/v1/benchmarks/${id}`),

  create: (body: BenchmarkRequest) =>
    api.post<AppBenchmark>("/api/v1/benchmarks", body),
};
