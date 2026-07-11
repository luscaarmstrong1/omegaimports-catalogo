import { mkdirSync, writeFileSync } from "node:fs";

const serviceUrl = process.env.MELI_SYNC_SERVICE_URL;
const apiKey = process.env.MELI_SYNC_API_KEY;
if (!serviceUrl || !apiKey) {
  console.log("Snapshot Mercado Livre ignorado: MELI_SYNC_SERVICE_URL ou MELI_SYNC_API_KEY ausente.");
  process.exit(0);
}

mkdirSync("work", { recursive: true });
const url = new URL("/api/catalog/snapshot", serviceUrl);
const response = await fetch(url, {
  headers: {
    authorization: `Bearer ${apiKey}`,
    accept: "application/json",
  },
});
if (!response.ok) throw new Error(`Falha ao obter snapshot Mercado Livre: HTTP ${response.status}`);
const snapshot = await response.json();
writeFileSync("work/meli-snapshot.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Snapshot Mercado Livre salvo: ${snapshot.products?.length || 0} produtos.`);
