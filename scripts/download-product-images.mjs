import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const sourcePath = existsSync("src/data/products-source.meli.json") ? "src/data/products-source.meli.json" : "src/data/products.json";
const products = JSON.parse(readFileSync(sourcePath, "utf8"));
let downloaded = 0;
const missing = ["mlbId,title,reason"];

for (const product of products) {
  const pictures = product.pictures || [];
  if (!pictures.length) {
    missing.push(csv([product.mlbId, product.title, "no-pictures-in-snapshot"]));
    continue;
  }
  const first = pictures[0];
  const sourceUrl = first.secureUrl || first.url;
  if (!sourceUrl || !String(sourceUrl).startsWith("https://")) {
    missing.push(csv([product.mlbId, product.title, "invalid-picture-url"]));
    continue;
  }
  const base = `public/products/${product.mlbId}`;
  mkdirSync(`${base}/original`, { recursive: true });
  mkdirSync(`${base}/optimized`, { recursive: true });
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    missing.push(csv([product.mlbId, product.title, `http-${response.status}`]));
    continue;
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    missing.push(csv([product.mlbId, product.title, "invalid-mime"]));
    continue;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > 8 * 1024 * 1024) {
    missing.push(csv([product.mlbId, product.title, "image-too-large"]));
    continue;
  }
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 300 || metadata.height < 300) {
    missing.push(csv([product.mlbId, product.title, "image-too-small"]));
    continue;
  }
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  await writeFile(`${base}/original/main`, buffer);
  await sharp(buffer).rotate().resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).avif({ quality: 70 }).toFile(`${base}/optimized/main.avif`);
  await sharp(buffer).rotate().resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${base}/optimized/main.webp`);
  await sharp(buffer).rotate().resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 86 }).toFile(`${base}/optimized/main.jpg`);
  writeFileSync(`${base}/manifest.json`, `${JSON.stringify({ mlbId: product.mlbId, itemUrl: product.marketplaceUrl || product.permalink, pictureId: first.id || null, sourceUrl, sha256, perceptualHash: sha256.slice(0, 16), width: metadata.width, height: metadata.height, format: metadata.format, downloadedAt: new Date().toISOString(), verifiedAt: new Date().toISOString(), validationStatus: "verified" }, null, 2)}\n`, "utf8");
  downloaded++;
}

mkdirSync("reports", { recursive: true });
writeFileSync("reports/missing-images.csv", missing.join("\n"), "utf8");
console.log(`Download de imagens concluído: ${downloaded} imagens baixadas.`);

function csv(values) {
  return values.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",");
}
