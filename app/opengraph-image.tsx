import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";
import { OG_IMAGE_SIZE } from "@/lib/seo/og";
import { DEFAULT_DESCRIPTION } from "@/lib/seo/site";

export const runtime = "edge";
export const alt = `${BRAND.name} travel map`;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(160deg, ${BRAND.colors.background} 0%, ${BRAND.colors.surface} 55%, ${BRAND.colors.background} 100%)`,
          fontFamily: "system-ui, sans-serif",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: BRAND.colors.pin,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: BRAND.colors.background,
              }}
            />
          </div>
          <span style={{ fontSize: "52px", fontWeight: 700, color: "#f8fafc" }}>
            {BRAND.name}
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          {DEFAULT_DESCRIPTION}
        </p>
      </div>
    ),
    { ...size }
  );
}
