import { mkdirSync, writeFileSync } from "node:fs";
import { loadProducts } from "./shared.mjs";
import { validateProducts } from "./products-utils.mjs";

const products = loadProducts({ all: true });
const publicProducts = loadProducts();
const { issues, critical } = validateProducts(products);
mkdirSync("reports", { recursive: true });
writeFileSync(
  "reports/relatorio-produtos.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      total: products.length,
      published: publicProducts.length,
      hiddenOrPending: products.length - publicProducts.length,
      verifiedImages: products.filter((p) => p.imageStatus === "verified").length,
      pendingImages: products.filter((p) => p.imageStatus !== "verified").length,
      issues,
      critical,
    },
    null,
    2,
  ),
);
console.log("Relatório de produtos gerado em reports/relatorio-produtos.json");
