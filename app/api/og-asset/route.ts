import {
  isAllowedOgImageUrl,
  loadOgImagePng,
} from "@/lib/seo/og-image-inline";
import { getSiteUrl } from "@/lib/seo/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  const maxWidth = parseInt(new URL(request.url).searchParams.get("w") ?? "", 10);
  const maxHeight = parseInt(new URL(request.url).searchParams.get("h") ?? "", 10);
  const resize =
    Number.isFinite(maxWidth) || Number.isFinite(maxHeight)
      ? {
          maxWidth: Number.isFinite(maxWidth) ? maxWidth : undefined,
          maxHeight: Number.isFinite(maxHeight) ? maxHeight : undefined,
        }
      : undefined;

  if (!isAllowedOgImageUrl(src, getSiteUrl())) {
    return new Response("Forbidden src", { status: 403 });
  }

  const png = await loadOgImagePng(src, resize);
  if (!png) {
    return new Response("Could not process image", { status: 404 });
  }

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
