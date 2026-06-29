import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { formatCityDisplayName } from "@/lib/utils/city-name";
import { isValidInstagramUrl } from "@/lib/utils/instagram";
import { isValidVisitYearMonth, normalizeVisitDates } from "@/lib/utils/visit-date";

const visitDatesField = z
  .array(z.string())
  .max(LIMITS.maxCityVisitDates)
  .optional()
  .nullable()
  .transform((value) => normalizeVisitDates(value ?? []));

const cityFields = {
  city_name: z
    .string()
    .min(1, "City name is required")
    .max(100)
    .transform(formatCityDisplayName),
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
  visit_dates: visitDatesField,
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

/** Client payload — coordinates optional when picked from search. */
export const cityInputSchema = z
  .object(cityFields)
  .refine(
    (data) => (data.visit_dates ?? []).every(isValidVisitYearMonth),
    { message: "Invalid visit date format" }
  )
  .refine(mediaRefine.check, { message: mediaRefine.message })
  .refine(
    (data) => {
      const hasLat = data.latitude !== undefined;
      const hasLng = data.longitude !== undefined;
      return hasLat === hasLng;
    },
    { message: "Both latitude and longitude are required when providing coordinates" }
  );

export type CityInput = z.infer<typeof cityInputSchema>;
