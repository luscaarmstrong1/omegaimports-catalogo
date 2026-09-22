import { readFileSync } from "node:fs";

export const rootUrl = new URL("../", import.meta.url);

export const site = {
  name: "OMEGAIMPORTS",
  founded: "23 de dezembro de 2024",
  tagline: "Componentes eletrônicos, IoT e automação com curadoria técnica.",
  site: "https://luscaarmstrong1.github.io",
  base: "/omegaimports-catalogo",
  productionUrl: "https://luscaarmstrong1.github.io/omegaimports-catalogo/",
  marketplaceUrl: "https://www.mercadolivre.com.br/pagina/omegaimports",
  linkedinUrl: "https://www.linkedin.com/company/omegaimports/",
  whatsappNumber: "+55 35 99952-8858",
  whatsappUrl: "https://wa.me/5535999528858?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20OMEGAIMPORTS%20e%20gostaria%20de%20ajuda%20para%20escolher%20um%20produto.",
};

export const categories = [
  ["Placas e microcontroladores", "placas-e-microcontroladores", "ESP32, módulos de desenvolvimento e acessórios para prototipagem.", "cpu"],
  ["IoT, GSM e comunicação", "iot-gsm-e-comunicacao", "GSM/GPRS, RF, antenas, pigtails e conectividade para telemetria.", "radio"],
  ["GPS e localização", "gps-e-localizacao", "Módulos GPS e antenas para rastreamento, telemetria e navegação.", "map-pin"],
  ["Sensores e medição", "sensores-e-medicao", "Sensores de corrente, transformadores e leitura de energia.", "gauge"],
  ["Fontes e alimentação", "fontes-e-alimentacao", "Fontes AC/DC, reguladores e alimentação compacta para circuitos.", "zap"],
  ["Automação e comando", "automacao-e-comando", "Contatores, relés, supressores e componentes de comando.", "circuit-board"],
  ["Componentes eletrônicos", "componentes-eletronicos", "Resistores, varistores, headers, chaves e placas de prototipagem.", "cpu"],
  ["Conectores e instalação", "conectores-e-instalacao", "Split Bolt, prensa-cabos, conectores e itens de montagem.", "cable"],
  ["Instrumentos de bancada", "instrumentos-de-bancada", "Fontes de bancada, geradores de função e instrumentos de teste.", "gauge"],
].map(([label, slug, description, icon]) => ({ label, slug, description, icon }));

