import { api } from "./client";
import {
  type ClassificationResponse,
  classificationResponseSchema,
} from "../schemas/classification";
import type { ReviewCategory } from "../schemas/enums";

export function classifyReview(reviewId: number): Promise<ClassificationResponse> {
  return api.post(`/api/v1/classify/${reviewId}`, undefined, {
    schema: classificationResponseSchema,
  });
}

export function getClassification(reviewId: number): Promise<ClassificationResponse> {
  return api.get(`/api/v1/classifications/${reviewId}`, {
    schema: classificationResponseSchema,
  });
}

export function clarifyClassification(
  reviewId: number,
  payload: { categories: ReviewCategory[]; reason?: string | null },
): Promise<ClassificationResponse> {
  return api.post(`/api/v1/classify/${reviewId}/clarify`, payload, {
    schema: classificationResponseSchema,
  });
}
