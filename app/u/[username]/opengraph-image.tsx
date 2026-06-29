import { buildProfileOgImage } from "@/lib/seo/profile-og-image";
import { BRAND } from "@/lib/constants";

export const runtime = "edge";
export const alt = `Travel map on ${BRAND.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function OgImage({ params }: Props) {
  const { username } = await params;
  return buildProfileOgImage(username);
}