export const familyCards = [
  ["TTGO T-Call", "ttgo-t-call", "Módulos ESP32 com SIM800L para conectividade GSM."],
  ["GPS NEO-6M", "gps-neo-6m", "Módulos e kits para localização, rastreamento e telemetria."],
  ["Hi-Link HLK-PM01", "hi-link-hlk-pm01", "Fontes AC/DC compactas para integração em circuitos."],
  ["SCT-013 e ZMCT123A", "sensores-de-corrente", "Sensores e transformadores para medição de corrente."],
  ["Contatores", "contatores", "Comando elétrico, supressores e acionamento."],
  ["Split Bolt", "split-bolt", "Conectores para emenda, montagem e instalação."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const applicationCards = [
  ["Monitoramento de energia", "monitoramento-de-energia", "Sensores, transformadores e fontes para leitura e supervisão."],
  ["Telemetria e conectividade", "telemetria-e-conectividade", "GSM, GPS, antenas e módulos para comunicação em campo."],
  ["Automação e comando", "automacao-e-comando", "Contatores, supressores e componentes de acionamento."],
  ["Prototipagem eletrônica", "prototipagem-eletronica", "Placas, headers, chaves, resistores e componentes de bancada."],
  ["Alimentação de circuitos", "alimentacao-de-circuitos", "Fontes AC/DC compactas e fontes de bancada para validação."],
  ["Instrumentação de bancada", "instrumentacao-de-bancada", "Equipamentos de teste, ajuste e manutenção eletrônica."],
].map(([label, slug, description]) => ({ label, slug, description }));

export function loadProducts({ all = false } = {}) {
  const products = JSON.parse(readFileSync(new URL("../src/data/products.json", import.meta.url), "utf8"));
  return all ? products : products.filter((product) => product.status === "published");
}

export function loadBlogPosts() {
  return JSON.parse(readFileSync(new URL("../src/data/blog-posts.json", import.meta.url), "utf8"));
}

export function pageUrl(path = "") {
  const clean = String(path).replace(/^\/+/, "");
  return `${site.base}/${clean}`.replace(/\/{2,}/g, "/");
}

function navUrl(path = "") {
  const url = pageUrl(path);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=20260714`;
}

export function assetUrl(path = "") {
  return pageUrl(path);
}

export const href = pageUrl;

export function absolute(path = "") {
  return `${site.site}${pageUrl(path)}`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeText(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function formatPrice(product) {
  if (!product.price || !product.priceLastVerifiedAt) return "Consulte no anúncio";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: product.currency || "BRL" }).format(product.price);
}

export function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

export function productFormat(product) {
  return product.quantity > 1 ? `Kit com ${product.quantity}` : "Unidade";
}

export function conditionLabel(product) {
  return product.condition === "novo" ? "Novo" : product.condition === "usado" ? "Usado" : "A confirmar";
}

export function productAlt(product) {
  const kit = product.quantity > 1 ? `Kit com ${product.quantity} unidades` : "Unidade";
  return `${kit} - ${product.shortTitle || product.title}`;
}

export function productImagePaths(product) {
  const base = `products/${product.mlbId}/optimized/main`;
  return {
    avif: assetUrl(`${base}.avif`),
    webp: assetUrl(`${base}.webp`),
    jpg: assetUrl(`${base}.jpg`),
  };
}

export function productPicture(product, { className = "product-picture", width = 480, height = 480, loading = "lazy", fetchpriority = "auto", sizes = "(min-width: 1180px) 25vw, (min-width: 760px) 33vw, 100vw" } = {}) {
  const paths = productImagePaths(product);
  const attrs = [
    `src="${paths.jpg}"`,
    `alt="${escapeHtml(productAlt(product))}"`,
    `width="${width}"`,
    `height="${height}"`,
    `loading="${loading}"`,
    `decoding="async"`,
    fetchpriority !== "auto" ? `fetchpriority="${fetchpriority}"` : "",
  ].filter(Boolean).join(" ");
  return `<picture class="${className}">
    <source srcset="${paths.avif}" type="image/avif" sizes="${escapeHtml(sizes)}">
    <source srcset="${paths.webp}" type="image/webp" sizes="${escapeHtml(sizes)}">
    <img ${attrs}>
  </picture>`;
}

export function blogCoverPicture(post, { className = "article-cover-picture", width = 800, height = 450, loading = "lazy", fetchpriority = "auto", sizes = "(min-width: 900px) 33vw, 100vw" } = {}) {
  const base = post.cover || `blog/covers/${post.slug}`;
  return `<picture class="${className}">
    <source srcset="${assetUrl(`${base}.avif`)}" type="image/avif" sizes="${escapeHtml(sizes)}">
    <source srcset="${assetUrl(`${base}.webp`)}" type="image/webp" sizes="${escapeHtml(sizes)}">
    <img src="${assetUrl(`${base}.jpg`)}" alt="${escapeHtml(post.coverAlt || `Capa do artigo ${post.title}`)}" width="${width}" height="${height}" loading="${loading}" decoding="async"${fetchpriority !== "auto" ? ` fetchpriority="${fetchpriority}"` : ""}>
  </picture>`;
}

export function icon(name, className = "icon") {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    "circuit-board": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01M8 8h8v8H8z"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2a6 6 0 0 1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.5"/><path d="M19.1 4.9c3.9 3.9 3.9 10.2 0 14.1"/>',
    "map-pin": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/><path d="M12 3v2M4.6 7.6 6 9M19.4 7.6 18 9"/>',
    zap: '<path d="M13 2 3 14h8l-1 8 11-14h-8l1-6Z"/>',
    cable: '<path d="M17 7 7 17"/><path d="M14 4l6 6"/><path d="M4 14l6 6"/><path d="m7 17 3 3"/><path d="m14 4 3 3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    package: '<path d="m7.5 4.3 9 5.2"/><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4v15.5A2.5 2.5 0 0 1 6.5 17H20V4Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M2 14h4M10 8h4M18 16h4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    "credit-card": '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    refresh: '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "shopping-cart": '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    cookie: '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><circle cx="8.5" cy="8.5" r=".5" fill="currentColor"/><circle cx="16" cy="15.5" r=".5" fill="currentColor"/><circle cx="12" cy="12" r=".5" fill="currentColor"/><circle cx="11" cy="17" r=".5" fill="currentColor"/><circle cx="7" cy="14" r=".5" fill="currentColor"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2"/><path d="m18 10 1.7-1.7a1 1 0 0 0 0-1.4L17 4.2a1 1 0 0 0-1.4 0L14 6"/><path d="m2 14 6 6"/><path d="m7 19 3-3"/><path d="m14.5 12.5 2-2a1 1 0 0 0 0-1.4L13.8 6.4a1 1 0 0 0-1.4 0L10 8.8"/>',
    whatsapp: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    "chat-bubbles": '<path d="M14 9a2 2 0 0 1-2 2H6l-3 3V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v7l-3-3h-5a2 2 0 0 1-2-2v-1"/>',
  };
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.cpu}</svg>`;
}

export function productCard(product, index = 0, { featured = false } = {}) {
  const cardClass = featured ? "product-card product-card--lead" : "product-card";
  return `<article class="${cardClass}" data-title="${escapeHtml(normalizeText(product.title))}" data-family="${escapeHtml(normalizeText(product.familyId || ""))}" data-category="${product.internalCategorySlug}" data-condition="${product.condition}" data-package="${product.packageType}" data-quantity="${product.quantity}" data-price="${product.price || ""}" data-mlb="${product.mlbId}" data-reveal>
    <a class="product-media" href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver detalhes de ${escapeHtml(product.shortTitle || product.title)}">
      <span class="product-chip">${escapeHtml(product.internalCategory)}</span>
      ${productPicture(product, { loading: index < 4 ? "eager" : "lazy", fetchpriority: index === 0 ? "high" : "auto" })}
    </a>
    <div class="product-content">
      <p class="product-category">${escapeHtml(product.internalCategory)}</p>
      <h3><a href="${pageUrl(`produtos/${product.slug}/`)}">${escapeHtml(product.title)}</a></h3>
      <p class="product-price">${formatPrice(product)}</p>
      <div class="card-actions">
        <a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored" data-event="marketplace_click" data-mlb="${product.mlbId}" data-title="${escapeHtml(product.title)}" data-category="${escapeHtml(product.internalCategory)}" data-position="${index + 1}">Ver oferta ${icon("external", "btn-icon")}</a>
        <a class="text-link" href="${pageUrl(`produtos/${product.slug}/`)}">Detalhes ${icon("arrow-right", "text-link-icon")}</a>
      </div>
    </div>
  </article>`;
}

export function pageShell({ title, description, path = "", body, extraHead = "", ogImage = "brand/visuals/og-home.jpg", type = "website" }) {
  const canonical = absolute(path);
  const isHome = !path;
  const metaTitle = fitText(title, 72);
  const metaDescription = fitDescription(description);
  const headerSearch = "";
  const mobileSearch = `<div class="mobile-search-panel" id="mobile-search-panel" hidden>
    <form action="${pageUrl("produtos/")}" role="search">
      ${icon("search", "search-icon")}
      <label class="sr-only" for="mobile-site-search">Buscar no catálogo</label>
      <input id="mobile-site-search" name="q" type="search" placeholder="Buscar componente..." autocomplete="off">
      <button class="mobile-search-close" type="button" aria-label="Fechar busca">${icon("x", "btn-icon")}</button>
    </form>
  </div>`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metaTitle)} | OMEGAIMPORTS</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(metaTitle)} | OMEGAIMPORTS">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absolute(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#071426">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="${assetUrl("brand/favicon.svg")}" type="image/svg+xml">
  <link rel="icon" href="${assetUrl("brand/favicon-32.png")}" sizes="32x32">
  <link rel="apple-touch-icon" href="${assetUrl("brand/apple-touch-icon.png")}">
  <link rel="manifest" href="${assetUrl("manifest.webmanifest")}">
  <link rel="stylesheet" href="${assetUrl("assets/site.css")}">
  <link rel="stylesheet" href="${assetUrl("assets/internal-pages.css")}">
  <script defer src="${assetUrl("assets/site.js")}"></script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.productionUrl,
    sameAs: [site.marketplaceUrl, site.linkedinUrl],
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.productionUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.productionUrl}produtos/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  })}</script>
  ${extraHead}
