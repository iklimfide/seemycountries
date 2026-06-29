import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { createClient } from "@/lib/supabase/server";
import { computeTravelStats } from "@/lib/utils/stats";
import { PROFILE_SELECT } from "@/lib/validations/profile";
import type { VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations("settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const [{ data: countries }, { data: cities }, { data: parks }] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", user.id),
    supabase.from("visited_cities").select("*").eq("user_id", user.id),
    supabase.from("visited_parks").select("*").eq("user_id", user.id),
  ]);

  const stats = computeTravelStats(
    (countries ?? []) as VisitedCountry[],
    (cities ?? []) as VisitedCity[],
    (parks ?? []) as VisitedPark[]
  );

  return (
    <>
      <Header username={profile.username} isLoggedIn />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {t("backToMap")}
          </Link>
        </div>

        <ProfileSettingsForm profile={profile} stats={stats} />
      </main>
    </>
  );
}
