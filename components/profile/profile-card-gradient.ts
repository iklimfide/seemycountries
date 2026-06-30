export function profileCardGradient(seed: string): string {
  const hash = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palettes = [
    "linear-gradient(135deg, #a9c4df, #f4c1a5)",
    "linear-gradient(135deg, #bbc7d7, #e6d7c6)",
    "linear-gradient(135deg, #ceb28c, #8f6d56)",
    "linear-gradient(135deg, #9cc6e7, #e9edf2)",
    "linear-gradient(135deg, #8fb3d9, #d4e8c4)",
  ];
  return palettes[hash % palettes.length];
}
