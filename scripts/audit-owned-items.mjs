import { readFileSync, writeFileSync } from "node:fs";

const products = JSON.parse(readFileSync("src/data/products.json", "utf8"));
const publicProducts = products.filter((product) => product.status === "published");
const issues = [];

for (const product of publicProducts) {
  if (String(product.sellerId) !== "194516027") issues.push([product.mlbId, product.title, "seller_id", product.sellerId, "194516027"]);
  if (product.returnedBySellerItemsSearch !== true) issues.push([product.mlbId, product.title, "seller_search", product.returnedBySellerItemsSearch, true]);
  if (!/^MLB\d+$/.test(product.mlbId || "")) issues.push([product.mlbId, product.title, "item_id", product.mlbId, "MLB"]);
  if (!product.permalink || !product.permalink.includes(product.mlbId.replace("MLB", ""))) issues.push([product.mlbId, product.title, "permalink", product.permalink, "own item permalink"]);
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

writeFileSync("reports/v6-owned-items.md", [
  "# Auditoria v6 de anúncios próprios",
  "",
  `- Produtos públicos avaliados: ${publicProducts.length}`,
  `- Problemas críticos: ${issues.length}`,
  `- Seller ID exigido: 194516027`,
  "",
  issues.length ? "## Problemas\n\n" + issues.map((issue) => `- ${issue[0]}: ${issue[2]} = ${issue[3]} (esperado ${issue[4]})`).join("\n") : "Nenhum produto público viola ownership.",
  "",
].join("\n"), "utf8");

writeFileSync("reports/owned-items-audit.csv", [
  "mlbId,title,field,current,expected",
  ...issues.map((issue) => issue.map(csv).join(",")),
].join("\n"), "utf8");

if (issues.length) {
  console.error(`Audit owned-items falhou: ${issues.length} problema(s).`);
  process.exit(1);
}

console.log(`Auditoria de ownership v6 concluída: ${publicProducts.length} produtos públicos.`);
