import { loadProducts, validateProducts } from "./products-utils.mjs";

const products = loadProducts();
const issues = validateProducts(products);
if (issues.length) {
  const critical = issues.filter((issue) => !issue.includes("sem especificações detalhadas"));
  console.log(`Validação encontrou ${issues.length} pendência(s):`);
  for (const issue of issues) console.log(`- ${issue}`);
  if (critical.length) {
    console.error(`${critical.length} pendência(s) crítica(s) precisam ser corrigidas antes da publicação.`);
    process.exitCode = 1;
  }
} else {
  console.log(`Catálogo validado: ${products.length} produto(s) ativo(s).`);
}
