import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { isValidInstagramUrl } from "@/lib/utils/instagram";

const cityFields = {
  city_name: z.string().min(1, "City name is required").max(100),
  country_code: z.string().length(2, "Invalid country code"),
  country_name: z.string().min(1, "Country name is required"),
  note: z
    .string()
    .max(LIMITS.noteMaxLength, `Note must be at most ${LIMITS.noteMaxLength} characters`)
    .optional()
    .nullable(),
  media_type: z.enum(["photo", "instagram"]).optional().nullable(),
  media_url: z.string().optional().nullable(),
};

const mediaRefine = {
  check: (data: {
    media_type?: "photo" | "instagram" | null;
    media_url?: string | null;
  }) => {
    if (!data.media_type) return true;
    if (!data.media_url) return false;
    if (data.media_type === "instagram") return isValidInstagramUrl(data.media_url);
    try {
      new URL(data.media_url);
      return true;
    } catch {
      return false;
    }
  },
  message: "Valid media URL required for selected media type",
} as const;

/** Client payload — coordinates are resolved on the server. */
export const cityInputSchema = z
  .object(cityFields)
  .refine(mediaRefine.check, { message: mediaRefine.message });

export const citySchema = cityInputSchema.extend({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CityInput = z.infer<typeof cityInputSchema>;
