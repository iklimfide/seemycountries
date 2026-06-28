"use client";

import { useEffect, useState } from "react";
import { buildShareText } from "@/lib/seo/profile";
import { profileShareUrl } from "@/lib/seo/site";
import { formatMessage, shareMessages } from "@/lib/i18n/client-messages";
import { useModal } from "@/components/ui/ModalProvider";
import type { TravelStats } from "@/types/database";

type ShareProfileProps = {
  username: string;
  displayName: string;
  stats: TravelStats;
  isOwnProfile?: boolean;
};

function encode(text: string): string {
  return encodeURIComponent(text);
}

const PLATFORM_STYLES: Record<string, string> = {
  whatsapp:
    "border-emerald-700/50 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-500/10 dark:text-emerald-200",
  telegram:
    "border-sky-700/50 text-sky-800 hover:border-sky-500 hover:bg-sky-500/10 dark:text-sky-200",
  x: "border-slate-600 text-slate-700 hover:border-slate-400 hover:bg-slate-500/10 dark:text-slate-200",
  facebook:
    "border-blue-800/50 text-blue-800 hover:border-blue-500 hover:bg-blue-500/10 dark:text-blue-200",
  linkedin:
    "border-sky-800/50 text-sky-900 hover:border-sky-500 hover:bg-sky-500/10 dark:text-sky-200",
};

export function ShareProfile({
  username,
  displayName,
  stats,
  isOwnProfile = false,
}: ShareProfileProps) {
  const modal = useModal();
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const shareUrl = profileShareUrl(username);
  const shareText = buildShareText(displayName, stats, username, {
    url: shareUrl,
    isOwnProfile,
  });
  const captionText = shareText.replace(shareUrl, "").trim();
  const shareTitle = formatMessage(shareMessages.shareTitle, { name: displayName });

  const shareLinks = [
    {
      id: "whatsapp",
      label: shareMessages.whatsapp,
      href: `https://wa.me/?text=${encode(shareText)}`,
    },
    {
      id: "telegram",
      label: shareMessages.telegram,
      href: `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(captionText)}`,
    },
    {
      id: "x",
      label: shareMessages.x,
      href: `https://x.com/intent/post?text=${encode(shareText)}`,
    },
    {
      id: "facebook",
      label: shareMessages.facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`,
    },
    {
      id: "linkedin",
      label: shareMessages.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(shareUrl)}`,
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      await modal.alert(shareMessages.copied, { variant: "success" });
    } catch {
      await modal.alert(shareMessages.copyFailed, { variant: "error" });
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: captionText,
        url: shareUrl,
      });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section className="flex w-full flex-col items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-5 text-center sm:px-6 sm:py-6">
      <div>
        <p className="font-medium text-foreground">
          {isOwnProfile ? shareMessages.ownTitle : shareMessages.guestTitle}
        </p>
        <p className="mt-1 text-sm text-slate-500">{shareMessages.hint}</p>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            {shareMessages.native}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-slate-700 px-5 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
        >
          {shareMessages.copyLink}
        </button>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${PLATFORM_STYLES[link.id] ?? ""}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
