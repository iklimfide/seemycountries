import Link from "next/link";
import { cityPath, countryPath } from "@/lib/seo/site";

type ProfilePlaceLinkProps = {
  href: string | null;
  children: string;
  className?: string;
};

function ProfilePlaceLink({ href, children, className = "" }: ProfilePlaceLinkProps) {
  if (!href) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={`profile-place-link ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function ProfileCityLink({
  slug,
  name,
  className,
}: {
  slug: string | null;
  name: string;
  className?: string;
}) {
  return (
    <ProfilePlaceLink href={slug ? cityPath(slug) : null} className={className}>
      {name}
    </ProfilePlaceLink>
  );
}

export function ProfileCountryLink({
  slug,
  name,
  className,
}: {
  slug: string | null;
  name: string;
  className?: string;
}) {
  return (
    <ProfilePlaceLink href={slug ? countryPath(slug) : null} className={className}>
      {name}
    </ProfilePlaceLink>
  );
}
