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
import type {
  PolicyAction,
  ReviewCategory,
  ReviewSource,
  Sentiment,
} from "../schemas/enums";

export type ListReviewsParams = {
  limit?: number;
  offset?: number;
  source?: ReviewSource | null;
  sentiment?: Sentiment | null;
  action?: PolicyAction | null;
  category?: ReviewCategory | null;
  rating_min?: number | null;
  q?: string | null;
};

export function listReviews(
  params: ListReviewsParams = {},
): Promise<Page<ReviewResponse>> {
  return api.get("/api/v1/reviews", {
    query: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      source: params.source ?? undefined,
      sentiment: params.sentiment ?? undefined,
      action: params.action ?? undefined,
      category: params.category ?? undefined,
      rating_min: params.rating_min ?? undefined,
      q: params.q ?? undefined,
    },
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
