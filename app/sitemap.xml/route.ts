import { articleCards, storeConfig } from "@/src/data/store";
import { activeProducts, getCategories } from "@/src/lib/catalog";

export function GET() {
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/produtos",
    "/categorias",
    "/ofertas",
    "/novidades",
    "/mais-vendidos",
    "/sobre",
    "/como-comprar",
    "/duvidas-frequentes",
    "/conteudos",
    "/contato",
    "/politica-de-privacidade",
    "/termos-de-uso",
  ];
  const urls = [
    ...staticRoutes.map((route) => `${base}${route}`),
    ...activeProducts.map((product) => `${base}/produtos/${product.slug}`),
    ...getCategories().map((category) => `${base}/categorias/${category.slug}`),
    ...articleCards.map((article) => `${base}/conteudos/${article.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join("\n")}\n</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml" } });
}
