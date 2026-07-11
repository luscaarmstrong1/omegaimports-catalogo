import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const products = JSON.parse(readFileSync("src/data/products.json", "utf8"));
const families = new Map();
for (const product of products) {
  const key = product.familyId || "sem-familia";
  const current = families.get(key) || { slug: key, offers: [], minPrice: null, maxPrice: null };
  current.offers.push(product.mlbId);
  if (product.price) {
    current.minPrice = current.minPrice === null ? product.price : Math.min(current.minPrice, product.price);
    current.maxPrice = current.maxPrice === null ? product.price : Math.max(current.maxPrice, product.price);
  }
  families.set(key, current);
}
mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/families.json", `${JSON.stringify([...families.values()], null, 2)}\n`, "utf8");
console.log(`Famílias geradas: ${families.size}.`);
