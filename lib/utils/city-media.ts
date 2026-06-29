import type { MediaType } from "@/types/database";
import { fetchInstagramThumbnail } from "@/lib/utils/instagram-preview";
import { isInstagramCdnUrl, normalizeInstagramPostUrl } from "@/lib/utils/instagram";

type CityMediaInput = {
  media_type?: MediaType | null;
  media_url?: string | null;
};

export async function resolveCityMediaFields(data: CityMediaInput): Promise<{
  media_type: MediaType | null;
  media_url: string | null;
  media_preview_url: string | null;
}> {
  const mediaType = data.media_type ?? null;
  const mediaUrl = data.media_url ?? null;

  if (!mediaType || !mediaUrl) {
    return {
      media_type: null,
      media_url: null,
      media_preview_url: null,
    };
  }

  if (mediaType === "photo") {
    return {
      media_type: mediaType,
      media_url: mediaUrl,
      media_preview_url: mediaUrl,
    };
  }

  const canonicalUrl = normalizeInstagramPostUrl(mediaUrl);
  const previewUrl = await fetchInstagramThumbnail(canonicalUrl);
  const mediaPreviewUrl =
    previewUrl && isInstagramCdnUrl(previewUrl) ? previewUrl : null;

  return {
    media_type: mediaType,
    media_url: canonicalUrl,
    media_preview_url: mediaPreviewUrl,
  };
}
