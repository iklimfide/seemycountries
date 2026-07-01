import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/seo/site";

/** Origin for same-request OG asset proxy (localhost in dev, public host in prod). */
export async function getOgAssetOrigin(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return getSiteUrl();

  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${host}`;
}

export function getOgAssetOriginFromRequest(request: Request): string {
  return new URL(request.url).origin;
}
