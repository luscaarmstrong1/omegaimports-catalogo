import { writeFileSync } from "node:fs";
import { loadProducts, siteBase } from "./products-utils.mjs";

const base = siteBase().replace(/\/$/, "");
const products = loadProducts().filter((product) => product.active);
const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${products
  .map((product) => `  <url><loc>${base}/produtos/${product.slug}</loc></url>`)
  .join("\n")}\n</urlset>\n`;

writeFileSync("public/products-sitemap.xml", body);
console.log(`Sitemap de produtos gerado para ${products.length} item(ns).`);
