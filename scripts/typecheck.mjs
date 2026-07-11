import { loadProducts } from "./shared.mjs";

const required = ["id", "mlbId", "slug", "title", "shortTitle", "status", "condition", "quantity", "permalink", "image", "imageStatus", "shortDescription", "internalCategory", "internalCategorySlug", "source", "blockingIssues"];
const failures = [];
for (const product of loadProducts({ all: true })) {
  for (const key of required) {
    if (product[key] === undefined || product[key] === "") failures.push(`${product.mlbId || "sem-id"}: campo obrigatório ausente ${key}`);
  }
  if (!["novo", "usado", "recondicionado", "não-confirmado"].includes(product.condition)) failures.push(`${product.mlbId}: condição inválida`);
  if (!Number.isInteger(product.quantity) || product.quantity < 1) failures.push(`${product.mlbId}: quantidade inválida`);
  if (!["published", "hidden", "pending-review"].includes(product.status)) failures.push(`${product.mlbId}: status inválido`);
  if (!["verified", "missing", "mismatch", "pending-review"].includes(product.imageStatus)) failures.push(`${product.mlbId}: imageStatus inválido`);
  if (!product.source?.fields?.title) failures.push(`${product.mlbId}: proveniência de título ausente`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Typecheck de dados concluído.");
