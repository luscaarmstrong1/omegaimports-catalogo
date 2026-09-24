import { readFileSync } from "node:fs";
import { absolute, assetUrl, escapeHtml, formatPrice, pageUrl, productImagePaths, site } from "./shared.mjs";

const frozenTemplate = readFileSync(new URL("../templates/v2-home-frozen.html", import.meta.url), "utf8");
const arrowIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`V2 frozen marker not found: ${label}`);
  return source.replace(pattern, replacement);
}

function productCard(product, index) {
  const title = escapeHtml(product.shortTitle || product.title);
  const paths = productImagePaths(product);
  const badge = index === 0 || index === 3 ? '<span class="badge-new product-card-badge">NOVO</span>' : "";
  return `            <!-- Dynamic product ${index + 1}: ${escapeHtml(product.mlbId)} -->
            <article class="product-card" data-mlb="${escapeHtml(product.mlbId)}">
              <div class="product-card-top">
                ${badge}
                <a href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver detalhes de ${title}">
                  <picture>
                    <source srcset="${paths.avif}" type="image/avif">
                    <source srcset="${paths.webp}" type="image/webp">
                    <img src="${paths.jpg}" class="product-card-img" width="210" height="210" alt="${title}" loading="${index < 2 ? "eager" : "lazy"}" decoding="async">
                  </picture>
                </a>
              </div>
              <h3 class="product-card-title"><a href="${pageUrl(`produtos/${product.slug}/`)}">${title}</a></h3>
              <div class="product-card-price">${escapeHtml(formatPrice(product))}</div>
              <div class="product-card-actions">
                <a class="btn btn-yellow" href="${escapeHtml(product.permalink)}" target="_blank" rel="noopener noreferrer sponsored" data-event="marketplace_click" data-mlb="${escapeHtml(product.mlbId)}">Ver oferta</a>
                <a class="product-details-link" href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver detalhes de ${title}"><span>Detalhes</span>${arrowIcon}</a>
              </div>
            </article>`;
}

function formatArticleDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${String(value).slice(0, 10)}T12:00:00Z`))
    .replaceAll(" de ", " ")
    .replace(".", "");
}

function articleCard(post, index) {
  const delay = index ? ` reveal-delay-${index}` : "";
  const cover = post.cover || `blog/covers/${post.slug}`;
  const href = pageUrl(`blog/${post.slug}/`);
  return `          <!-- Dynamic article ${index + 1}: ${escapeHtml(post.slug)} -->
          <article class="article-card reveal${delay}">
            <a class="article-card-cover" href="${href}" aria-label="Ler ${escapeHtml(post.title)}">
              <picture>
                <source srcset="${assetUrl(`${cover}.avif`)}" type="image/avif">
                <source srcset="${assetUrl(`${cover}.webp`)}" type="image/webp">
                <img src="${assetUrl(`${cover}.jpg`)}" width="256" height="190" alt="${escapeHtml(post.coverAlt || post.title)}" loading="lazy" decoding="async">
              </picture>
            </a>
            <div class="article-card-body">
              <span class="article-card-tag">${escapeHtml(String(post.category || "Conteúdo").toUpperCase())}</span>
              <h3 class="article-card-title"><a href="${href}">${escapeHtml(post.title)}</a></h3>
              <div class="article-card-meta"><span>${formatArticleDate(post.publishedAt)}</span><span>•</span><span>${escapeHtml(post.readingTime || "6 min de leitura")}</span></div>
            </div>
          </article>`;
}

function productionHead() {
  const title = "Componentes eletrônicos, IoT e automação | OMEGAIMPORTS";
  const description = "Componentes eletrônicos, sensores, fontes, módulos IoT e automação da OMEGAIMPORTS, com compra pelo Mercado Livre e atendimento pelo WhatsApp.";
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: site.name, url: site.productionUrl, sameAs: [site.marketplaceUrl, site.linkedinUrl] };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.productionUrl, potentialAction: { "@type": "SearchAction", target: `${site.productionUrl}produtos/?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  return `<title>${title}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${absolute("")}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${absolute("")}">
  <meta property="og:image" content="${absolute("brand/visuals/og-home.jpg")}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#030914">
  ${site.isPreview ? '<meta name="robots" content="noindex,nofollow,noarchive">' : ""}
  <link rel="icon" href="${assetUrl("v2/assets/brand/favicon.svg")}" type="image/svg+xml">
  <link rel="manifest" href="${assetUrl("manifest.webmanifest")}">
  <script type="application/ld+json">${JSON.stringify(organization)}</script>
  <script type="application/ld+json">${JSON.stringify(website)}</script>`;
}

