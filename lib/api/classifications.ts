import { api } from "./client";
import {
  type ClassificationResponse,
  classificationResponseSchema,
} from "../schemas/classification";

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
