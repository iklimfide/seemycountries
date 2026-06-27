import { z } from "zod";

export const cityBatchSchema = z.object({
  country_code: z.string().length(2),
  country_name: z.string().min(1),
  cities: z
    .array(
      z.object({
        city_name: z.string().min(1).max(100),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
    )
    .min(1, "Select at least one city")
    .max(50, "You can add up to 50 cities at a time"),
});

export type CityBatchInput = z.infer<typeof cityBatchSchema>;
