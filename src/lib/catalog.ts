import productsData from "@/src/data/products.json";
import type { Product } from "@/src/types/product";

export const products = productsData as Product[];

export const publishedProducts = products.filter((product) => product.status !== "hidden");

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatPrice(product: Product) {
  if (!product.price || !product.priceLastVerifiedAt) return "Consulte o preço no anúncio";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export function productHaystack(product: Product) {
  return normalizeText(
    [
      product.title,
      product.shortTitle,
      product.mlbId,
      product.family,
      product.category,
      product.subcategory,
      product.brand,
      product.model,
      product.shortDescription,
      ...product.technicalHighlights,
      ...product.applications,
      ...product.searchTerms,
      ...product.specifications.flatMap((item) => [item.label, item.value]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function categoryCounts() {
  return publishedProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.categorySlug] = (acc[product.categorySlug] ?? 0) + 1;
    return acc;
  }, {});
}

export function relatedProducts(product: Product, limit = 4) {
  return publishedProducts
    .filter((item) => item.id !== product.id)
    .map((item) => ({
      item,
      score:
        (item.categorySlug === product.categorySlug ? 4 : 0) +
        (item.family === product.family ? 2 : 0) +
        item.applications.filter((application) => product.applications.includes(application)).length,
    }))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "pt-BR"))
    .slice(0, limit)
    .map(({ item }) => item);
}

export function validateMarketplaceUrl(product: Product) {
  try {
    const url = new URL(product.marketplaceUrl);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith("mercadolivre.com.br") &&
      product.marketplaceUrl.includes(product.mlbId.replace("MLB", ""))
    );
  } catch {
    return false;
  }
}
