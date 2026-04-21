import { z } from "zod";

import { api } from "./client";
import {
  type ReviewDetailResponse,
  type ReviewIngest,
  type ReviewResponse,
  reviewDetailResponseSchema,
  reviewPageSchema,
  reviewResponseSchema,
} from "../schemas/review";
import { type Page } from "../schemas/common";

export function listReviews(
  params: { limit?: number; offset?: number } = {},
): Promise<Page<ReviewResponse>> {
  return api.get("/api/v1/reviews", {
    query: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
    schema: reviewPageSchema,
  });
}

export function getReview(id: number): Promise<ReviewDetailResponse> {
  return api.get(`/api/v1/reviews/${id}`, { schema: reviewDetailResponseSchema });
}

export function ingestReview(payload: ReviewIngest): Promise<ReviewResponse> {
  return api.post("/api/v1/reviews/ingest", payload, { schema: reviewResponseSchema });
}

export function bulkIngestReviews(payload: { reviews: ReviewIngest[] }) {
  return api.post("/api/v1/reviews/bulk-ingest", payload, {
    schema: z.array(reviewResponseSchema),
  });
}
