import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const required = [
  "dist/index.html",
  "dist/produtos/index.html",
  "dist/familias/index.html",
  "dist/categorias/index.html",
  "dist/aplicacoes/index.html",
  "dist/guias/index.html",
  "dist/duvidas-frequentes/index.html",
  "dist/404.html",
  "dist/sitemap.xml",
  "dist/robots.txt",
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`${file} nao foi gerado`);
}

const home = readFileSync("dist/index.html", "utf8");
if (!home.includes("/omegaimports-catalogo/assets/site.css")) throw new Error("base path do CSS ausente");
if (!home.includes("logo-horizontal.webp")) throw new Error("logo ausente na Home");

for (const forbidden of [
  "Catalogo publico em revisao tecnica",
  "Catálogo público em revisão técnica",
  "Imagem verificada",
  "image-filter",
  "product-placeholder",
  "Como validamos os produtos",
]) {
  if (home.includes(forbidden)) throw new Error(`conteudo interno/placeholder encontrado na Home: ${forbidden}`);
}

const productCards = home.match(/class="product-card"/g)?.length || 0;
if (productCards < 6) throw new Error(`Home precisa exibir pelo menos 6 cards, encontrou ${productCards}`);
if ((home.match(/class="hero-product/g)?.length || 0) < 3) throw new Error("Hero precisa usar imagens reais de produtos");
if ((home.match(/<picture class="product-picture"/g)?.length || 0) < productCards) throw new Error("Cards precisam renderizar <picture>");

const catalog = readFileSync("dist/produtos/index.html", "utf8");
if (catalog.includes("image-filter") || catalog.includes('name="imagem"')) throw new Error("catalogo contem filtro interno de imagem");
if (!catalog.includes("price-filter")) throw new Error("catalogo sem filtro publico de preco");
if (!catalog.includes('<source srcset="/omegaimports-catalogo/products/')) throw new Error("catalogo sem imagens locais otimizadas");

const brokenLinks = [];
for (const file of htmlFiles("dist")) {
  const html = readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith("/omegaimports-catalogo/")) continue;
    if (href.includes("/assets/") || href.includes("/brand/") || href.includes("/products/")) continue;
    const clean = href.replace("/omegaimports-catalogo/", "").split(/[?#]/)[0];
    const target = clean.endsWith("/") || clean === "" ? join("dist", clean, "index.html") : join("dist", clean);
    if (!existsSync(target)) brokenLinks.push(`${file} -> ${href}`);
  }
}
if (brokenLinks.length) throw new Error(`links internos quebrados:\n${brokenLinks.join("\n")}`);

console.log("Teste E2E estatico concluido.");

function htmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...htmlFiles(path));
    else if (extname(path) === ".html") files.push(path);
  }
  return files;
}
