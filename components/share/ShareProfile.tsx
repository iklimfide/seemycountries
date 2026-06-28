"use client";

import { useState } from "react";
import { ShareSheetModal } from "@/components/share/ShareSheetModal";
import { buildShareText } from "@/lib/seo/profile";
import { profileShareUrl } from "@/lib/seo/site";
import { shareMessages } from "@/lib/i18n/client-messages";
import { useToast } from "@/components/ui/ToastProvider";
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

export function ShareProfile({
  username,
  displayName,
  stats,
  isOwnProfile = false,
}: ShareProfileProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const shareUrl = profileShareUrl(username);
  const shareText = buildShareText(displayName, stats, username, {
    url: shareUrl,
    isOwnProfile,
  });
  const captionText = shareText.replace(shareUrl, "").trim();

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encode(shareText)}`,
    telegram: `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(captionText)}`,
    x: `https://x.com/intent/post?text=${encode(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`,
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.show(shareMessages.copied, 1000);
    } catch {
      toast.show(shareMessages.copyFailed, 2000);
    }
  }

  return (
    <>
      <section className="flex w-full flex-col items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-5 text-center sm:px-6 sm:py-6">
        <div>
          <p className="font-medium text-foreground">
            {isOwnProfile ? shareMessages.ownTitle : shareMessages.guestTitle}
          </p>
          <p className="mt-1 text-sm text-slate-500">{shareMessages.hint}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          {shareMessages.native}
        </button>
      </section>

      <ShareSheetModal
        open={open}
        onClose={() => setOpen(false)}
        onCopy={handleCopy}
        shareLinks={shareLinks}
      />
    </>
  );
}
