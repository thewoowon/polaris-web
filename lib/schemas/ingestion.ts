import { z } from "zod";

const tickStatsSchema = z.object({
  ran_at: z.string(),
  total: z.number().int(),
  classified: z.number().int().default(0),
  dedup_skipped: z.number().int().default(0),
  per_source: z.record(z.string(), z.number().int()),
  fetch_errors: z
    .array(z.object({ source: z.string(), error: z.string() }))
    .default([]),
  pipeline_errors: z
    .array(z.object({ review_id: z.string(), source: z.string() }))
    .default([]),
});

export const ingestionStatusSchema = z.object({
  running: z.boolean(),
  sources: z.array(z.string()),
  interval_sec: z.number().int(),
  started_at: z.string().nullable(),
  last_run_at: z.string().nullable(),
  last_stats: tickStatsSchema.nullable(),
  total_ingested: z.number().int(),
  total_classified: z.number().int().default(0),
  error_count: z.number().int(),
  auto_pipeline: z.boolean().default(false),
  auto_classifier: z.string().nullable(),
});
export type IngestionStatus = z.infer<typeof ingestionStatusSchema>;

export const ingestionTickSchema = tickStatsSchema;
export type IngestionTick = z.infer<typeof ingestionTickSchema>;