function internalPageHead({ title, description, path, ogImage, type = "website", noindex = false, extraHead = "" }) {
  const canonical = absolute(path);
  const metaTitle = `${fitMetaText(title, 64)} | OMEGAIMPORTS`;
  const metaDescription = fitMetaDescription(description);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.productionUrl },
  };
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.productionUrl,
    sameAs: [site.marketplaceUrl, site.linkedinUrl],
  };
  return `<title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(metaTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:type" content="${escapeHtml(type)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absolute(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#030914">
  <link rel="icon" href="${assetUrl("v2/assets/brand/favicon.svg")}" type="image/svg+xml">
  <link rel="manifest" href="${assetUrl("manifest.webmanifest")}">
  ${site.isPreview ? '<meta name="robots" content="noindex,nofollow,noarchive">' : noindex ? '<meta name="robots" content="noindex,follow">' : ""}
  <script type="application/ld+json">${JSON.stringify(organization)}</script>
  <script type="application/ld+json">${JSON.stringify(webPage)}</script>
  ${extraHead}`;
}

function fitMetaText(value, max) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function fitMetaDescription(value) {
  const fallback = "Consulte o catálogo técnico da OMEGAIMPORTS e confirme as condições no anúncio oficial do Mercado Livre.";
  const text = String(value || fallback).replace(/\s+/g, " ").trim();
  const complete = text.length < 50 ? `${text} ${fallback}` : text;
  if (complete.length <= 170) return complete;
  return `${complete.slice(0, 169).replace(/\s+\S*$/, "")}.`;
}

function replaceDocumentHead(html, head, label) {
  html = replaceRequired(html, /<title>[\s\S]*?<\/title>\s*<meta name="description"[^>]*>/, head, label);
  return html.replace(/\s*<!-- Favicon Oficial -->\s*<link rel="icon"[^>]*>/, "");
}

const officialBrands = [
  { name: "Espressif", file: "espressif.png", query: "Espressif" },
  { name: "Hi-Link", file: "hi-link.png", query: "Hi-Link" },
  { name: "Arduino", file: "arduino.png", query: "Arduino" },
  { name: "STMicroelectronics", file: "st.png", query: "ST" },
  { name: "Texas Instruments", file: "texas-instruments.png", query: "Texas" },
  { name: "Nexperia", file: "nexperia.png", query: "Nexperia" },
  { name: "Seeed Studio", file: "seeed-studio.png", query: "Seeed" },
  { name: "Waveshare", file: "waveshare.png", query: "Waveshare" },
];

function wireBrandCards(html) {
  const brandCardsHtml = officialBrands
    .map(
      (b) =>
        `          <a class="brand-card" href="${pageUrl(`produtos/?q=${encodeURIComponent(b.query)}`)}"><img src="${assetUrl(`v2/assets/brands/${b.file}`)}" alt="Ver produtos ${escapeHtml(b.name)}" loading="lazy" width="110" height="28"></a>`
    )
    .join("\n");

  return html.replace(
    /<div class="brands-row reveal">[\s\S]*?<\/div>/,
    `<div class="brands-row reveal">\n${brandCardsHtml}\n        </div>`
  );
}

