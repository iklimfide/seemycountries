import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { MARITAL_STATUS_OPTIONS, PROFESSION_OPTIONS } from "@/lib/data/profile-options";

const professionValues = PROFESSION_OPTIONS.map((o) => o.value);
const maritalValues = MARITAL_STATUS_OPTIONS.map((o) => o.value);

export const profileSettingsSchema = z
  .object({
    wishlist_public: z.boolean().optional(),
    display_name: z
      .string()
      .max(LIMITS.displayNameMaxLength)
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    bio: z
      .string()
      .max(LIMITS.bioMaxLength)
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    residence: z
      .string()
      .max(LIMITS.residenceMaxLength)
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    profession: z.enum(professionValues as [string, ...string[]]).nullable().optional(),
    marital_status: z.enum(maritalValues as [string, ...string[]]).nullable().optional(),
    avatar_url: z.string().url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update",
  });

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

export const PROFILE_SELECT =
  "username, display_name, avatar_url, bio, residence, profession, marital_status, wishlist_public";
