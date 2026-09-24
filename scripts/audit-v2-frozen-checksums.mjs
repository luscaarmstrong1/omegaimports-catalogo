import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve("tests/fixtures/v2-frozen");
const manifest = readFileSync(join(root, "SHA256SUMS.txt"), "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => {
    const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/);
    if (!match) throw new Error(`Invalid frozen checksum line: ${line}`);
    return { expected: match[1], path: match[2] };
  });

const required = [
  "index.html",
  "css/tokens.css", "css/reset.css", "css/components.css", "css/sections.css", "css/responsive.css", "css/animations.css",
  "assets/brand/omegaimports-logo-horizontal.svg", "assets/brand/favicon.svg",
  "assets/hero/esp32-hero.png", "assets/banners/banner-kits-hd.png", "assets/banners/banner-robot-hd.png",
  "assets/support/support-technician.png", "assets/brands/espressif.png", "assets/payments/pix.png",
  "assets/marketplaces/mercado-livre.png",
];
const listed = new Set(manifest.map((item) => item.path));
for (const path of required) {
  if (!listed.has(path)) throw new Error(`Required frozen checksum is missing: ${path}`);
}

const failures = [];
for (const item of manifest) {
  const file = join(root, item.path);
  if (!existsSync(file)) {
    failures.push(`${item.path}: missing`);
    continue;
  }
  const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (actual !== item.expected) failures.push(`${item.path}: expected ${item.expected}, received ${actual}`);
}
if (failures.length) throw new Error(`Frozen fixture checksum failure:\n${failures.join("\n")}`);

const css = manifest.filter((item) => /^css\/(tokens|reset|components|sections|responsive|animations)\.css$/.test(item.path));
const assets = manifest.filter((item) => item.path.startsWith("assets/"));
console.log(`Frozen checksums confirmed: HTML 1/1, CSS ${css.length}/6, assets ${assets.length}/${assets.length}, total ${manifest.length}/${manifest.length}.`);
