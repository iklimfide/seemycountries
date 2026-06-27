import { z } from "zod";

export const profileSettingsSchema = z.object({
  wishlist_public: z.boolean(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
