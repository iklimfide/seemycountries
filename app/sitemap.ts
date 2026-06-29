import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, profilePath, countryPath } from "@/lib/seo/site";
import { listCountryHubSlugs } from "@/lib/data/country-hubs";

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

  for (const slug of listCountryHubSlugs()) {
    entries.push({
      url: `${siteUrl}${countryPath(slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

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
