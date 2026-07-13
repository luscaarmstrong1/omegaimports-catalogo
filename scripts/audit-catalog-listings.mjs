import { readFileSync } from "node:fs";

const products = JSON.parse(readFileSync("src/data/products.json", "utf8"));
const publicCatalog = products.filter((product) => product.status === "published" && product.catalogListing === true);

if (publicCatalog.length) {
  for (const product of publicCatalog) console.error(`Produto de catálogo publicado indevidamente: ${product.mlbId} ${product.title}`);
  process.exit(1);
}

console.log("Auditoria de catalog listings v6 concluída: nenhum anúncio de catálogo público.");
