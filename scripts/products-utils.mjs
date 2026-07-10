import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const productsFile = new URL("../src/data/products.ts", import.meta.url);

export function loadProducts() {
  const source = readFileSync(productsFile, "utf8");
  const match = source.match(/export const products = ([\s\S]*?) satisfies Product\[\];/);
  if (!match) throw new Error("Não foi possível ler src/data/products.ts");
  return JSON.parse(match[1]);
}

export function validateProducts(products = loadProducts()) {
  const issues = [];
  const slugs = new Set();
  const ids = new Set();
  const links = new Set();

  for (const product of products) {
    const prefix = `${product.mlbId} ${product.name}`;
    if (!product.mercadoLivreUrl) issues.push(`${prefix}: sem link do Mercado Livre`);
    if (!/^https:\/\/.+mercadolivre\.com\.br/.test(product.mercadoLivreUrl)) {
      issues.push(`${prefix}: link externo inválido`);
    }
    if (links.has(product.mercadoLivreUrl)) issues.push(`${prefix}: link duplicado`);
    if (slugs.has(product.slug)) issues.push(`${prefix}: slug duplicado`);
    if (ids.has(product.id)) issues.push(`${prefix}: ID duplicado`);
    if (!product.category) issues.push(`${prefix}: categoria ausente`);
    if (!product.shortDescription) issues.push(`${prefix}: descrição vazia`);
    if (!product.quantityInKit) issues.push(`${prefix}: quantidade do kit ausente`);
    if (!product.condition) issues.push(`${prefix}: condição ausente`);
    if (!product.specifications?.length) issues.push(`${prefix}: sem especificações detalhadas`);
    if (!product.image) issues.push(`${prefix}: imagem ausente`);
    if (product.image && !existsSync(new URL(`../public${product.image}`, import.meta.url))) {
      issues.push(`${prefix}: imagem inexistente ${product.image}`);
    }
    links.add(product.mercadoLivreUrl);
    slugs.add(product.slug);
    ids.add(product.id);
  }
  return issues;
}

export function siteBase() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://omegaimports.catalogo.local";
}

export { root };