function wireProductionLinks(html) {
  const direct = new Map([
    ["Produtos", pageUrl("produtos/")], ["Categorias", pageUrl("categorias/")], ["Marcas", `${pageUrl()}#marcas`],
    ["Blog", pageUrl("blog/")], ["Sobre", pageUrl("sobre/")],
    ["Como comprar", pageUrl("como-comprar/")], ["Ver todos os artigos", pageUrl("blog/")],
    ["Ver todas as categorias", pageUrl("categorias/")], ["Ver todos os produtos", pageUrl("produtos/")],
    ["Explorar catálogo", pageUrl("produtos/")], ["Ver produtos", pageUrl("produtos/")],
    ["Ver kits e combos", pageUrl("produtos/?q=kits")], ["Ver todas as marcas", pageUrl("produtos/")],
    ["Sobre a OMEGAIMPORTS", pageUrl("sobre/")], ["Política de privacidade", pageUrl("politica-de-privacidade/")],
    ["Termos de uso", pageUrl("termos-de-uso/")], ["Perguntas frequentes (FAQ)", pageUrl("duvidas-frequentes/")],
    ["Privacidade", pageUrl("politica-de-privacidade/")],
    ["Formas de pagamento", pageUrl("duvidas-frequentes/#pagamento")],
    ["Prazos e entrega", pageUrl("duvidas-frequentes/#entrega")],
    ["Trocas e devoluções", pageUrl("duvidas-frequentes/#trocas-devolucoes")],
    ["Garantia", pageUrl("duvidas-frequentes/#garantia")],
    ["Mapa do site", pageUrl("sitemap.xml")], ["Todas as categorias", pageUrl("categorias/")],
    ["Componentes eletrônicos", pageUrl("categorias/componentes-eletronicos/")],
    ["Módulos IoT", pageUrl("categorias/iot-gsm-e-comunicacao/")],
    ["Sensores", pageUrl("categorias/sensores-e-medicao/")],
    ["Fontes e alimentação", pageUrl("categorias/fontes-e-alimentacao/")],
    ["Automação e controle", pageUrl("categorias/automacao-e-comando/")],
    ["Ferramentas", pageUrl("produtos/?q=ferramentas")],
    ["Protótipo e desenvolvimento", pageUrl("produtos/?q=prototipagem")],
  ]);
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (anchor, attributes, inner) => {
    const oldHref = attributes.match(/\bhref="([^"]*)"/)?.[1];
    if (oldHref === undefined) return anchor;
    const label = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const href = direct.get(label);
    const withHref = (nextHref) => `<a${attributes.replace(/\bhref="[^"]*"/, `href="${nextHref}"`)}>${inner}</a>`;
    if (href) return withHref(href);
    if (oldHref === "#" && /\bbrand-logo-link\b/.test(attributes)) return withHref(pageUrl());
    if (oldHref === "#" && /\bbrand-card\b/.test(attributes)) return withHref(pageUrl("produtos/?q=Hi-Link"));
    if (oldHref === "#") throw new Error(`V2 unresolved navigation link: ${label || attributes}`);
    return anchor;
  });
  html = html.replaceAll('href="https://wa.me/5535999528858"', `href="${site.whatsappUrl}"`);
  html = html.replaceAll('href="https://www.linkedin.com/company/omegaimports/"', `href="${site.linkedinUrl}"`);
  html = html.replaceAll('href="#categorias"', `href="${pageUrl("categorias/")}"`);
  html = html.replaceAll('href="#blog"', `href="${pageUrl("blog/")}"`);
  html = html.replaceAll('href="#sobre"', `href="${pageUrl("sobre/")}"`);
  html = html.replaceAll('href="#como-comprar"', `href="${pageUrl("como-comprar/")}"`);
  html = html.replaceAll('href="#faq"', `href="${pageUrl("duvidas-frequentes/")}"`);
  return html;
}

function applyVerifiedClaims(html) {
  return html
    .replaceAll("Entrega para todo o Brasil", "Envio pelo Mercado Livre")
    .replaceAll("com rastreamento", "rastreado no anúncio")
    .replaceAll("Compra segura", "Compra no Mercado Livre")
    .replaceAll("e dados protegidos", "pelo checkout oficial")
    .replaceAll("Até 12x no cartão", "Condições no anúncio")
    .replaceAll("ou PIX com desconto", "parcelamento e PIX")
    .replaceAll("Mais de 15 mil", "Catálogo especializado")
    .replaceAll("clientes e projetos <!-- MOCKUP CLAIM — validar antes de produção -->", "para projetos reais")
    .replaceAll("Qualidade garantida", "Informações verificadas")
    .replaceAll("ou seu dinheiro de volta", "em cada anúncio");
}

function wireCategoryCards(html) {
  const destinations = [
    pageUrl("categorias/iot-gsm-e-comunicacao/"),
    pageUrl("categorias/sensores-e-medicao/"),
    pageUrl("categorias/fontes-e-alimentacao/"),
    pageUrl("categorias/automacao-e-comando/"),
    pageUrl("categorias/gps-e-localizacao/"),
    pageUrl("produtos/?q=display"),
    pageUrl("categorias/componentes-eletronicos/"),
    pageUrl("categorias/conectores-e-instalacao/"),
  ];
  let index = 0;
  return html.replace(/<article class="category-card([^"]*)">([\s\S]*?)<\/article>/g, (tag, classes, content) => {
    const destination = destinations[index++];
    return destination
      ? `<a class="category-card${classes}" href="${destination}">${content}</a>`
      : tag;
  });
}

