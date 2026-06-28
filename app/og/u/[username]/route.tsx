import { buildProfileOgImage } from "@/lib/seo/profile-og-image";

export const runtime = "edge";

type RouteContext = { params: Promise<{ username: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { username } = await context.params;
  const response = await buildProfileOgImage(username);
  response.headers.set(
    "Cache-Control",
    "public, max-age=3600, stale-while-revalidate=86400"
  );
  return response;
}
