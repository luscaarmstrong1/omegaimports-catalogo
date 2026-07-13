import { readFileSync } from "node:fs";

export const rootUrl = new URL("../", import.meta.url);

export const site = {
  name: "OMEGAIMPORTS",
  founded: "23 de dezembro de 2024",
  tagline: "Tecnologia, componentes e cuidado em cada pedido.",
  site: "https://luscaarmstrong1.github.io",
  base: "/omegaimports-catalogo",
  productionUrl: "https://luscaarmstrong1.github.io/omegaimports-catalogo/",
  marketplaceUrl: "https://www.mercadolivre.com.br/pagina/omegaimports",
};

export const categories = [
  ["Placas e Microcontroladores", "placas-e-microcontroladores", "ESP32, modulos de desenvolvimento e acessorios para prototipagem.", "microcontroller"],
  ["IoT, GSM e Comunicacao", "iot-gsm-e-comunicacao", "GSM/GPRS, RF, antenas, pigtails e conectividade para telemetria.", "antenna"],
  ["GPS e Localizacao", "gps-e-localizacao", "Modulos GPS e antenas para rastreamento, telemetria e navegacao.", "gps"],
  ["Sensores e Medicao", "sensores-e-medicao", "Sensores de corrente, transformadores e medicao de energia.", "meter"],
  ["Fontes e Alimentacao", "fontes-e-alimentacao", "Fontes AC/DC, reguladores e alimentacao compacta.", "power"],
  ["Automacao e Comando", "automacao-e-comando", "Contatores, reles, supressores e componentes de comando.", "command"],
  ["Componentes Eletronicos", "componentes-eletronicos", "Resistores, varistores, headers, chaves e placas de prototipagem.", "components"],
  ["Conectores e Instalacao", "conectores-e-instalacao", "Split Bolt, prensa-cabos, conectores e itens de montagem.", "connectors"],
  ["Instrumentos de Bancada", "instrumentos-de-bancada", "Fontes de bancada, geradores de funcao e instrumentos de teste.", "instruments"],
].map(([label, slug, description, icon]) => ({ label, slug, description, icon }));

