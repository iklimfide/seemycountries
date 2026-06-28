"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useModal } from "@/components/ui/ModalProvider";
import { buildShareText } from "@/lib/seo/profile";
import type { TravelStats } from "@/types/database";

type ProfilePublicLinkProps = {
  username: string;
  displayName: string;
  profileUrl: string;
  stats: TravelStats;
};

export function ProfilePublicLink({
  username,
  displayName,
  profileUrl,
  stats,
}: ProfilePublicLinkProps) {
  const t = useTranslations("settings");
  const tShare = useTranslations("share");
  const modal = useModal();

  const shareText = buildShareText(displayName, stats, username);
  const shareTitle = tShare("shareTitle", { name: displayName });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      await modal.alert(tShare("copied"), { variant: "success" });
    } catch {
      await modal.alert(tShare("copyFailed"), { variant: "error" });
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText.replace(profileUrl, "").trim(),
          url: profileUrl,
        });
        return;
      } catch {
        /* user cancelled */
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      await modal.alert(tShare("copied"), { variant: "success" });
    } catch {
      await modal.alert(tShare("copyFailed"), { variant: "error" });
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-3">
      <p className="text-sm text-slate-400">{t("shareHint")}</p>
      <Link
        href={`/u/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block break-all text-sm text-blue-400 hover:text-blue-300 hover:underline"
      >
        {profileUrl}
      </Link>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          {tShare("native")}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          {tShare("copyLink")}
        </button>
      </div>
    </div>
  );
}
