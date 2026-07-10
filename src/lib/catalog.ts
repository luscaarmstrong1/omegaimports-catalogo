import { products } from "@/src/data/products";
import { categoryDescriptions } from "@/src/data/store";
import type { Product } from "@/src/types/product";

export const activeProducts = products.filter((product) => product.active);

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function productSearchHaystack(product: Product) {
  return normalizeText(
    [
      product.name,
      product.shortName,
      product.mlbId,
      product.category,
      product.subcategory,
      product.brand,
      product.model,
      product.shortDescription,
      ...product.highlights,
      ...product.applications,
      ...product.searchTerms,
      ...product.specifications.flatMap((item) => [item.label, item.value]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function searchProducts(items: Product[], query: string) {
  const normalized = normalizeText(query);
  if (!normalized) return items;
  const terms = normalized.split(/\s+/).filter(Boolean);
  return items.filter((product) => {
    const haystack = productSearchHaystack(product);
    return terms.every((term) => haystack.includes(term) || fuzzyIncludes(haystack, term));
  });
}

function fuzzyIncludes(haystack: string, term: string) {
  if (term.length < 4) return false;
  let cursor = 0;
  for (const char of term) {
    cursor = haystack.indexOf(char, cursor);
    if (cursor === -1) return false;
    cursor += 1;
  }
  return true;
}

export function getCategories() {
  return Object.entries(
    activeProducts.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count]) => ({
      name,
      slug: categorySlug(name),
      count,
      description:
        categoryDescriptions[name] ??
        "Produtos organizados para facilitar a escolha do componente correto.",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function categorySlug(name: string) {
  return normalizeText(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getCategoryBySlug(slug: string) {
  return getCategories().find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string) {
  return activeProducts.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return activeProducts
    .filter((item) => item.id !== product.id)
    .map((item) => ({
      item,
      score:
        (item.category === product.category ? 3 : 0) +
        item.applications.filter((value) => product.applications.includes(value)).length +
        (item.quantityInKit !== product.quantityInKit && item.shortName === product.shortName ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score || (a.item.priority ?? 99) - (b.item.priority ?? 99))
    .slice(0, limit)
    .map(({ item }) => item);
}

export function formatPrice(product: Product) {
  if (typeof product.price !== "number") return "Consulte no Mercado Livre";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export function validateMercadoLivreUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("mercadolivre.com.br");
  } catch {
    return false;
  }
}
