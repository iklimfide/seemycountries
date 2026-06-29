import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { formatCityDisplayName } from "@/lib/utils/city-name";
import { isValidInstagramUrl } from "@/lib/utils/instagram";
import { PARK_TYPES } from "@/types/database";

const parkTypeSchema = z.enum(PARK_TYPES);

const parkFields = {
  park_name: z
    .string()
    .min(1, "Park name is required")
    .max(100)
    .transform(formatCityDisplayName),
  park_type: parkTypeSchema,
  country_code: z.string().length(2, "Invalid country code"),
  country_name: z.string().min(1, "Country name is required"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
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

export const parkInputSchema = z
  .object(parkFields)
  .refine(mediaRefine.check, { message: mediaRefine.message })
  .refine(
    (data) => {
      const hasLat = data.latitude !== undefined;
      const hasLng = data.longitude !== undefined;
      return hasLat === hasLng;
    },
    { message: "Both latitude and longitude are required when providing coordinates" }
  );

export type ParkInput = z.infer<typeof parkInputSchema>;

export const parkBatchSchema = z.object({
  country_code: z.string().length(2),
  country_name: z.string().min(1),
  parks: z
    .array(
      z.object({
        park_name: z.string().min(1).max(100).transform(formatCityDisplayName),
        park_type: parkTypeSchema,
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
    )
    .min(1)
    .max(50),
});

export type ParkBatchInput = z.infer<typeof parkBatchSchema>;

export const quickParkSchema = z.object({
  park_name: z.string().min(1).max(100).transform(formatCityDisplayName),
  park_type: parkTypeSchema,
  country_code: z.string().length(2),
  country_name: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type QuickParkInput = z.infer<typeof quickParkSchema>;
