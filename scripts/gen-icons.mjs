// One-off icon generator: renders PWA PNG icons from the brand SVGs.
// Run with: node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pub = resolve(root, "public");

const standard = readFileSync(resolve(pub, "app-icon.svg"));
const maskable = readFileSync(resolve(pub, "app-icon-maskable.svg"));

const jobs = [
  { src: standard, size: 192, out: "pwa-192x192.png" },
  { src: standard, size: 512, out: "pwa-512x512.png" },
  { src: standard, size: 180, out: "apple-touch-icon.png" },
  { src: maskable, size: 512, out: "pwa-maskable-512x512.png" },
];

for (const { src, size, out } of jobs) {
  await sharp(src, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(pub, out));
  console.log(`wrote public/${out} (${size}x${size})`);
}
