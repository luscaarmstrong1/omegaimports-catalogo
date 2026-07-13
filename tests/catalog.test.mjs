import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { categories, loadProducts } from "../scripts/shared.mjs";
import { validateProducts } from "../scripts/products-utils.mjs";

const products = loadProducts({ all: true });
const publicProducts = loadProducts();
const sourceProducts = existsSync("src/data/products-source.meli.json")
  ? JSON.parse(readFileSync("src/data/products-source.meli.json", "utf8"))
  : null;

test("keeps all imported Mercado Livre products with MLB IDs", () => {
  if (sourceProducts) assert.equal(products.length, sourceProducts.length);
  else assert.ok(products.length >= 47);
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

test("public products are owned non-catalog seller listings", () => {
  for (const product of publicProducts) {
    assert.equal(String(product.sellerId), "194516027");
    assert.equal(product.returnedBySellerItemsSearch, true);
    assert.equal(product.catalogListing, false);
    assert.match(product.mlbId, /^MLB\d+$/);
  }
});

test("product audit has no critical issues", () => {
  const { critical } = validateProducts(products);
  assert.deepEqual(critical, []);
});
