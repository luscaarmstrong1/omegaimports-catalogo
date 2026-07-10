import assert from "node:assert/strict";
import test from "node:test";
import { loadProducts, validateProducts } from "../scripts/products-utils.mjs";

const products = loadProducts();

test("all active products have valid Mercado Livre HTTPS URLs", () => {
  for (const product of products.filter((item) => item.active)) {
    assert.match(product.mercadoLivreUrl, /^https:\/\/.+mercadolivre\.com\.br/);
  }
});

test("catalog has unique ids, slugs and links", () => {
  assert.equal(new Set(products.map((product) => product.id)).size, products.length);
  assert.equal(new Set(products.map((product) => product.slug)).size, products.length);
  assert.equal(new Set(products.map((product) => product.mercadoLivreUrl)).size, products.length);
});

test("cards can render from structured data", () => {
  const first = products[0];
  assert.ok(first.name);
  assert.ok(first.shortDescription);
  assert.ok(first.image);
  assert.ok(first.category);
});

test("validator reports only documented data-quality issues", () => {
  const issues = validateProducts(products);
  assert.ok(Array.isArray(issues));
  assert.ok(issues.every((issue) => /sem especificações detalhadas|imagem|link|slug|ID|categoria|descrição|quantidade|condição/.test(issue)));
});
