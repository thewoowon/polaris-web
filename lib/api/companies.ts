import { api } from "./client";

export type Industry =
  | "finance" | "fintech" | "commerce" | "delivery" | "public"
  | "education" | "mobility" | "entertainment" | "other";

export type Company = {
  id: string;
  name: string;
  industry: Industry;
  homepage_url: string | null;
  contact_email: string | null;
  memo: string | null;
  app_count: number;
  created_at: string;
  updated_at: string;
};

export type CompanyCreate = {
  name: string;
  industry: Industry;
  homepage_url?: string;
  contact_email?: string;
  memo?: string;
};

export type CompanyPage = {
  items: Company[];
  total: number;
  limit: number;
  offset: number;
};

export const companiesApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<CompanyPage>("/api/v1/companies", { query: params }),

  get: (id: string) =>
    api.get<Company>(`/api/v1/companies/${id}`),

  create: (body: CompanyCreate) =>
    api.post<Company>("/api/v1/companies", body),

  update: (id: string, body: Partial<CompanyCreate>) =>
    api.put<Company>(`/api/v1/companies/${id}`, body),

  delete: (id: string) =>
    api.delete<void>(`/api/v1/companies/${id}`),
};
