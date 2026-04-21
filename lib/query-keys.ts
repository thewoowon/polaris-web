export const qk = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    trends: (days: number) => ["dashboard", "trends", { days }] as const,
    categories: ["dashboard", "categories"] as const,
    highRisk: (limit: number) => ["dashboard", "high-risk", { limit }] as const,
  },
  reviews: {
    list: (params: { limit: number; offset: number }) => ["reviews", "list", params] as const,
    detail: (id: number) => ["reviews", "detail", id] as const,
  },
  queue: {
    list: (params: { limit: number; offset: number }) => ["queue", "list", params] as const,
  },
  kb: {
    list: (params: Record<string, unknown>) => ["kb", "list", params] as const,
    detail: (id: number) => ["kb", "detail", id] as const,
  },
} as const;
