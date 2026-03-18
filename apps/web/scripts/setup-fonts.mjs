/**
 * Downloads Noto Serif and Manrope variable fonts from Google Fonts CDN
 * and writes them to public/fonts/ as WOFF2 files.
 *
 * Run once on the server before building:
 *   node scripts/setup-fonts.mjs
 *
 * Or automatically via `prebuild` in package.json.
 */

import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, "../public/fonts");

// Google Fonts CSS API — returns WOFF2 URLs for variable fonts when given a
// modern user-agent string. We request the full weight axes for each family.
const FONT_CSS_URLS = [
  "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wdth,wght@0,62.5..100,100..900;1,62.5..100,100..900&display=swap",
  "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
];

// User-agent that triggers woff2 responses from Google Fonts
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

function slugify(family, style, axes) {
  // e.g. "Noto Serif" italic → noto-serif/NotoSerif-Variable-Italic.woff2
  const base = family.replace(/\s+/g, "");
  const dir = family.replace(/\s+/g, "-").toLowerCase();
  const italic = style === "italic" ? "-Italic" : "";
  return { dir, filename: `${base}-Variable${italic}.woff2` };
}

async function main() {
  const jobs = [];

  for (const cssUrl of FONT_CSS_URLS) {
    const css = await fetchText(cssUrl);

    // Extract all @font-face blocks
    const faceBlocks = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];

    for (const block of faceBlocks) {
      const familyMatch = block.match(/font-family:\s*['"]([^'"]+)['"]/);
      const styleMatch = block.match(/font-style:\s*(\w+)/);
      const srcMatch = block.match(/src:[^;]*url\(([^)]+)\)[^;]*format\(['"]woff2['"]\)/);

      if (!familyMatch || !srcMatch) continue;

      const family = familyMatch[1];
      const style = styleMatch?.[1] ?? "normal";
      const woff2Url = srcMatch[1].replace(/['"]/g, "");

      const { dir, filename } = slugify(family, style);
      const destDir = path.join(FONTS_DIR, dir);
      const destFile = path.join(destDir, filename);

      // Deduplicate — multiple unicode-range blocks share the same URL
      if (jobs.find((j) => j.dest === destFile)) continue;

      jobs.push({ family, style, url: woff2Url, dest: destFile, destDir });
    }
  }

  if (jobs.length === 0) {
    console.error("No WOFF2 URLs found — Google Fonts CSS format may have changed.");
    process.exit(1);
  }

  for (const { family, style, url, dest, destDir } of jobs) {
    if (existsSync(dest)) {
      console.log(`  skip  ${path.relative(FONTS_DIR, dest)} (already exists)`);
      continue;
    }
    mkdirSync(destDir, { recursive: true });
    process.stdout.write(`  fetch ${path.relative(FONTS_DIR, dest)} … `);
    await downloadFile(url, dest);
    const { size } = await import("node:fs").then((m) =>
      m.promises.stat(dest)
    );
    console.log(`${Math.round(size / 1024)}kb`);
  }

  console.log("fonts ready.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
