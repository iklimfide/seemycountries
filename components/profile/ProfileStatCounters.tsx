import Link from "next/link";

type ProfileStatCountersProps = {
  allHref: string;
  countries: number;
  cities: number;
  nationalParks: number;
  themeParks: number;
  countriesLabel: string;
  citiesLabel: string;
  nationalParksLabel: string;
  themeParksLabel: string;
};

type StatItemProps = {
  href: string;
  value: number;
  label: string;
};

function StatItem({ href, value, label }: StatItemProps) {
  return (
    <Link href={href} className="profile-stat profile-stat-link">
      <strong>{value}</strong>
      <span>{label}</span>
    </Link>
  );
}

export function ProfileStatCounters({
  allHref,
  countries,
  cities,
  nationalParks,
  themeParks,
  countriesLabel,
  citiesLabel,
  nationalParksLabel,
  themeParksLabel,
}: ProfileStatCountersProps) {
  return (
    <div className="profile-stats">
      <StatItem href={allHref} value={countries} label={countriesLabel} />
      <StatItem href={allHref} value={cities} label={citiesLabel} />
      <StatItem href={allHref} value={nationalParks} label={nationalParksLabel} />
      <StatItem href={allHref} value={themeParks} label={themeParksLabel} />
    </div>
  );
}
