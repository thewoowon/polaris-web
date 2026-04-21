import { api } from "./client";
import { type AuditLog, auditPageSchema } from "../schemas/audit";
import { type Page } from "../schemas/common";

export type ListAuditParams = {
  limit?: number;
  offset?: number;
  entity_type?: string | null;
  entity_id?: number | null;
  action?: string | null;
  actor?: string | null;
};

export function listAudit(params: ListAuditParams = {}): Promise<Page<AuditLog>> {
  return api.get("/api/v1/audit", {
    query: {
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      entity_type: params.entity_type ?? undefined,
      entity_id: params.entity_id ?? undefined,
      action: params.action ?? undefined,
      actor: params.actor ?? undefined,
    },
    schema: auditPageSchema,
  });
}
