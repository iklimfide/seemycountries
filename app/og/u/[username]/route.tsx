import { buildProfileOgImage } from "@/lib/seo/profile-og-image";

export const runtime = "edge";

type RouteContext = { params: Promise<{ username: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { username } = await context.params;
  return buildProfileOgImage(username);
}
