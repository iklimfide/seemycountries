import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function HomeFinalCta() {
  const t = await getTranslations("home");

  return (
    <section className="on-dark-surface flex flex-col items-start justify-between gap-6 rounded-[32px] bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.34),transparent_30%),linear-gradient(135deg,#0b1220,#111827)] px-[38px] py-[38px] shadow-[0_24px_60px_rgba(15,23,42,0.20)] max-sm:px-[22px] max-sm:py-7">
      <div>
        <h2 className="mb-2 text-[32px] font-bold tracking-tight max-sm:text-[27px]">{t("finalCtaTitle")}</h2>
        <p className="text-muted-on-dark m-0 max-w-[650px] leading-relaxed">{t("finalCtaBody")}</p>
      </div>
      <Link
        href="/register"
        className="inline-flex w-full min-w-[190px] items-center justify-center rounded-full border border-[#d8e1ef] bg-white px-[22px] py-[13px] text-[15px] font-extrabold text-[#2563eb] transition hover:-translate-y-px hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] sm:w-auto"
      >
        {t("heroCtaPrimary")}
      </Link>
    </section>
  );
}
