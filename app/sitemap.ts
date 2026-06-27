import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, profilePath } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const supabase = await createClient();
  if (supabase) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("username, created_at")
      .order("created_at", { ascending: false });

    for (const profile of profiles ?? []) {
      entries.push({
        url: `${siteUrl}${profilePath(profile.username)}`,
        lastModified: profile.created_at ? new Date(profile.created_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
