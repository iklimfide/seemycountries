import sharp from "sharp";

const ALLOWED_HOST = /\.supabase\.co$/;

export const runtime = "nodejs";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return new Response("Invalid src", { status: 400 });
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOST.test(parsed.hostname)) {
    return new Response("Forbidden src", { status: 403 });
  }

  try {
    const response = await fetch(src, { cache: "no-store" });
    if (!response.ok) {
      return new Response("Upstream not found", { status: 404 });
    }

    const input = Buffer.from(await response.arrayBuffer());
    if (input.length === 0) {
      return new Response("Empty image", { status: 404 });
    }

    const png = await sharp(input).rotate().png({ compressionLevel: 6 }).toBuffer();

    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Could not process image", { status: 500 });
  }
}
