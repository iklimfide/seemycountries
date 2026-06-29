import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import type { CountryHub } from "@/lib/data/country-hubs";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";

const factCardClass = "rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3";

type CountryHubContentProps = {
  hub: CountryHub;
  travelers: CountryTraveler[];
  labels: {
    quickFacts: string;
    currency: string;
    plugType: string;
    visa: string;
    capital: string;
    language: string;
    recentTravelers: string;
    noTravelersYet: string;
    pinCountry: string;
    addToMap: string;
  };
};

export function CountryHubContent({ hub, travelers, labels }: CountryHubContentProps) {
  const flagUrl = countryCodeToFlagUrl(hub.code);

  return (
    <div className="flex flex-col gap-8">
      <header
        className={`${factCardClass} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="flex items-center gap-3">
          {flagUrl ? (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagUrl}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <h1 className="text-sm leading-relaxed text-slate-200">{hub.name}</h1>
        </div>
        <Link
          href="/register"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {labels.addToMap}
        </Link>
      </header>

      <section aria-labelledby="country-facts-heading">
        <h2 id="country-facts-heading" className="mb-3 text-sm font-semibold text-slate-300">
          {labels.quickFacts}
        </h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FactCard term={labels.capital} detail={hub.capital} />
          <FactCard term={labels.currency} detail={hub.currency} />
          <FactCard term={labels.plugType} detail={hub.plugType} />
          <FactCard term={labels.visa} detail={hub.visaNote} className="sm:col-span-3" />
        </dl>
      </section>

      <section aria-labelledby="country-travelers-heading">
        <h2 id="country-travelers-heading" className="mb-3 text-sm font-semibold text-slate-300">
          {labels.recentTravelers}
        </h2>
        {travelers.length > 0 ? (
          <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/40">
            {travelers.map((traveler) => (
              <li key={traveler.username}>
                <Link
                  href={traveler.profilePath}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-800/60"
                >
                  <ProfileAvatar
                    avatarUrl={traveler.avatarUrl}
                    displayName={traveler.displayName}
                    username={traveler.username}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{traveler.displayName}</p>
                    <p className="truncate text-sm text-slate-500">@{traveler.username}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
            {labels.noTravelersYet}{" "}
            <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
              {labels.pinCountry}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

function FactCard({
  term,
  detail,
  className = "",
}: {
  term: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={factCardClass + (className ? ` ${className}` : "")}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{term}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-slate-200">{detail}</dd>
    </div>
  );
}
