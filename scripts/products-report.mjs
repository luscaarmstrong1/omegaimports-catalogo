import { writeFileSync } from "node:fs";
import { loadProducts, validateProducts } from "./products-utils.mjs";

const products = loadProducts();
const issues = validateProducts(products);
const report = {
  generatedAt: new Date().toISOString(),
  totalProducts: products.length,
  activeProducts: products.filter((product) => product.active).length,
  categories: [...new Set(products.map((product) => product.category))].sort(),
  issues,
  productsWithoutSpecs: products.filter((product) => !product.specifications?.length).map((product) => product.mlbId),
  productsWithoutImage: products.filter((product) => !product.image).map((product) => product.mlbId),
  linksDerivedFromExport: products
    .filter((product) => product.linkStatus === "derivedFromExport")
    .map((product) => product.mlbId),
};

writeFileSync("products-report.json", JSON.stringify(report, null, 2));
console.log(`Relatório gerado com ${issues.length} pendência(s).`);
