import { z } from "zod";

export const userPublicSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["admin", "reviewer", "operator"]),
  is_active: z.boolean(),
});
export type UserPublic = z.infer<typeof userPublicSchema>;

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  user: userPublicSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
