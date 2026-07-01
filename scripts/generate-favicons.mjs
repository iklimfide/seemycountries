import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "app", "icon.svg"));
const publicDir = join(root, "public");

const outputs = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
];

for (const [filename, size] of outputs) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, filename));
  console.log(`Wrote ${filename}`);
}

await sharp(svg).resize(32, 32).toFile(join(publicDir, "favicon.ico"));
console.log("Wrote favicon.ico");
