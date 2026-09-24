import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { loadProducts } from "./shared.mjs";

const failures = [];
const basePath = "/omegaimports-catalogo/";
const forbidden = [
  "javascript:void(0)",
  "/versao-atual/",
  "/versao-anterior/",
  "Shopee",
  "Minha Conta",
  "Carrinho de compras",
  "Cadastro de newsletter em breve",
  "COMPRA 100% SEGURA",
];

for (const product of loadProducts({ all: true })) {
  try {
    const url = new URL(product.permalink);
    if (url.protocol !== "https:" || !url.hostname.endsWith("mercadolivre.com.br")) failures.push(`${product.mlbId}: domínio inválido`);
    if (!product.permalink.includes(product.mlbId.replace("MLB", ""))) failures.push(`${product.mlbId}: URL não contém MLB`);
  } catch {
    failures.push(`${product.mlbId}: URL inválida`);
  }
}

for (const file of htmlFiles("dist")) {
  const html = readFileSync(file, "utf8");
  for (const value of forbidden) if (html.includes(value)) failures.push(`${file}: conteúdo proibido (${value})`);
  if (/<a\b[^>]*\baria-disabled=/i.test(html)) failures.push(`${file}: link de navegação com aria-disabled`);
  for (const [, href] of html.matchAll(/\bhref="([^"]*)"/g)) validateTarget(file, href, "href");
  for (const [, href] of html.matchAll(/\bdata-href="([^"]*)"/g)) validateTarget(file, href, "data-href");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Auditoria completa de navegação concluída sem links mortos.");

function validateTarget(file, rawHref, attribute) {
  const href = rawHref.trim();
  if (!href || href === "#") {
    failures.push(`${file}: ${attribute} vazio ou placeholder`);
    return;
  }
  if (/^(https?:|mailto:|tel:)/i.test(href) || href.startsWith("#") || href.startsWith("data:")) return;

  let pathname;
  try {
    pathname = new URL(href, "https://example.test/omegaimports-catalogo/").pathname;
  } catch {
    failures.push(`${file}: ${attribute} inválido (${href})`);
    return;
  }
  if (!pathname.startsWith(basePath)) return;
  const relative = decodeURIComponent(pathname.slice(basePath.length));
  const target = relative === "" || relative.endsWith("/")
    ? join("dist", relative, "index.html")
    : join("dist", relative);
  if (!existsSync(target)) failures.push(`${file}: ${attribute} aponta para destino inexistente (${href})`);
}

function htmlFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...htmlFiles(path));
    else if (extname(path) === ".html") files.push(path);
  }
  return files;
}
