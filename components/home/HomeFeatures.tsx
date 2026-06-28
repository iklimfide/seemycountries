import { getTranslations } from "next-intl/server";

const FEATURES = [
  {
    key: "map",
    cardClass:
      "border-blue-400/40 bg-gradient-to-br from-blue-100 via-blue-50/80 to-white dark:border-blue-500/30 dark:from-blue-500/20 dark:via-blue-500/10 dark:to-slate-900/60",
    iconClass: "bg-blue-500/25 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    titleClass: "text-blue-950 dark:text-blue-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5v-13Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 4v13M15 6.5v13" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "remember",
    cardClass:
      "border-amber-400/40 bg-gradient-to-br from-amber-100 via-amber-50/80 to-white dark:border-amber-500/30 dark:from-amber-500/20 dark:via-amber-500/10 dark:to-slate-900/60",
    iconClass: "bg-amber-500/25 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    titleClass: "text-amber-950 dark:text-amber-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v11l-8-4.5L4 18V7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "share",
    cardClass:
      "border-emerald-400/40 bg-gradient-to-br from-emerald-100 via-emerald-50/80 to-white dark:border-emerald-500/30 dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-slate-900/60",
    iconClass: "bg-emerald-500/25 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
    titleClass: "text-emerald-950 dark:text-emerald-50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.4 11 15.6 6.5M8.4 13l7.2 4.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
] as const;

const STEP_COLORS = [
  "bg-blue-500/15 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
  "bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  "bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
] as const;

export async function HomeFeatures() {
  const t = await getTranslations("home");
  const steps = [t("steps.signUp"), t("steps.addPins"), t("steps.shareLink")] as const;

  return (
    <section className="order-3" aria-labelledby="home-features-title">
      <h2
        id="home-features-title"
        className="mb-4 text-center text-base font-semibold text-slate-900 dark:text-white sm:text-lg"
      >
        {t("featuresTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {FEATURES.map((feature) => (
          <article
            key={feature.key}
            className={`rounded-xl border px-4 py-4 text-center shadow-sm ${feature.cardClass}`}
          >
            <div
              className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${feature.iconClass}`}
            >
              {feature.icon}
            </div>
            <h3 className={`text-center font-medium ${feature.titleClass}`}>
              {t(`features.${feature.key}.title`)}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {t(`features.${feature.key}.description`)}
            </p>
          </article>
        ))}
      </div>
      <ol className="mt-5 flex flex-col gap-2 text-center text-sm text-slate-600 dark:text-slate-500 sm:flex-row sm:justify-center sm:gap-6">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center justify-center gap-2 sm:justify-start">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${STEP_COLORS[index]}`}
            >
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </section>
  );
}
