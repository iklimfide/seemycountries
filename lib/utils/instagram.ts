const INSTAGRAM_POST_REGEX =
  /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/;

export function parseInstagramPostUrl(url: string): string | null {
  const match = url.match(INSTAGRAM_POST_REGEX);
  return match ? match[2] : null;
}

export function toInstagramEmbedUrl(postUrl: string): string | null {
  const shortcode = parseInstagramPostUrl(postUrl);
  if (!shortcode) return null;
  return `https://www.instagram.com/p/${shortcode}/embed`;
}

export function isValidInstagramUrl(url: string): boolean {
  return INSTAGRAM_POST_REGEX.test(url);
}

/** Canonical post URL without tracking query params. */
export function normalizeInstagramPostUrl(url: string): string {
  const shortcode = parseInstagramPostUrl(url);
  if (!shortcode) return url.trim();
  return `https://www.instagram.com/p/${shortcode}/`;
}

export function isInstagramCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.includes("cdninstagram.com") || host.includes("fbcdn.net");
  } catch {
    return false;
  }
}
