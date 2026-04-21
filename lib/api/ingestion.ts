import { api } from "./client";
import {
  type IngestionStatus,
  type IngestionTick,
  ingestionStatusSchema,
  ingestionTickSchema,
} from "../schemas/ingestion";

export function getIngestionStatus(): Promise<IngestionStatus> {
  return api.get("/api/v1/ingestion/status", { schema: ingestionStatusSchema });
}

export function runIngestionOnce(): Promise<IngestionTick> {
  return api.post("/api/v1/ingestion/run", undefined, { schema: ingestionTickSchema });
}

export function startIngestion(): Promise<IngestionStatus> {
  return api.post("/api/v1/ingestion/start", undefined, { schema: ingestionStatusSchema });
}

export function stopIngestion(): Promise<IngestionStatus> {
  return api.post("/api/v1/ingestion/stop", undefined, { schema: ingestionStatusSchema });
}
