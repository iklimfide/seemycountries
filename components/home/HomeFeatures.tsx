import { getTranslations } from "next-intl/server";

const FEATURES = [
  {
    key: "map",
    iconBg: "bg-[#dbeafe]",
    icon: "🗺️",
  },
  {
    key: "remember",
    iconBg: "bg-[#fef3c7]",
    icon: "📌",
  },
  {
    key: "share",
    iconBg: "bg-[#d1fae5]",
    icon: "🔗",
  },
] as const;

const STEP_STYLES = [
  "bg-[#dbeafe] text-[#2563eb]",
  "bg-[#ffedd5] text-[#c2410c]",
  "bg-[#d1fae5] text-[#047857]",
] as const;

export async function HomeFeatures({ className = "" }: { className?: string }) {
  const t = await getTranslations("home");
  const steps = [t("steps.signUp"), t("steps.addPins"), t("steps.shareLink")] as const;

  return (
    <section className={className} aria-labelledby="home-features-title">
      <div className="mx-auto mb-[26px] max-w-[700px] text-center">
        <h2
          id="home-features-title"
          className="mb-2.5 text-[34px] tracking-tight text-[#071126] max-sm:text-[28px]"
        >
          {t("featuresSectionTitle")}
        </h2>
        <p className="m-0 text-base leading-relaxed text-[#64748b]">{t("featuresSectionSubtitle")}</p>
      </div>

      <div className="mb-11 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.key}
            className="rounded-[26px] border border-[#d8e1ef] bg-white px-[26px] py-[30px] text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
          >
            <div
              className={`mx-auto mb-[17px] grid h-[54px] w-[54px] place-items-center rounded-[18px] text-[25px] ${feature.iconBg}`}
            >
              <span aria-hidden>{feature.icon}</span>
            </div>
            <h3 className="mb-2.5 text-xl tracking-tight text-[#0f172a]">
              {t(`features.${feature.key}.title`)}
            </h3>
            <p className="m-0 text-[15px] leading-relaxed text-[#64748b]">
              {t(`features.${feature.key}.description`)}
            </p>
          </article>
        ))}
      </div>

      <div
        className="mb-[52px] flex flex-wrap justify-center gap-3.5 text-sm font-bold text-[#64748b]"
        aria-label="How it works"
      >
        {steps.map((label, index) => (
          <div key={label} className="inline-flex items-center gap-2">
            <span
              className={`grid h-[25px] w-[25px] place-items-center rounded-full text-[13px] ${STEP_STYLES[index]}`}
            >
              {index + 1}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
