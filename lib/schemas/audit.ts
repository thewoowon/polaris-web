import { z } from "zod";

import { pageSchema } from "./common";

export const auditLogSchema = z.object({
  id: z.number().int(),
  entity_type: z.string(),
  entity_id: z.number().int().nullable(),
  action: z.string(),
  actor: z.string(),
  before: z.record(z.string(), z.unknown()).nullable(),
  after: z.record(z.string(), z.unknown()).nullable(),
  reason: z.string().nullable(),
  created_at: z.string(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

export const auditPageSchema = pageSchema(auditLogSchema);