export const familyCards = [
  ["TTGO T-Call", "ttgo-t-call", "Ofertas unitarias, abertas e kits de modulos ESP32 + SIM800L."],
  ["GPS NEO-6M", "gps-neo-6m", "Modulos e kits para localizacao, rastreamento e telemetria."],
  ["Hi-Link HLK-PM01", "hi-link-hlk-pm01", "Fontes AC/DC compactas para integracao em circuitos."],
  ["Sensores de corrente", "sensores-de-corrente", "SCT-013, ZMCT123A e opcoes para medicao de energia."],
  ["Contatores", "contatores", "Comando eletrico, supressores e acionamento."],
  ["Split Bolt", "split-bolt", "Conectores para emenda, montagem e instalacao."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const applicationCards = [
  ["Telemetria e conectividade", "telemetria-e-conectividade", "GSM, GPS, antenas e modulos para comunicacao em campo."],
  ["Monitoramento de energia", "monitoramento-de-energia", "Sensores e transformadores para leitura de corrente e energia."],
  ["Automacao e comando", "automacao-e-comando", "Contatores, supressores e componentes de acionamento."],
  ["Prototipagem eletronica", "prototipagem-eletronica", "Placas, headers, chaves, resistores e componentes de bancada."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const guides = [
  ["como-escolher-sensor-corrente", "Como escolher um sensor de corrente", "Criterios praticos para comparar faixa, instalacao, tipo de saida e aplicacao."],
  ["ttgo-tcall-alimentacao-rede-2g-integracao", "TTGO T-Call: alimentacao, rede 2G e integracao", "Pontos de atencao ao usar ESP32, SIM800L, USB-C, bateria e antena em projetos IoT."],
  ["como-escolher-fonte-ac-dc-compacta", "Como escolher uma fonte AC/DC compacta", "Como avaliar tensao, corrente, isolamento, ambiente e margem de operacao."],
].map(([slug, title, summary]) => ({ slug, title, summary }));

export function loadProducts({ all = false } = {}) {
  const products = JSON.parse(readFileSync(new URL("../src/data/products.json", import.meta.url), "utf8"));
  return all ? products : products.filter((product) => product.status === "published");
}

export function pageUrl(path = "") {
  const clean = String(path).replace(/^\/+/, "");
  return `${site.base}/${clean}`.replace(/\/{2,}/g, "/");
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
  if (!product.price || !product.priceLastVerifiedAt) return "Consulte no anuncio";
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
  return `${kit} - ${product.shortTitle || product.title} (${product.mlbId})`;
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

export function productCard(product, index = 0) {
  const description = product.cardDescription || "";
  return `<article class="product-card" data-title="${escapeHtml(normalizeText(product.title))}" data-family="${escapeHtml(normalizeText(product.familyId || ""))}" data-category="${product.internalCategorySlug}" data-condition="${product.condition}" data-package="${product.packageType}" data-quantity="${product.quantity}" data-price="${product.price || ""}" data-mlb="${product.mlbId}">
    <a class="product-media" href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver detalhes de ${escapeHtml(product.shortTitle || product.title)}">
      ${productPicture(product, { loading: index < 4 ? "eager" : "lazy", fetchpriority: index === 0 ? "high" : "auto" })}
    </a>
    <div class="product-content">
      <p class="eyebrow">${escapeHtml(product.internalCategory)}</p>
      <h3>${escapeHtml(product.title)}</h3>
      ${description ? `<p class="card-description">${escapeHtml(description)}</p>` : ""}
      <dl class="product-meta">
        <div><dt>Formato</dt><dd>${productFormat(product)}</dd></div>
        <div><dt>Condicao</dt><dd><span class="condition-chip">${conditionLabel(product)}</span></dd></div>
      </dl>
      <p class="product-price">${formatPrice(product)}</p>
      ${product.priceLastVerifiedAt ? `<p class="updated-at">Atualizado em ${formatDate(product.priceLastVerifiedAt)}</p>` : ""}
      <div class="card-actions">
        <a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored" data-event="marketplace_click" data-mlb="${product.mlbId}" data-title="${escapeHtml(product.title)}" data-category="${escapeHtml(product.internalCategory)}" data-position="${index + 1}">Ver oferta</a>
        <a class="secondary-action" href="${pageUrl(`produtos/${product.slug}/`)}">Detalhes</a>
      </div>
    </div>
  </article>`;
}

export function pageShell({ title, description, path = "", body, extraHead = "", ogImage = "brand/visuals/og-home.jpg" }) {
  const canonical = absolute(path);
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | OMEGAIMPORTS</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)} | OMEGAIMPORTS">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absolute(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#071426">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="${assetUrl("brand/favicon.svg")}" type="image/svg+xml">
  <link rel="icon" href="${assetUrl("brand/favicon-32.png")}" sizes="32x32">
  <link rel="apple-touch-icon" href="${assetUrl("brand/apple-touch-icon.png")}">
  <link rel="stylesheet" href="${assetUrl("assets/site.css")}">
  <script defer src="${assetUrl("assets/site.js")}"></script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.productionUrl,
    sameAs: [site.marketplaceUrl],
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
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteudo</a>
  <div class="topbar">Catalogo atualizado com ofertas oficiais da OMEGAIMPORTS no Mercado Livre</div>
  <header class="site-header">
    <a class="brand" href="${pageUrl()}"><img src="${assetUrl("brand/logo-horizontal.webp")}" width="220" height="64" alt="OMEGAIMPORTS"></a>
    <form class="header-search" action="${pageUrl("produtos/")}" role="search">
      <label class="sr-only" for="site-search">Buscar no catalogo</label>
      <input id="site-search" name="q" type="search" placeholder="ESP32, GPS, SCT-013..." autocomplete="off">
    </form>
    <nav class="main-nav" aria-label="Principal">
      <a href="${pageUrl("produtos/")}">Produtos</a>
      <a href="${pageUrl("categorias/")}">Categorias</a>
      <a href="${pageUrl("aplicacoes/")}">Aplicacoes</a>
      <a href="${pageUrl("guias/")}">Guias</a>
    </nav>
    <a class="header-cta marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Loja no Mercado Livre</a>
    <button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false">Menu</button>
  </header>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <a href="${pageUrl("produtos/")}">Produtos</a>
    <a href="${pageUrl("categorias/")}">Categorias</a>
    <a href="${pageUrl("aplicacoes/")}">Aplicacoes</a>
    <a href="${pageUrl("guias/")}">Guias</a>
    <a href="${pageUrl("sobre/")}">Sobre</a>
    <a href="${pageUrl("como-comprar/")}">Como comprar</a>
    <a class="marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Loja no Mercado Livre</a>
  </div>
  <main id="conteudo">${body}</main>
  <footer class="footer">
    <div>
      <img src="${assetUrl("brand/logo-horizontal.webp")}" width="230" height="68" alt="OMEGAIMPORTS">
      <p>OMEGAIMPORTS - tecnologia, componentes e cuidado em cada pedido.</p>
      <p>Operacao fundada em 23 de dezembro de 2024, especializada em componentes eletroeletronicos, IoT, telemetria, energia, prototipagem e automacao.</p>
    </div>
    <nav aria-label="Rodape">
      <a href="${pageUrl("produtos/")}">Produtos</a>
      <a href="${pageUrl("familias/")}">Familias</a>
      <a href="${pageUrl("categorias/")}">Categorias</a>
      <a href="${pageUrl("aplicacoes/")}">Aplicacoes</a>
      <a href="${pageUrl("guias/")}">Guias tecnicos</a>
      <a href="${pageUrl("sobre/")}">Sobre</a>
      <a href="${pageUrl("como-comprar/")}">Como comprar</a>
      <a href="${pageUrl("duvidas-frequentes/")}">Duvidas frequentes</a>
      <a href="${pageUrl("contato/")}">Contato</a>
      <a href="${pageUrl("politica-de-privacidade/")}">Privacidade</a>
      <a href="${pageUrl("termos-de-uso/")}">Termos</a>
    </nav>
    <p class="fine-print">Precos, disponibilidade, frete, pagamento e condicoes finais de compra devem ser confirmados no anuncio correspondente no Mercado Livre.</p>
  </footer>
</body>
</html>`;
}
