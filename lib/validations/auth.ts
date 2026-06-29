import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { usernameSchema } from "@/lib/validations/username";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(LIMITS.passwordMin, `Password must be at least ${LIMITS.passwordMin} characters`),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email("Invalid email address"),
  password: z.string().min(LIMITS.passwordMin, `Password must be at least ${LIMITS.passwordMin} characters`),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
