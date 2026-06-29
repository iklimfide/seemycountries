import { redirect } from "next/navigation";
import { profilePath } from "@/lib/seo/site";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function LegacyProfileRedirect({ params }: PageProps) {
  const { username } = await params;
  redirect(profilePath(username));
}
