import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { isReservedUsername } from "@/lib/constants/reserved-usernames";

export const usernameSchema = z
  .string()
  .min(LIMITS.usernameMin, `Username must be at least ${LIMITS.usernameMin} characters`)
  .max(LIMITS.usernameMax, `Username must be at most ${LIMITS.usernameMax} characters`)
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores")
  .refine((value) => !isReservedUsername(value), "This username is not available");

export type UsernameUnavailableReason = "invalid" | "reserved" | "taken";

export function getUsernameUnavailableReason(
  username: string
): UsernameUnavailableReason | null {
  const normalized = username.toLowerCase().trim();
  if (normalized.length < LIMITS.usernameMin) return "invalid";
  if (normalized.length > LIMITS.usernameMax) return "invalid";
  if (!/^[a-z0-9_]+$/.test(normalized)) return "invalid";
  if (isReservedUsername(normalized)) return "reserved";
  return null;
}
