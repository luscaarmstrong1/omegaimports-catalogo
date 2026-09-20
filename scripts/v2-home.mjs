import { readFileSync } from "node:fs";
import { absolute, assetUrl, escapeHtml, formatPrice, pageUrl, productImagePaths, site } from "./shared.mjs";

const frozenTemplate = readFileSync(new URL("../templates/v2-home-frozen.html", import.meta.url), "utf8");
const heartIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
const cartIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;

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
                <button type="button" class="product-card-fav" aria-label="Favoritar ${title}">${heartIcon}</button>
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
                <a class="btn-icon-cart" href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver detalhes de ${title}">${cartIcon}</a>
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
  <link rel="icon" href="${assetUrl("v2/assets/brand/favicon.svg")}" type="image/svg+xml">
  <link rel="manifest" href="${assetUrl("manifest.webmanifest")}">
  <script type="application/ld+json">${JSON.stringify(organization)}</script>
  <script type="application/ld+json">${JSON.stringify(website)}</script>`;
}

function wireProductionLinks(html) {
  const direct = new Map([
    ["Produtos", pageUrl("produtos/")], ["Categorias", pageUrl("categorias/")],
    ["Blog", pageUrl("blog/")], ["Sobre", pageUrl("sobre/")],
    ["Como comprar", pageUrl("como-comprar/")], ["Ver todos os artigos", pageUrl("blog/")],
    ["Ver todas as categorias", pageUrl("categorias/")], ["Ver todos os produtos", pageUrl("produtos/")],
    ["Explorar catálogo", pageUrl("produtos/")], ["Ver produtos", pageUrl("produtos/")],
    ["Ver kits e combos", pageUrl("produtos/?q=kits")], ["Ver todas as marcas", pageUrl("produtos/")],
    ["Sobre a OMEGAIMPORTS", pageUrl("sobre/")], ["Política de privacidade", pageUrl("politica-de-privacidade/")],
    ["Termos de uso", pageUrl("termos-de-uso/")], ["Perguntas frequentes (FAQ)", pageUrl("duvidas-frequentes/")],
    ["Mapa do site", pageUrl("sitemap.xml")], ["Todas as categorias", pageUrl("categorias/")],
  ]);
  html = html.replace(/<a href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (anchor, oldHref, attributes, inner) => {
    const label = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const href = direct.get(label);
    return href ? `<a href="${href}"${attributes}>${inner}</a>` : anchor;
  });
  html = html.replaceAll('href="https://wa.me/5535999528858"', `href="${site.whatsappUrl}"`);
  html = html.replaceAll('href="https://www.linkedin.com/company/omegaimports/"', `href="${site.linkedinUrl}"`);
  html = html.replaceAll('href="#categorias"', `href="${pageUrl("categorias/")}"`);
  html = html.replaceAll('href="#blog"', `href="${pageUrl("blog/")}"`);
  html = html.replaceAll('href="#sobre"', `href="${pageUrl("sobre/")}"`);
  html = html.replaceAll('href="#como-comprar"', `href="${pageUrl("como-comprar/")}"`);
  html = html.replaceAll('href="#faq"', `href="${pageUrl("duvidas-frequentes/")}"`);
  return html.replaceAll('href="#"', `href="${pageUrl()}"`);
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
  return html.replace(/<article class="category-card([^"]*)">/g, (tag, classes) => {
    const destination = destinations[index++];
    return destination
      ? `<article class="category-card${classes}" data-href="${destination}">`
      : tag;
  });
}

export function renderV2Home({ products, posts }) {
  let html = frozenTemplate;
  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, productionHead(), "head title");
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
  return wireCategoryCards(wireProductionLinks(html));
}
