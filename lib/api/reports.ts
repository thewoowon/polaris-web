import { api } from "./client";

export type ReportType =
  | "company_app_review"
  | "competitive_benchmark"
  | "monthly_voc"
  | "sales_outbound";

export type ReportStatus = "draft" | "reviewed" | "exported" | "sent";

export type Report = {
  id: string;
  company_id: string;
  company_name: string | null;
  app_id: string | null;
  app_name: string | null;
  report_type: ReportType;
  title: string;
  period_start: string;
  period_end: string;
  markdown_content: string;
  executive_summary: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
};

export type ReportPage = {
  items: Report[];
  total: number;
  limit: number;
  offset: number;
};

export type ReportGenerateRequest = {
  company_id: string;
  app_id: string;
  report_type?: ReportType;
  period_start: string;
  period_end: string;
  include_benchmark?: boolean;
  competitor_app_ids?: string[];
};

export const reportsApi = {
  list: (params?: { company_id?: string; limit?: number; offset?: number }) =>
    api.get<ReportPage>("/api/v1/reports", { query: params }),

  get: (id: string) =>
    api.get<Report>(`/api/v1/reports/${id}`),

  generate: (body: ReportGenerateRequest) =>
    api.post<Report>("/api/v1/reports/generate", body),

  updateStatus: (id: string, status: ReportStatus) =>
    api.patch<Report>(`/api/v1/reports/${id}`, { status }),

  exportMarkdown: (id: string) =>
    api.post<{ markdown: string; title: string }>(`/api/v1/reports/${id}/export-markdown`),
};
