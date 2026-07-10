import { mkdirSync, writeFileSync } from "node:fs";
import { loadProducts } from "./shared.mjs";
import { validateProducts } from "./products-utils.mjs";

const products = loadProducts();
const { issues, critical } = validateProducts(products);
mkdirSync("reports", { recursive: true });
writeFileSync(
  "reports/relatorio-produtos.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      total: products.length,
      published: products.filter((p) => p.status !== "hidden").length,
      verifiedImages: products.filter((p) => p.imageStatus === "verified").length,
      needsReviewImages: products.filter((p) => p.imageStatus === "needs-review").length,
      issues,
      critical,
    },
    null,
    2,
  ),
);
console.log("Relatório de produtos gerado em reports/relatorio-produtos.json");
