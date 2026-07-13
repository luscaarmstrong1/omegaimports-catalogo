import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { escapeHtml, formatPrice, loadProducts, site } from "./shared.mjs";

const products = loadProducts({ all: true });
const published = products.filter((product) => product.status === "published");
const reportDir = "reports";
mkdirSync(reportDir, { recursive: true });

const formats = ["avif", "webp", "jpg"];
const rows = [["mlbId", "status", "title", "price", "imageStatus", "format", "path", "exists", "width", "height", "issue"].join(",")];
const failures = [];

for (const product of products) {
  for (const format of formats) {
    const path = `public/products/${product.mlbId}/optimized/main.${format}`;
    const exists = existsSync(path);
    let width = "";
    let height = "";
    let issue = "";
    if (exists) {
      const metadata = await sharp(path).metadata();
      width = metadata.width || "";
      height = metadata.height || "";
      if (product.status === "published" && (!metadata.width || !metadata.height)) issue = "missing-dimensions";
    } else if (product.status === "published") {
      issue = "missing-public-image";
    }
    if (issue) failures.push(`${product.mlbId} ${format}: ${issue}`);
    rows.push([product.mlbId, product.status, product.title, formatPrice(product), product.imageStatus, format, path, exists ? "yes" : "no", width, height, issue].map(csv).join(","));
  }
  if (product.status === "published" && product.image?.includes("product-placeholder")) {
    failures.push(`${product.mlbId}: published-placeholder`);
  }
}

writeFileSync(`${reportDir}/public-image-audit.csv`, `${rows.join("\n")}\n`, "utf8");
writeFileSync(`${reportDir}/public-image-contact-sheet.html`, contactSheetHtml(published), "utf8");
await contactSheetJpg(published, `${reportDir}/public-image-contact-sheet.jpg`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Auditoria publica de imagens concluida: ${published.length} produtos publicados.`);

function contactSheetHtml(items) {
  const cards = items.map((product) => {
    const src = `../public/products/${product.mlbId}/optimized/main.jpg`;
    return `<article>
      <img src="${src}" alt="${escapeHtml(product.title)}">
      <h2>${product.mlbId}</h2>
      <p>${escapeHtml(product.title)}</p>
      <dl><div><dt>Categoria</dt><dd>${escapeHtml(product.internalCategory)}</dd></div><div><dt>Preco</dt><dd>${escapeHtml(formatPrice(product))}</dd></div></dl>
    </article>`;
  }).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Public image contact sheet</title><style>
    body{margin:0;padding:24px;font-family:Inter,Arial,sans-serif;background:#f4f7fb;color:#0b1424}
    h1{font-size:28px;margin:0 0 4px}p{color:#5e6b7d}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
    article{background:#fff;border:1px solid #dce4ee;border-radius:8px;padding:12px}img{width:100%;aspect-ratio:1;object-fit:contain;background:#eef2f7;border-radius:6px}
    h2{font-size:13px;margin:10px 0 4px}article p{font-size:12px;margin:0 0 8px;color:#0b1424}dl{font-size:11px;margin:0;color:#5e6b7d}dt{font-weight:700}dd{margin:0}
  </style></head><body><h1>OMEGAIMPORTS - contact sheet publica</h1><p>${items.length} produtos publicados com imagens locais otimizadas. Base publica: ${site.productionUrl}</p><main>${cards}</main></body></html>`;
}

async function contactSheetJpg(items, output) {
  const tileW = 280;
  const tileH = 260;
  const cols = 4;
  const rows = Math.max(1, Math.ceil(items.length / cols));
  const composites = [];
  const background = sharp({
    create: {
      width: cols * tileW,
      height: rows * tileH,
      channels: 3,
      background: "#f4f7fb",
    },
  });

  for (const [index, product] of items.entries()) {
    const x = (index % cols) * tileW;
    const y = Math.floor(index / cols) * tileH;
    const imagePath = resolve(`public/products/${product.mlbId}/optimized/main.jpg`);
    const label = escapeXml(product.title.length > 74 ? `${product.title.slice(0, 71)}...` : product.title);
    const tileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${tileH}">
      <rect x="8" y="8" width="${tileW - 16}" height="${tileH - 16}" rx="8" fill="#ffffff" stroke="#dce4ee"/>
      <rect x="20" y="20" width="${tileW - 40}" height="148" rx="6" fill="#eef2f7"/>
      <text x="20" y="194" font-family="Arial" font-size="14" font-weight="700" fill="#0b1424">${product.mlbId}</text>
      <text x="20" y="214" font-family="Arial" font-size="12" fill="#5e6b7d">${escapeXml(product.internalCategory)}</text>
      <text x="20" y="234" font-family="Arial" font-size="11" fill="#0b1424">${label}</text>
    </svg>`;
    composites.push({ input: Buffer.from(tileSvg), left: x, top: y });
    if (existsSync(imagePath)) {
      const image = await sharp(imagePath).resize(tileW - 52, 136, { fit: "contain", background: "#eef2f7" }).jpeg().toBuffer();
      composites.push({ input: image, left: x + 26, top: y + 26 });
    }
  }

  await background.composite(composites).jpeg({ quality: 88 }).toFile(output);
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function escapeXml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
