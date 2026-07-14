import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const required = [
  "dist/index.html",
  "dist/produtos/index.html",
  "dist/categorias/index.html",
  "dist/blog/index.html",
  "dist/sobre/index.html",
  "dist/como-comprar/index.html",
  "dist/404.html",
  "dist/sitemap.xml",
  "dist/robots.txt",
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`${file} não foi gerado`);
}

const home = readFileSync("dist/index.html", "utf8");
if (!home.includes("/assets/site.css")) throw new Error("base path do CSS ausente");
if (!home.includes("logo-horizontal-light.webp")) throw new Error("logo clara ausente na Home");
if (!home.includes("A peça certa para o seu projeto avançar.")) throw new Error("Hero v6 ausente");
if ((home.match(/class="orbit-product(?:\s|")/g)?.length || 0) !== 3) throw new Error("Hero precisa usar um produto principal e dois secundários");
if ((home.match(/class="category-card/g)?.length || 0) !== 6) throw new Error("Home precisa exibir exatamente 6 categorias");
if ((home.match(/class="product-card/g)?.length || 0) !== 8) throw new Error("Home precisa exibir exatamente 8 produtos");
if ((home.match(/class="article-card(?:\s|")/g)?.length || 0) !== 3) throw new Error("Home precisa exibir exatamente 3 artigos");
if (!home.includes("/blog/")) throw new Error("Blog não aparece na Home");
if (!home.includes("wa.me/5535999528858")) throw new Error("WhatsApp oficial não aparece na Home");

const header = home.match(/<header class="site-header">([\s\S]*?)<\/header>/)?.[1] || "";
for (const item of ["Produtos", "Categorias", "Blog", "Sobre"]) {
  if (!header.includes(`>${item}</a>`)) throw new Error(`Header sem aba principal: ${item}`);
}
for (const forbidden of ["Aplicações", "Guias", "Famílias", "Como comprar", "Aplicacoes", "Familias"]) {
  if (header.includes(forbidden)) throw new Error(`Header contém aba proibida: ${forbidden}`);
}

for (const forbidden of [
  "Catálogo público em revisão técnica",
  "Catalogo publico em revisao tecnica",
  "Imagem verificada",
  "image-filter",
  "product-placeholder",
  "Como validamos os produtos",
  "pending-review",
  "imageStatus",
  "adclean",
  "ismanga",
  "Comprar por aplicação",
  "Comprar por família",
  "Como funciona",
  "Produtos novos",
  "Produtos atualizados",
]) {
  if (home.includes(forbidden)) throw new Error(`conteúdo interno/placeholder encontrado na Home: ${forbidden}`);
}

const catalog = readFileSync("dist/produtos/index.html", "utf8");
if (catalog.includes("image-filter") || catalog.includes('name="imagem"')) throw new Error("catálogo contém filtro interno de imagem");
if (!catalog.includes("price-filter")) throw new Error("catálogo sem filtro público de preço");
if (!catalog.includes('<source srcset="/products/')) throw new Error("catálogo sem imagens locais otimizadas");

const blog = readFileSync("dist/blog/index.html", "utf8");
if ((blog.match(/class="article-card/g)?.length || 0) < 15) throw new Error("Blog precisa listar 15 artigos editoriais");
if (!blog.includes("article-cover-picture")) throw new Error("Cards do Blog precisam ter capa");
const articleFile = htmlFiles("dist/blog").find((file) => slash(file) !== "dist/blog/index.html");
if (!articleFile) throw new Error("Nenhum artigo do Blog foi gerado");
const article = readFileSync(articleFile, "utf8");
for (const expected of ["Sumário", "Referências técnicas", "Produtos relacionados"]) {
  if (!article.includes(expected)) throw new Error(`Artigo sem seção obrigatória: ${expected}`);
}
if (!article.includes("BlogPosting")) throw new Error("Artigo sem schema BlogPosting");
if (!article.includes("article-hero-cover")) throw new Error("Artigo sem capa 16:9");
if (!article.includes("Chamar no WhatsApp")) throw new Error("Artigo sem CTA de WhatsApp");

const productFile = htmlFiles("dist/produtos").find((file) => slash(file) !== "dist/produtos/index.html");
if (!productFile) throw new Error("Nenhuma página de produto foi gerada");
const product = readFileSync(productFile, "utf8");
if (!product.includes("Conteúdo relacionado")) throw new Error("Produto sem artigos relacionados");
if (/\(\s*MLB\d+\s*\)/.test(product)) throw new Error("Alt text ou conteúdo público expõe MLB de forma excessiva");

const brokenLinks = [];
for (const file of htmlFiles("dist")) {
  const html = readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith("/")) continue;
    if (href.startsWith("//")) continue;
    if (href.includes("/assets/") || href.includes("/brand/") || href.includes("/products/")) continue;
    const clean = href.replace(/^\//, "").split(/[?#]/)[0];
    const target = clean.endsWith("/") || clean === "" ? join("dist", clean, "index.html") : join("dist", clean);
    if (!existsSync(target)) brokenLinks.push(`${file} -> ${href}`);
  }
}
if (brokenLinks.length) throw new Error(`links internos quebrados:\n${brokenLinks.join("\n")}`);

console.log("Teste E2E estático v6 concluído.");

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

function slash(path) {
  return path.replaceAll("\\", "/");
}
