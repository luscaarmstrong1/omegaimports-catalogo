import assert from "node:assert/strict";
import test from "node:test";
import { categories, loadProducts } from "../scripts/shared.mjs";
import { validateProducts } from "../scripts/products-utils.mjs";

const products = loadProducts();

test("imports all active Mercado Livre products with MLB IDs", () => {
  assert.equal(products.length, 47);
  for (const product of products) assert.match(product.mlbId, /^MLB\d+$/);
});

test("uses internal taxonomy with stable ASCII slugs", () => {
  const allowed = new Set(categories.map((category) => category.slug));
  for (const product of products) assert.ok(allowed.has(product.categorySlug), product.categorySlug);
});

test("marketplace URLs are HTTPS and include the item code", () => {
  for (const product of products) {
    assert.match(product.marketplaceUrl, /^https:\/\/.+mercadolivre\.com\.br/);
    assert.ok(product.marketplaceUrl.includes(product.mlbId.replace("MLB", "")));
  }
});

test("home featured products require verified images", () => {
  for (const product of products.filter((item) => item.featured)) {
    assert.equal(product.imageStatus, "verified");
  }
});

test("product audit has no critical issues", () => {
  const { critical } = validateProducts(products);
  assert.deepEqual(critical, []);
});
