import { api } from "./client";
import {
  type ReplyDraftResponse,
  type ReplyGenerateRequest,
  replyDraftResponseSchema,
} from "../schemas/reply";

export function generateReply(
  reviewId: number,
  payload?: ReplyGenerateRequest,
): Promise<ReplyDraftResponse> {
  return api.post(`/api/v1/replies/generate/${reviewId}`, payload ?? {}, {
    schema: replyDraftResponseSchema,
  });
}

export function regenerateReply(
  reviewId: number,
  payload?: ReplyGenerateRequest,
): Promise<ReplyDraftResponse> {
  return api.post(`/api/v1/replies/regenerate/${reviewId}`, payload ?? {}, {
    schema: replyDraftResponseSchema,
  });
}

export function approveReply(
  reviewId: number,
  editedText?: string,
): Promise<ReplyDraftResponse> {
  return api.post(
    `/api/v1/replies/${reviewId}/approve`,
    { edited_text: editedText ?? null },
    { schema: replyDraftResponseSchema },
  );
}

export function rejectReply(
  reviewId: number,
  reason: string,
): Promise<ReplyDraftResponse> {
  return api.post(
    `/api/v1/replies/${reviewId}/reject`,
    { reason },
    { schema: replyDraftResponseSchema },
  );
}

export function publishReply(reviewId: number): Promise<ReplyDraftResponse> {
  return api.post(`/api/v1/replies/${reviewId}/publish`, undefined, {
    schema: replyDraftResponseSchema,
  });
}
