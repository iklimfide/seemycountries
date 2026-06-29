"use client";

import { InstagramIcon } from "@/components/share/SharePlatformIcons";
import { toInstagramEmbedUrl } from "@/lib/utils/instagram";

const EMBED_WIDTH = 326;
const EMBED_HEIGHT = 440;

type InstagramEmbedThumbProps = {
  postUrl: string;
  title: string;
};

export function InstagramEmbedThumb({ postUrl, title }: InstagramEmbedThumbProps) {
  const embedUrl = toInstagramEmbedUrl(postUrl);
  if (!embedUrl) return null;

  return (
    <span className="city-page__memory-thumb-media city-page__memory-thumb-media--embed">
      <span className="city-page__memory-thumb-embed-scaler">
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          className="city-page__memory-thumb-embed"
          style={{
            width: EMBED_WIDTH,
            height: EMBED_HEIGHT,
          }}
          allow="encrypted-media"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
        />
      </span>
      <span className="city-page__memory-thumb-badge" aria-hidden>
        <InstagramIcon className="h-4 w-4" />
      </span>
    </span>
  );
}
