import { mkdirSync, writeFileSync } from "node:fs";
import { loadProducts } from "./shared.mjs";

const products = loadProducts({ all: true });
mkdirSync("reports", { recursive: true });
const rows = ["mlbId,title,status,active,permalink,issue"];
let critical = 0;

for (const product of products) {
  const issues = [];
  if (!/^MLB\d+$/.test(product.mlbId)) issues.push("invalid-mlb");
  if (!product.permalink?.startsWith("https://produto.mercadolivre.com.br/")) issues.push("unexpected-permalink");
  if (!product.permalink?.includes(product.mlbId.replace("MLB", ""))) issues.push("permalink-without-mlb");
  if (product.status === "published" && !product.active) issues.push("published-inactive");
  if (product.status === "published" && product.blockingIssues?.length) issues.push("published-with-blocking-issues");
  for (const issue of issues) {
    if (product.status === "published") critical++;
    rows.push([product.mlbId, product.title, product.status, product.active, product.permalink, issue].map(csv).join(","));
  }
}

writeFileSync("reports/marketplace-audit.csv", rows.join("\n"), "utf8");
if (critical) {
  console.error(`Auditoria marketplace encontrou ${critical} problemas críticos publicados.`);
  process.exit(1);
}
console.log("Auditoria marketplace concluída.");

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