export function renderV2Home({ products, posts }) {
  let html = frozenTemplate;
  html = replaceDocumentHead(html, productionHead(), "home metadata");
  html = replaceRequired(html, /<body>/, '<body class="home-v2">', "home body class");
  html = html.replaceAll("./css/", assetUrl("v2/css/"));
  html = html.replaceAll("./assets/", assetUrl("v2/assets/"));
  html = html.replaceAll('<script type="module" src="./js/app.js"></script>', `<script defer src="${assetUrl("v2/runtime.js")}"></script>`);
  html = replaceRequired(
    html,
    /(<div class="products-carousel"[^>]*>)[\s\S]*?(<\/div>\s*<button type="button" class="carousel-nav-btn carousel-next")/,
    `$1\n${products.slice(0, 6).map(productCard).join("\n\n")}\n          $2`,
    "product cards",
  );
  html = replaceRequired(html, /\s*<!-- Article 1:[\s\S]*?<\/article>\s*<!-- Article 4:[\s\S]*?<\/article>/, `\n${posts.slice(0, 4).map(articleCard).join("\n\n")}`, "article cards");
  html = html.replaceAll('<form class="header-search" role="search">', `<form class="header-search" action="${pageUrl("produtos/")}" method="get" role="search">`);
  html = html.replaceAll('<form class="header-search drawer-search" role="search">', `<form class="header-search drawer-search" action="${pageUrl("produtos/")}" method="get" role="search">`);
  html = html.replaceAll('<form class="hero-search-box" role="search">', `<form class="hero-search-box" action="${pageUrl("produtos/")}" method="get" role="search">`);
  html = html.replace(/(<form class="(?:header-search|hero-search-box)[^>]*>[\s\S]*?<input)(?![^>]*\bname=)/g, '$1 name="q"');
  html = html.replaceAll('<span id="copyright-year">2026</span>', `<span id="copyright-year">${new Date().getFullYear()}</span>`);
  return wireCategoryCards(wireProductionLinks(wireBrandCards(applyVerifiedClaims(html))));
}

export function renderV2InternalPage({ title, description, path, body, pageClass = "content-page", ogImage = "brand/visuals/og-home.jpg", type = "website", noindex = false, extraHead = "" }) {
  let html = frozenTemplate;
  html = replaceDocumentHead(html, internalPageHead({ title, description, path, ogImage, type, noindex, extraHead }), "internal metadata");
  html = html.replaceAll("./css/", assetUrl("v2/css/"));
  html = html.replaceAll("./assets/", assetUrl("v2/assets/"));
  html = html.replaceAll('<script type="module" src="./js/app.js"></script>', `<script defer src="${assetUrl("v2/runtime.js")}"></script>`);
  html = html.replace("</head>", `  <link rel="stylesheet" href="${assetUrl("assets/internal-pages.css")}">\n</head>`);
  html = html.replace("</body>", `  <script defer src="${assetUrl("assets/site.js")}"></script>\n</body>`);
  html = html.replace("<body>", `<body class="v2-internal ${escapeHtml(pageClass)}">`);
  html = replaceRequired(html, /<main id="main-content">[\s\S]*?<\/main>/, `<main id="main-content">${body}</main>`, "internal main");
  html = html.replaceAll('<form class="header-search" role="search">', `<form class="header-search" action="${pageUrl("produtos/")}" method="get" role="search">`);
  html = html.replaceAll('<form class="header-search drawer-search" role="search">', `<form class="header-search drawer-search" action="${pageUrl("produtos/")}" method="get" role="search">`);
  html = html.replace(/(<form class="header-search[^>]*>[\s\S]*?<input)(?![^>]*\bname=)/g, '$1 name="q"');
  html = html.replaceAll('<span id="copyright-year">2026</span>', `<span id="copyright-year">${new Date().getFullYear()}</span>`);
  return wireCategoryCards(wireProductionLinks(applyVerifiedClaims(html)));
}
