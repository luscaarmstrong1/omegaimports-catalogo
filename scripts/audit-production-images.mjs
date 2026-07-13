import { mkdirSync, writeFileSync } from "node:fs";
import { loadProducts, site } from "./shared.mjs";

const base = process.env.PRODUCTION_URL || site.productionUrl;
const published = loadProducts().filter((product) => product.active && product.imageStatus === "verified");
const formats = ["avif", "webp", "jpg"];
const rows = [["mlbId", "title", "format", "url", "status", "contentType", "bytes", "issue"].join(",")];
const failures = [];

mkdirSync("reports", { recursive: true });

const checks = published.flatMap((product) => formats.map((format) => ({ product, format, url: new URL(`products/${product.mlbId}/optimized/main.${format}`, base).toString() })));
const results = await Promise.all(checks.map(async (check) => ({ ...check, result: await fetchWithRetry(check.url) })));

for (const { product, format, url, result } of results) {
  const issue = result.ok ? "" : "broken-production-image";
  if (issue) failures.push(`${product.mlbId} ${format}: ${result.status} ${url}`);
  rows.push([product.mlbId, product.title, format, url, result.status, result.contentType, result.bytes, issue].map(csv).join(","));
}

writeFileSync("reports/broken-production-images.csv", `${rows.join("\n")}\n`, "utf8");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Auditoria de imagens em producao concluida: ${published.length} produtos publicados em ${base}`);

async function fetchWithRetry(url) {
  let last = { ok: false, status: "error", contentType: "", bytes: 0 };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(5000) });
      const contentType = response.headers.get("content-type") || "";
      const length = Number(response.headers.get("content-length") || 0);
      last = {
        ok: response.ok && contentType.startsWith("image/"),
        status: response.status,
        contentType,
        bytes: length,
      };
      if (last.ok) return last;
    } catch (error) {
      last = { ok: false, status: error.name || "fetch-error", contentType: "", bytes: 0 };
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  return last;
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
