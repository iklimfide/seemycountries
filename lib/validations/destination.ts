import { z } from "zod";

export const quickDestinationSchema = z.object({
  kind: z.enum(["city", "country"]).default("city"),
  city_name: z.string().min(1).max(100),
  country_code: z.string().length(2),
  country_name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type QuickDestinationInput = z.infer<typeof quickDestinationSchema>;
