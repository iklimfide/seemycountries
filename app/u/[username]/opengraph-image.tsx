import { buildProfileOgImage } from "@/lib/seo/profile-og-image";

export const runtime = "nodejs";
export const alt = "Travel map on SeeMyCountries";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function OgImage({ params }: Props) {
  const { username } = await params;
  return buildProfileOgImage(username);
}