</head>
<body class="${isHome ? "home-shell" : "inner-shell"}">
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header" data-site-header>
    <a class="brand brand--header" href="${pageUrl()}"><img src="${assetUrl("brand/logo-horizontal-light.svg")}" width="250" height="69" alt="OMEGAIMPORTS"></a>
    ${headerSearch}
    <nav class="main-nav" aria-label="Principal">
      <a href="${pageUrl("produtos/")}">Produtos</a>
      <a href="${navUrl("categorias/")}">Categorias</a>
      <a href="${navUrl("blog/")}">Blog</a>
      <a href="${navUrl("sobre/")}">Sobre</a>
      <a href="${pageUrl("versao-atual/")}">Versão atual</a>
    </nav>
    <a class="header-cta marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Loja no Mercado Livre ${icon("external", "btn-icon")}</a>
    <button class="search-toggle" type="button" aria-controls="mobile-search-panel" aria-expanded="false" aria-label="Abrir busca">${icon("search", "btn-icon")}</button>
    <button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false" aria-label="Abrir menu">${icon("menu", "btn-icon")}</button>
  </header>
  ${mobileSearch}
  <div class="mobile-menu-overlay" id="mobile-menu-overlay" hidden></div>
  <aside class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu principal" hidden>
    <div class="mobile-menu-head">
      <span class="mobile-menu-title">OMEGAIMPORTS</span>
      <button class="mobile-menu-close" type="button" aria-label="Fechar menu">${icon("x", "btn-icon")}</button>
    </div>
    <nav aria-label="Menu móvel">
      <a href="${pageUrl("produtos/")}">Produtos</a>
      <a href="${navUrl("categorias/")}">Categorias</a>
      <a href="${navUrl("blog/")}">Blog</a>
      <a href="${navUrl("sobre/")}">Sobre</a>
      <a href="${pageUrl("versao-atual/")}">Versão atual</a>
      <a class="whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp ${icon("message", "btn-icon")}</a>
      <a class="marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Loja no Mercado Livre ${icon("external", "btn-icon")}</a>
      <a href="${site.linkedinUrl}" target="_blank" rel="noopener noreferrer">LinkedIn ${icon("external", "btn-icon")}</a>
    </nav>
  </aside>
  <main id="conteudo">${body}</main>
  <a class="whatsapp-float whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="Chamar OMEGAIMPORTS no WhatsApp">${icon("message", "btn-icon")}</a>
  <footer class="footer">
    <div>
      <span class="footer-brand"><img src="${assetUrl("brand/logo-horizontal-light.svg")}" width="210" height="58" alt="OMEGAIMPORTS"></span>
      <p>Componentes eletrônicos, IoT, automação e bancada organizados para compra técnica.</p>
    </div>
    <details class="footer-group" open>
      <summary>Catálogo</summary>
      <a href="${pageUrl("produtos/")}">Produtos</a>
      <a href="${navUrl("categorias/")}">Categorias</a>
    </details>
    <details class="footer-group" open>
      <summary>Conteúdo</summary>
      <a href="${navUrl("blog/")}">Blog</a>
      <a href="${navUrl("sobre/")}">Sobre</a>
      <a href="${site.linkedinUrl}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="${pageUrl("como-comprar/")}">Como comprar</a>
      <a href="${pageUrl("versao-atual/")}">Versão atual</a>
    </details>
    <details class="footer-group" open>
      <summary>Atendimento</summary>
      <a class="whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp ${site.whatsappNumber}</a>
      <a href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Mercado Livre</a>
      <a href="${site.linkedinUrl}" target="_blank" rel="noopener noreferrer">LinkedIn oficial</a>
      <a href="${pageUrl("politica-de-privacidade/")}">Política de privacidade</a>
      <a href="${pageUrl("termos-de-uso/")}">Termos de uso</a>
    </details>
    <p class="fine-print">Preços, estoque, frete e condições são confirmados no anúncio oficial do Mercado Livre.</p>
    <p class="copyright">© 2026 OMEGAIMPORTS. Todos os direitos reservados.</p>
  </footer>
</body>
</html>`;
}

function fitText(value = "", max = 72) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function fitDescription(value = "") {
  const fallback = "Catálogo técnico OMEGAIMPORTS com componentes eletrônicos, IoT, sensores, fontes e automação, com compra finalizada no Mercado Livre.";
  const text = String(value || fallback).replace(/\s+/g, " ").trim();
  const base = text.length < 55 ? `${text} ${fallback}` : text;
  if (base.length <= 168) return base;
  return `${base.slice(0, 165).replace(/\s+\S*$/, "")}.`;
}
