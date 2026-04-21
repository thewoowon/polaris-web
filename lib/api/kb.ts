import { z } from "zod";

import { api } from "./client";
import {
  type KbDocumentCreate,
  type KbDocumentResponse,
  kbDocumentPageSchema,
  kbDocumentResponseSchema,
} from "../schemas/kb";
import { type Page } from "../schemas/common";
import { type DocType, docTypeSchema } from "../schemas/enums";

const searchHitSchema = z.object({
  document_id: z.number().int(),
  chunk_id: z.number().int().nullable(),
  title: z.string(),
  doc_type: docTypeSchema,
  score: z.number(),
  snippet: z.string(),
});
export type KbSearchHit = z.infer<typeof searchHitSchema>;

export function listDocuments(
  params: { limit?: number; offset?: number } = {},
): Promise<Page<KbDocumentResponse>> {
  return api.get("/api/v1/kb/documents", {
    query: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
    schema: kbDocumentPageSchema,
  });
}

export function createDocument(payload: KbDocumentCreate): Promise<KbDocumentResponse> {
  return api.post("/api/v1/kb/documents", payload, { schema: kbDocumentResponseSchema });
}

export function searchKb(payload: {
  query: string;
  top_k?: number;
  doc_types?: DocType[];
}): Promise<KbSearchHit[]> {
  return api.post("/api/v1/kb/search", payload, { schema: z.array(searchHitSchema) });
}
