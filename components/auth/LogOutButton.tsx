import { getTranslations } from "next-intl/server";

type LogOutButtonProps = {
  variant?: "settings" | "profile";
};

export async function LogOutButton({ variant = "settings" }: LogOutButtonProps) {
  const t = await getTranslations("common");
  const tSettings = await getTranslations("settings");

  if (variant === "profile") {
    return (
      <section className="profile-section account-logout">
        <div className="profile-cta">
          <div>
            <p className="profile-cta-title">{tSettings("accountTitle")}</p>
            <p className="profile-cta-hint">{tSettings("logoutHint")}</p>
          </div>
          <form action="/auth/signout" method="POST" className="profile-cta-actions account-logout__actions">
            <button type="submit" className="profile-cta-secondary">
              {t("logout")}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="account-logout rounded-xl border border-slate-700 bg-slate-900/60 p-5">
      <h2 className="text-sm font-semibold text-white">{tSettings("accountTitle")}</h2>
      <p className="mt-1 text-xs text-slate-500">{tSettings("logoutHint")}</p>
      <form action="/auth/signout" method="POST" className="account-logout__actions mt-4">
        <button
          type="submit"
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
        >
          {t("logout")}
        </button>
      </form>
    </section>
  );
}
