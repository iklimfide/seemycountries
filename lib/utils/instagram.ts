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
