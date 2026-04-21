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
  kb: {
    list: (params: { limit: number; offset: number }) => ["kb", "list", params] as const,
  },
} as const;
