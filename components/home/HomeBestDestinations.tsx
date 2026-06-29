import { getTranslations } from "next-intl/server";
import {
  HOME_BEST_CITIES,
  HOME_BEST_COUNTRIES,
  HOME_BEST_PLACES,
} from "@/lib/data/home-best-destinations";

function TopTenCard({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <article className="rounded-[26px] border border-[#d8e1ef] bg-white px-6 py-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <h3 className="mb-5 text-xl font-bold tracking-tight text-[#071126]">{title}</h3>
      <ol className="m-0 flex flex-col gap-3.5 p-0">
        {items.map((name, index) => (
          <li key={name} className="flex items-center gap-3 text-[15px] text-[#0f172a]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-bold text-[#2563eb]">
              {index + 1}
            </span>
            <span>{name}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

export async function HomeBestDestinations() {
  const t = await getTranslations("home.bestDestinations");

  return (
    <section
      className="rounded-[32px] bg-gradient-to-b from-[#eff6ff] to-[#dbeafe] px-5 py-10 sm:px-8 sm:py-12"
      aria-labelledby="home-best-destinations-title"
    >
      <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <p className="mb-2 text-sm font-extrabold text-[#2563eb]">
          <span aria-hidden>✨ </span>
          {t("eyebrow")}
        </p>
        <h2
          id="home-best-destinations-title"
          className="mb-3 text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight text-[#071126]"
        >
          {t("title")}
        </h2>
        <p className="m-0 text-base leading-relaxed text-[#64748b]">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <TopTenCard title={t("topCountries")} items={HOME_BEST_COUNTRIES} />
        <TopTenCard title={t("topCities")} items={HOME_BEST_CITIES} />
        <TopTenCard title={t("topPlaces")} items={HOME_BEST_PLACES} />
      </div>
    </section>
  );
}
