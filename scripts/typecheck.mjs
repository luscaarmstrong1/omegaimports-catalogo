import { loadProducts } from "./shared.mjs";

const required = ["id", "mlbId", "slug", "title", "shortTitle", "category", "categorySlug", "condition", "quantity", "status", "marketplaceUrl", "image", "imageStatus", "shortDescription"];
const failures = [];
for (const product of loadProducts()) {
  for (const key of required) {
    if (product[key] === undefined || product[key] === "") failures.push(`${product.mlbId || "sem-id"}: campo obrigatório ausente ${key}`);
  }
  if (!["novo", "usado"].includes(product.condition)) failures.push(`${product.mlbId}: condição inválida`);
  if (!Number.isInteger(product.quantity) || product.quantity < 1) failures.push(`${product.mlbId}: quantidade inválida`);
  if (!["published", "needs-review", "hidden"].includes(product.status)) failures.push(`${product.mlbId}: status inválido`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Typecheck de dados concluído.");
