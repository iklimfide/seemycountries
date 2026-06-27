import { z } from "zod";
import { LIMITS } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(LIMITS.usernameMin, `Username must be at least ${LIMITS.usernameMin} characters`)
    .max(LIMITS.usernameMax, `Username must be at most ${LIMITS.usernameMax} characters`)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
