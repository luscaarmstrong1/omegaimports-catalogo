import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { loadProducts } from "./shared.mjs";

const published = loadProducts().filter((product) => product.active && product.imageStatus === "verified");
mkdirSync("reports", { recursive: true });

const rows = [["mlbId", "title", "format", "distPath", "exists", "width", "height", "issue"].join(",")];
const failures = [];
const formats = ["avif", "webp", "jpg"];

for (const product of published) {
  for (const format of formats) {
    const path = `dist/products/${product.mlbId}/optimized/main.${format}`;
    const exists = existsSync(path);
    let width = "";
    let height = "";
    let issue = "";
    if (exists) {
      const metadata = await sharp(path).metadata();
      width = metadata.width || "";
      height = metadata.height || "";
      if (!metadata.width || !metadata.height) issue = "missing-dimensions";
    } else {
      issue = "missing-dist-image";
    }
    if (issue) failures.push(`${product.mlbId} ${format}: ${issue}`);
    rows.push([product.mlbId, product.title, format, path, exists ? "yes" : "no", width, height, issue].map(csv).join(","));
  }
}

for (const page of ["dist/index.html", "dist/produtos/index.html"]) {
  if (!existsSync(page)) {
    failures.push(`${page}: missing-page`);
    continue;
  }
  const html = readFileSync(page, "utf8");
  for (const forbidden of ["product-placeholder", "Imagem verificada", "image-filter"]) {
    if (html.includes(forbidden)) failures.push(`${page}: forbidden-${forbidden}`);
  }
  if (!html.includes("<picture")) failures.push(`${page}: missing-picture`);
  if (!html.includes("/omegaimports-catalogo/products/")) failures.push(`${page}: missing-product-base-url`);
}

writeFileSync("reports/dist-image-audit.csv", `${rows.join("\n")}\n`, "utf8");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Auditoria de imagens do dist concluida: ${published.length} produtos publicados.`);

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
