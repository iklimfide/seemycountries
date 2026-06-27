import sharp from "sharp";
import { LIMITS } from "@/lib/constants";

export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({
      width: LIMITS.imageMaxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}

export function getWebpFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "");
  const safe = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  return `${safe}-${Date.now()}.webp`;
}
