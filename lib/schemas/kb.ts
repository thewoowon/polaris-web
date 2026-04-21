import { z } from "zod";

import { pageSchema } from "./common";
import { docTypeSchema } from "./enums";

export const kbDocumentResponseSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  doc_type: docTypeSchema,
  tags: z.array(z.string()),
  content: z.string(),
  version: z.number().int(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type KbDocumentResponse = z.infer<typeof kbDocumentResponseSchema>;

export const kbDocumentPageSchema = pageSchema(kbDocumentResponseSchema);

export const kbDocumentCreateSchema = z.object({
  title: z.string().min(1),
  doc_type: docTypeSchema,
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});
export type KbDocumentCreate = z.infer<typeof kbDocumentCreateSchema>;
