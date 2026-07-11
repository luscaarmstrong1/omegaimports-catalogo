import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = ""] = arg.replace(/^--/, "").split("=");
  return [key, value || true];
}));
const source = args.get("source") || "api";
mkdirSync("reports", { recursive: true });
mkdirSync("work", { recursive: true });

function report(payload) {
  writeFileSync("reports/sync-mercadolivre.json", `${JSON.stringify({ ...payload, finishedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
}

async function fetchJson(url, token) {
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`);
  return response.json();
}

if (source === "dashboard") {
  const result = spawnSync(process.execPath, ["scripts/parse-seller-dashboard.mjs"], { stdio: "inherit" });
  report({ source, status: result.status === 0 ? "ok" : "failed" });
  process.exit(result.status || 0);
}

if (source === "xlsx") {
  const result = spawnSync(process.execPath, ["scripts/import-mercadolivre-export.mjs"], { stdio: "inherit" });
  const build = spawnSync(process.execPath, ["scripts/build-product-database.mjs", "--mode=xlsx"], { stdio: "inherit" });
  report({ source, status: result.status === 0 && build.status === 0 ? "ok" : "failed" });
  process.exit(result.status || build.status || 0);
}

if (source === "offline") {
  const result = spawnSync(process.execPath, ["scripts/build-product-database.mjs", "--mode=offline"], { stdio: "inherit" });
  report({ source, status: result.status === 0 ? "ok" : "failed" });
  process.exit(result.status || 0);
}

const required = ["MELI_ACCESS_TOKEN", "MELI_SELLER_ID"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  const message = `Sincronização Mercado Livre ignorada: secrets ausentes (${missing.join(", ")}).`;
  console.log(message);
  report({ source, status: "skipped", reason: "missing-secrets", missing });
  process.exit(0);
}

const token = process.env.MELI_ACCESS_TOKEN;
const sellerId = process.env.MELI_SELLER_ID;
const me = await fetchJson("https://api.mercadolibre.com/users/me", token);
if (String(me.id) !== String(sellerId)) throw new Error("MELI_SELLER_ID não corresponde ao vendedor autenticado.");

let scrollId = "";
const itemIds = [];
do {
  const url = new URL(`https://api.mercadolibre.com/users/${sellerId}/items/search`);
  url.searchParams.set("search_type", "scan");
  url.searchParams.set("limit", "50");
  if (scrollId) url.searchParams.set("scroll_id", scrollId);
  const data = await fetchJson(url, token);
  itemIds.push(...(data.results || []));
  scrollId = data.scroll_id || "";
} while (scrollId);

const items = [];
for (let i = 0; i < itemIds.length; i += 20) {
  const chunk = itemIds.slice(i, i + 20).join(",");
  const data = await fetchJson(`https://api.mercadolibre.com/items?ids=${chunk}`, token);
  items.push(...data.map((entry) => entry.body || entry));
}

for (const item of items) {
  try {
    item.description = await fetchJson(`https://api.mercadolibre.com/items/${item.id}/description`, token);
  } catch {
    item.description = null;
  }
}

writeFileSync("work/meli-api-items.json", `${JSON.stringify({ sellerId, fetchedAt: new Date().toISOString(), itemIds, items }, null, 2)}\n`, "utf8");
report({ source, status: "ok", sellerId, totalFound: itemIds.length });
console.log(`Sincronização API concluída: ${itemIds.length} anúncios coletados em work/meli-api-items.json.`);
