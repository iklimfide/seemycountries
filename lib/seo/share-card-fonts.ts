let scriptFontData: ArrayBuffer | null = null;
let sansBoldData: ArrayBuffer | null = null;
let sansSemiData: ArrayBuffer | null = null;

async function loadFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font fetch failed: ${url}`);
  return response.arrayBuffer();
}

export async function getShareCardFonts() {
  const [script, bold, semi] = await Promise.all([
    scriptFontData
      ? Promise.resolve(scriptFontData)
      : loadFont(
          "https://raw.githubusercontent.com/google/fonts/main/ofl/dancingscript/static/DancingScript-Bold.ttf"
        ).then((data) => {
          scriptFontData = data;
          return data;
        }),
    sansBoldData
      ? Promise.resolve(sansBoldData)
      : loadFont(
          "https://raw.githubusercontent.com/rsms/inter/master/fonts/ttf/Inter-Bold.ttf"
        ).then((data) => {
          sansBoldData = data;
          return data;
        }),
    sansSemiData
      ? Promise.resolve(sansSemiData)
      : loadFont(
          "https://raw.githubusercontent.com/rsms/inter/master/fonts/ttf/Inter-SemiBold.ttf"
        ).then((data) => {
          sansSemiData = data;
          return data;
        }),
  ]);

  return {
    script,
    bold,
    semi,
  };
}

export const SHARE_CARD_FONT_FAMILIES = {
  script: "Dancing Script",
  sans: "Inter",
} as const;
