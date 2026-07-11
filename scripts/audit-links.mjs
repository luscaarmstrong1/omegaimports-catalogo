import { loadProducts } from "./shared.mjs";

const failures = [];
for (const product of loadProducts({ all: true })) {
  try {
    const url = new URL(product.permalink);
    if (url.protocol !== "https:" || !url.hostname.endsWith("mercadolivre.com.br")) failures.push(`${product.mlbId}: domínio inválido`);
    if (!product.permalink.includes(product.mlbId.replace("MLB", ""))) failures.push(`${product.mlbId}: URL não contém MLB`);
  } catch {
    failures.push(`${product.mlbId}: URL inválida`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Auditoria de links concluída.");
