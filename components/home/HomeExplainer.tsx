import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatMessage, homeMessages } from "@/lib/i18n/client-messages";

type HomeExplainerProps = {
  name: string;
  countries: number;
  cities: number;
};

export async function HomeExplainer({ name, countries, cities }: HomeExplainerProps) {
  const t = await getTranslations("home");

  return (
    <section className="mb-[54px] flex flex-col items-start justify-between gap-5 rounded-3xl border border-[#d8e1ef] bg-white px-7 py-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center">
      <div>
        <h2 className="mb-1.5 text-xl tracking-tight text-[#0f172a]">
          {formatMessage(homeMessages.explainerTitle, { name })}
        </h2>
        <p className="m-0 leading-relaxed text-[#64748b]">
          {formatMessage(homeMessages.explainerBody, { name, countries, cities })}
        </p>
      </div>
      <Link
        href="/register"
        className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-[#2563eb] px-[22px] py-[13px] text-[15px] font-extrabold text-white shadow-[0_12px_26px_rgba(37,99,235,0.28)] transition hover:-translate-y-px hover:bg-[#1d4ed8] sm:w-auto"
      >
        {t("cta")}
      </Link>
    </section>
  );
}
