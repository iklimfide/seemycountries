"use client";

import Link from "next/link";
import { ShareSheetModal } from "@/components/share/ShareSheetModal";
import { useShareProfile } from "@/components/share/ShareProfileButton";
import type { TravelStats } from "@/types/database";

type ProfileActionButtonsProps = {
  username: string;
  displayName: string;
  stats: TravelStats;
  isOwnProfile: boolean;
  shareLabel: string;
  editLabel: string;
};

export function ProfileActionButtons({
  username,
  displayName,
  stats,
  isOwnProfile,
  shareLabel,
  editLabel,
}: ProfileActionButtonsProps) {
  const { open, setOpen, shareLinks, handleCopy } = useShareProfile({
    username,
    displayName,
    stats,
    isOwnProfile,
  });

  return (
    <>
      <div className="profile-actions">
        <button
          type="button"
          className="profile-small-action"
          aria-label={shareLabel}
          onClick={() => setOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M7 17L17 7M17 7H9M17 7V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isOwnProfile ? (
          <Link href="/settings" className="profile-small-action" aria-label={editLabel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span className="profile-small-action profile-small-action--placeholder" aria-hidden />
        )}
      </div>

      <ShareSheetModal
        open={open}
        onClose={() => setOpen(false)}
        onCopy={handleCopy}
        shareLinks={shareLinks}
      />
    </>
  );
}
