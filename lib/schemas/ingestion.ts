import { z } from "zod";

const tickStatsSchema = z.object({
  ran_at: z.string(),
  total: z.number().int(),
  per_source: z.record(z.string(), z.number().int()),
  errors: z.array(z.object({ source: z.string(), error: z.string() })),
});

export const ingestionStatusSchema = z.object({
  running: z.boolean(),
  sources: z.array(z.string()),
  interval_sec: z.number().int(),
  started_at: z.string().nullable(),
  last_run_at: z.string().nullable(),
  last_stats: tickStatsSchema.nullable(),
  total_ingested: z.number().int(),
  error_count: z.number().int(),
});
export type IngestionStatus = z.infer<typeof ingestionStatusSchema>;

export const ingestionTickSchema = tickStatsSchema;
export type IngestionTick = z.infer<typeof ingestionTickSchema>;
