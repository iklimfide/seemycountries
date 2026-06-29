"use client";

import { useEffect, useRef } from "react";
import { toInstagramEmbedUrl } from "@/lib/utils/instagram";

type InstagramEmbedProps = {
  postUrl: string;
  title: string;
  className?: string;
};

export function InstagramEmbed({ postUrl, title, className = "aspect-square w-full" }: InstagramEmbedProps) {
  const embedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embedUrl = toInstagramEmbedUrl(postUrl);
    if (!embedUrl || !embedContainerRef.current) return;

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.className = "h-full w-full border-0";
    iframe.loading = "lazy";
    iframe.title = title;
    iframe.allow = "encrypted-media";
    iframe.setAttribute("referrerPolicy", "no-referrer-when-downgrade");

    embedContainerRef.current.innerHTML = "";
    embedContainerRef.current.appendChild(iframe);

    return () => {
      if (embedContainerRef.current) {
        embedContainerRef.current.innerHTML = "";
      }
    };
  }, [postUrl, title]);

  return <div ref={embedContainerRef} className={className} />;
}
