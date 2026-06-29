import { unstable_cache } from "next/cache";
import { parseInstagramPostUrl } from "@/lib/utils/instagram";

const INSTAGRAM_FETCH_TIMEOUT_MS = 8_000;

function decodeJsonString(value: string): string {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/&amp;/g, "&");
}

function extractMetaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeJsonString(match[1]);
  }

  return null;
}

function extractJsonImageUrl(html: string): string | null {
  const patterns = [
    /"thumbnail_url":"([^"]+)"/,
    /"display_url":"([^"]+)"/,
    /"thumbnail_src":"([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeJsonString(match[1]);
  }

  return null;
}

function metaGraphToken(): string | null {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;
  return `${appId}|${appSecret}`;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(INSTAGRAM_FETCH_TIMEOUT_MS),
      headers: {
        Accept: "text/html,application/json",
        "User-Agent": "facebookexternalhit/1.1",
      },
      next: { revalidate: 86_400 },
    });

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function fetchInstagramThumbnailUncached(postUrl: string): Promise<string | null> {
  const normalized = postUrl.trim();
  const token = metaGraphToken();

  if (token) {
    try {
      const graphUrl = new URL("https://graph.facebook.com/v22.0/instagram_oembed");
      graphUrl.searchParams.set("url", normalized);
      graphUrl.searchParams.set("access_token", token);
      graphUrl.searchParams.set("omitscript", "true");

      const response = await fetch(graphUrl, {
        signal: AbortSignal.timeout(INSTAGRAM_FETCH_TIMEOUT_MS),
        headers: { Accept: "application/json" },
        next: { revalidate: 86_400 },
      });

      if (response.ok) {
        const data = (await response.json()) as { thumbnail_url?: string };
        if (typeof data.thumbnail_url === "string" && data.thumbnail_url.startsWith("http")) {
          return data.thumbnail_url;
        }
      }
    } catch {
      // Fall through.
    }
  }

  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(normalized)}&omitscript=true`;
    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(INSTAGRAM_FETCH_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        "User-Agent": "facebookexternalhit/1.1",
      },
      next: { revalidate: 86_400 },
    });

    if (response.ok) {
      const data = (await response.json()) as { thumbnail_url?: string };
      if (typeof data.thumbnail_url === "string" && data.thumbnail_url.startsWith("http")) {
        return data.thumbnail_url;
      }
    }
  } catch {
    // Fall through.
  }

  const shortcode = parseInstagramPostUrl(normalized);
  const candidates = shortcode
    ? [`https://www.instagram.com/p/${shortcode}/embed/captioned/`, normalized]
    : [normalized];

  for (const url of candidates) {
    const html = await fetchHtml(url);
    if (!html) continue;

    const fromJson = extractJsonImageUrl(html);
    if (fromJson?.startsWith("http")) return fromJson;

    const fromOg = extractMetaContent(html, "og:image");
    if (fromOg?.startsWith("http")) return fromOg;
  }

  return null;
}

export async function fetchInstagramThumbnail(postUrl: string): Promise<string | null> {
  const shortcode = parseInstagramPostUrl(postUrl);
  if (!shortcode) return null;

  const thumbnail = await fetchInstagramThumbnailUncached(postUrl);
  if (!thumbnail) return null;

  const cached = unstable_cache(
    async () => thumbnail,
    ["instagram-thumbnail", shortcode],
    { revalidate: 86_400 }
  );

  return cached();
}
