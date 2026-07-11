import assert from "node:assert/strict";
import test from "node:test";
import { categories, loadProducts } from "../scripts/shared.mjs";
import { validateProducts } from "../scripts/products-utils.mjs";

const products = loadProducts({ all: true });
const publicProducts = loadProducts();

test("keeps all imported Mercado Livre products with MLB IDs", () => {
  assert.equal(products.length, 47);
  for (const product of products) assert.match(product.mlbId, /^MLB\d+$/);
});

test("uses internal taxonomy with stable ASCII slugs", () => {
  const allowed = new Set(categories.map((category) => category.slug));
  for (const product of products) assert.ok(allowed.has(product.internalCategorySlug), product.internalCategorySlug);
});

test("marketplace URLs are HTTPS and include the item code", () => {
  for (const product of products) {
    assert.match(product.permalink, /^https:\/\/.+mercadolivre\.com\.br/);
    assert.ok(product.permalink.includes(product.mlbId.replace("MLB", "")));
  }
});

test("public products require verified images and no blocking issues", () => {
  for (const product of publicProducts) {
    assert.equal(product.imageStatus, "verified");
    assert.equal(product.blockingIssues.length, 0);
  }
});

test("product audit has no critical issues", () => {
  const { critical } = validateProducts(products);
  assert.deepEqual(critical, []);
});
