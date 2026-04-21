import { z } from "zod";

import { api } from "./client";
import { type Page } from "../schemas/common";
import { type DocType, docTypeSchema } from "../schemas/enums";
import {
  type KbDocumentCreate,
  type KbDocumentResponse,
  kbDocumentPageSchema,
  kbDocumentResponseSchema,
} from "../schemas/kb";

const searchHitSchema = z.object({
  document_id: z.number().int(),
  chunk_id: z.number().int().nullable(),
  title: z.string(),
  doc_type: docTypeSchema,
  score: z.number(),
  snippet: z.string(),
});
export type KbSearchHit = z.infer<typeof searchHitSchema>;

export type ListDocumentsParams = {
  limit?: number;
  offset?: number;
  doc_type?: DocType | null;
  q?: string | null;
  active?: boolean | null;
};

export function listDocuments(
  params: ListDocumentsParams = {},
): Promise<Page<KbDocumentResponse>> {
  return api.get("/api/v1/kb/documents", {
    query: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      doc_type: params.doc_type ?? undefined,
      q: params.q ?? undefined,
      active: params.active ?? undefined,
    },
    schema: kbDocumentPageSchema,
  });
}

export function getDocument(id: number): Promise<KbDocumentResponse> {
  return api.get(`/api/v1/kb/documents/${id}`, { schema: kbDocumentResponseSchema });
}

export function createDocument(payload: KbDocumentCreate): Promise<KbDocumentResponse> {
  return api.post("/api/v1/kb/documents", payload, { schema: kbDocumentResponseSchema });
}

export type KbDocumentUpdate = {
  title?: string;
  doc_type?: DocType;
  content?: string;
  tags?: string[];
  active?: boolean;
};

export function updateDocument(
  id: number,
  payload: KbDocumentUpdate,
): Promise<KbDocumentResponse> {
  return api.put(`/api/v1/kb/documents/${id}`, payload, {
    schema: kbDocumentResponseSchema,
  });
}

export function deleteDocument(id: number): Promise<void> {
  return api.delete(`/api/v1/kb/documents/${id}`) as Promise<void>;
}

export function searchKb(payload: {
  query: string;
  top_k?: number;
  doc_types?: DocType[];
}): Promise<KbSearchHit[]> {
  return api.post("/api/v1/kb/search", payload, { schema: z.array(searchHitSchema) });
}
