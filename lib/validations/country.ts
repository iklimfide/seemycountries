import { z } from "zod";

export const countrySchema = z.object({
  country_code: z.string().length(2, "Invalid country code"),
  country_name: z.string().min(1, "Country name is required"),
});

export type CountryInput = z.infer<typeof countrySchema>;
