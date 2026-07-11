import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { escapeHtml, loadProducts } from "./shared.mjs";

const products = loadProducts({ all: true });
mkdirSync("reports", { recursive: true });

const duplicateRows = ["image,mlbIds"];
const mismatchRows = ["mlbId,title,imageStatus,image,issue"];
const seen = new Map();
let critical = 0;

for (const product of products) {
  if (product.status === "published" && product.imageStatus !== "verified") {
    critical++;
    mismatchRows.push([product.mlbId, product.title, product.imageStatus, product.image, "published-without-verified-image"].map(csv).join(","));
  }
  if (product.status === "published" && product.image.includes("product-placeholder")) {
    critical++;
    mismatchRows.push([product.mlbId, product.title, product.imageStatus, product.image, "published-placeholder"].map(csv).join(","));
  }
  if (product.image && !product.image.includes("product-placeholder")) {
    const list = seen.get(product.image) || [];
    list.push(product.mlbId);
    seen.set(product.image, list);
  }
}

for (const [image, ids] of seen) {
  if (ids.length > 1) duplicateRows.push([image, ids.join(";")].map(csv).join(","));
}

writeFileSync("reports/image-duplicates.csv", duplicateRows.join("\n"), "utf8");
writeFileSync("reports/image-mismatches.csv", mismatchRows.join("\n"), "utf8");

const cards = products.map((product) => `<article><img src="../public${product.image}" alt="${escapeHtml(product.title)}"><h2>${product.mlbId}</h2><p>${escapeHtml(product.title)}</p><dl><div><dt>Status</dt><dd>${product.status}</dd></div><div><dt>Imagem</dt><dd>${product.imageStatus}</dd></div><div><dt>Condição</dt><dd>${product.condition}</dd></div><div><dt>Qtd.</dt><dd>${product.quantity}</dd></div><div><dt>Preço</dt><dd>${product.price ?? "pendente"}</dd></div></dl></article>`).join("");
writeFileSync(
  "reports/contact-sheet-products.html",
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Contact sheet OMEGAIMPORTS</title><style>body{font-family:Inter,Arial,sans-serif;background:#f4f7fb;color:#0b1424}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}article{background:white;border:1px solid #dce4ee;padding:12px}img{width:100%;aspect-ratio:1;object-fit:contain;background:#eef2f7}h2{font-size:14px}p{font-size:13px}dl{font-size:12px}</style></head><body><h1>Contact sheet de produtos</h1><main>${cards}</main></body></html>`,
  "utf8",
);

const placeholder = "public/assets/product-placeholder.svg";
if (existsSync(placeholder)) {
  const buffer = await readFile(placeholder);
  const hash = createHash("sha256").update(buffer).digest("hex");
  writeFileSync("reports/product-placeholder-manifest.json", `${JSON.stringify({ file: placeholder, sha256: hash, checkedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
}

const cellW = 260;
const cellH = 210;
const cols = 4;
const rows = Math.ceil(products.length / cols);
const svgCards = products.map((product, index) => {
  const x = (index % cols) * cellW;
  const y = Math.floor(index / cols) * cellH;
  const title = escapeXml(product.title.slice(0, 58));
  return `<g transform="translate(${x},${y})">
    <rect x="10" y="10" width="240" height="190" rx="8" fill="#ffffff" stroke="#dce4ee"/>
    <rect x="22" y="22" width="72" height="72" rx="6" fill="#0b203c"/>
    <text x="106" y="38" font-size="13" font-weight="800" fill="#0b1424">${product.mlbId}</text>
    <text x="106" y="58" font-size="11" fill="#5e6b7d">${product.status} • ${product.imageStatus}</text>
    <text x="22" y="112" font-size="12" font-weight="700" fill="#0b1424">${title}</text>
    <text x="22" y="138" font-size="11" fill="#5e6b7d">Condição: ${product.condition}</text>
    <text x="22" y="156" font-size="11" fill="#5e6b7d">Quantidade: ${product.quantity}</text>
    <text x="22" y="174" font-size="11" fill="#5e6b7d">Preço: ${product.price ?? "pendente"}</text>
  </g>`;
}).join("");
const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cellW}" height="${rows * cellH}" viewBox="0 0 ${cols * cellW} ${rows * cellH}"><rect width="100%" height="100%" fill="#f4f7fb"/>${svgCards}</svg>`;
await sharp(Buffer.from(sheetSvg)).jpeg({ quality: 86 }).toFile("reports/contact-sheet-products.jpg");

if (critical) {
  console.error(`Auditoria de imagens encontrou ${critical} problemas críticos.`);
  process.exit(1);
}
console.log("Auditoria de imagens concluída.");

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function escapeXml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
