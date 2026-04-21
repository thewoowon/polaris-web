import { z } from "zod";

export const pageSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  });

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};
