import { NextResponse } from "next/server";
import { fetchInstagramThumbnail } from "@/lib/utils/instagram-preview";
import { isValidInstagramUrl } from "@/lib/utils/instagram";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")?.trim();

  if (!url || !isValidInstagramUrl(url)) {
    return NextResponse.json({ error: "Invalid Instagram URL" }, { status: 400 });
  }

  const thumbnailUrl = await fetchInstagramThumbnail(url);

  return NextResponse.json(
    { thumbnailUrl },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
