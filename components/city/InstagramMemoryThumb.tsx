"use client";

import { InstagramEmbedThumb } from "@/components/media/InstagramEmbedThumb";
import { InstagramIcon } from "@/components/share/SharePlatformIcons";
import { toInstagramEmbedUrl } from "@/lib/utils/instagram";

type InstagramMemoryThumbProps = {
  postUrl: string;
  alt: string;
  instagramLabel: string;
};

export function InstagramMemoryThumb({
  postUrl,
  alt,
  instagramLabel,
}: InstagramMemoryThumbProps) {
  if (toInstagramEmbedUrl(postUrl)) {
    return <InstagramEmbedThumb postUrl={postUrl} title={alt} />;
  }

  return (
    <span className="city-page__memory-thumb-instagram" aria-hidden>
      <InstagramIcon className="h-7 w-7" />
      <span>{instagramLabel}</span>
    </span>
  );
}
