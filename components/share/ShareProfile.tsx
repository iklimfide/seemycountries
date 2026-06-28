"use client";

import { useEffect, useState } from "react";
import { buildShareText } from "@/lib/seo/profile";
import { formatMessage, shareMessages } from "@/lib/i18n/client-messages";
import { useModal } from "@/components/ui/ModalProvider";
import type { TravelStats } from "@/types/database";

type ShareProfileProps = {
  username: string;
  displayName: string;
  stats: TravelStats;
  profileUrl: string;
};

function encode(text: string): string {
  return encodeURIComponent(text);
}

export function ShareProfile({
  username,
  displayName,
  stats,
  profileUrl,
}: ShareProfileProps) {
  const modal = useModal();
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const shareText = buildShareText(displayName, stats, username);
  const tweetText = shareText.replace(profileUrl, "").trim();

  const shareLinks = [
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encode(tweetText)}&url=${encode(profileUrl)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(profileUrl)}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encode(shareText)}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(profileUrl)}`,
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
        title: formatMessage(shareMessages.shareTitle, { name: displayName }),
        text: tweetText,
        url: profileUrl,
      });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section className="flex flex-col items-center gap-3">
      <p className="text-sm text-slate-500">{shareMessages.hint}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            {shareMessages.native}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          {shareMessages.copyLink}
        </button>
        {shareLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
