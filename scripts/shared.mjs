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
  ["Placas e Microcontroladores", "placas-e-microcontroladores", "ESP32, módulos de desenvolvimento e acessórios para prototipagem."],
  ["IoT, GSM e Comunicação", "iot-gsm-e-comunicacao", "GSM/GPRS, RF, antenas, pigtails e conectividade para telemetria."],
  ["GPS e Localização", "gps-e-localizacao", "Módulos GPS e antenas para rastreamento, telemetria e navegação."],
  ["Sensores e Medição", "sensores-e-medicao", "Sensores de corrente, transformadores e medição de energia."],
  ["Fontes e Alimentação", "fontes-e-alimentacao", "Fontes AC/DC, reguladores e fontes de bancada."],
  ["Automação e Comando", "automacao-e-comando", "Contatores, relés, supressores e componentes de comando."],
  ["Componentes Eletrônicos", "componentes-eletronicos", "Resistores, varistores, diodos, headers e chaves."],
  ["Conectores e Instalação", "conectores-e-instalacao", "Split Bolt, prensa-cabos, conectores e itens de montagem."],
  ["Instrumentos de Bancada", "instrumentos-de-bancada", "Fontes de bancada, geradores de função e instrumentos usados."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const familyCards = [
  ["TTGO T-Call", "ttgo-t-call", "Ofertas unitárias, abertas e kits de módulos ESP32 + SIM800L."],
  ["GPS NEO-6M", "gps-neo-6m", "Módulos e kits para localização, rastreamento e telemetria."],
  ["Hi-Link HLK-PM01", "hi-link-hlk-pm01", "Fontes AC/DC compactas para integração em circuitos."],
  ["Sensores de corrente", "sensores-de-corrente", "SCT-013, ZMCT123A e opções para medição de energia."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const applicationCards = [
  ["Telemetria e conectividade", "telemetria-e-conectividade", "GSM, GPS, antenas e módulos para comunicação em campo."],
  ["Monitoramento de energia", "monitoramento-de-energia", "Sensores e transformadores para leitura de corrente e energia."],
  ["Automação e comando", "automacao-e-comando", "Contatores, supressores e componentes de acionamento."],
  ["Prototipagem eletrônica", "prototipagem-eletronica", "Placas, headers, chaves, resistores e componentes de bancada."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const guides = [
  ["como-escolher-sensor-corrente", "Como escolher um sensor de corrente", "Critérios práticos para comparar faixa, instalação, tipo de saída e aplicação."],
  ["ttgo-tcall-alimentacao-rede-2g-integracao", "TTGO T-Call: alimentação, rede 2G e integração", "Pontos de atenção ao usar ESP32, SIM800L, USB-C, bateria e antena em projetos IoT."],
  ["como-escolher-fonte-ac-dc-compacta", "Como escolher uma fonte AC/DC compacta", "Como avaliar tensão, corrente, isolamento, ambiente e margem de operação."],
].map(([slug, title, summary]) => ({ slug, title, summary }));

export function loadProducts({ all = false } = {}) {
  const products = JSON.parse(readFileSync(new URL("../src/data/products.json", import.meta.url), "utf8"));
  return all ? products : products.filter((product) => product.status === "published");
}

export function href(path = "") {
  const clean = path.replace(/^\/+/, "");
  return `${site.base}/${clean}`.replace(/\/{2,}/g, "/");
}

export function absolute(path = "") {
  return `${site.productionUrl.replace(/\/$/, "")}${href(path)}`.replace("/omegaimports-catalogo/omegaimports-catalogo", "/omegaimports-catalogo");
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

export function productAlt(product) {
  const kit = product.quantity > 1 ? `Kit com ${product.quantity} unidades` : "Unidade";
  return `${kit} - ${product.shortTitle || product.title} (${product.mlbId})`;
}

export function productCard(product, index = 0) {
  const imageLabel = product.imageStatus === "verified" ? productAlt(product) : "Imagem pendente de verificação";
  return `<article class="product-card" data-title="${escapeHtml(normalizeText(product.title))}" data-family="${escapeHtml(normalizeText(product.familyId || ""))}" data-category="${product.internalCategorySlug}" data-condition="${product.condition}" data-package="${product.packageType}" data-quantity="${product.quantity}" data-image-status="${product.imageStatus}" data-price="${product.price || ""}" data-mlb="${product.mlbId}">
    <a class="product-media" href="${href(`produtos/${product.slug}/`)}">
      <img src="${href(product.image)}" alt="${escapeHtml(imageLabel)}" width="480" height="480" loading="${index < 3 ? "eager" : "lazy"}">
      <span class="image-status ${product.imageStatus}">${product.imageStatus === "verified" ? "Imagem verificada" : "Imagem em revisão"}</span>
    </a>
    <div class="product-content">
      <p class="eyebrow">${escapeHtml(product.internalCategory)}</p>
      <h3>${escapeHtml(product.title)}</h3>
      <p>${escapeHtml(product.technicalSummary || product.shortDescription)}</p>
      <dl class="product-meta">
        <div><dt>Formato</dt><dd>${product.quantity > 1 ? `Kit com ${product.quantity}` : "Unidade"}</dd></div>
        <div><dt>Condição</dt><dd>${product.condition === "novo" ? "Novo" : product.condition === "usado" ? "Usado" : "A confirmar"}</dd></div>
        <div><dt>Preço</dt><dd>${formatPrice(product)}</dd></div>
        <div><dt>Atualização</dt><dd>${product.priceLastVerifiedAt || "Pendente"}</dd></div>
      </dl>
      <div class="card-actions">
        <a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored" data-event="marketplace_click" data-mlb="${product.mlbId}" data-title="${escapeHtml(product.title)}" data-category="${escapeHtml(product.internalCategory)}" data-position="${index + 1}">Ver oferta</a>
        <a class="secondary-action" href="${href(`produtos/${product.slug}/`)}">Detalhes técnicos</a>
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
  <link rel="icon" href="${href("brand/favicon.svg")}" type="image/svg+xml">
  <link rel="icon" href="${href("brand/favicon-32.png")}" sizes="32x32">
  <link rel="apple-touch-icon" href="${href("brand/apple-touch-icon.png")}">
  <link rel="stylesheet" href="${href("assets/site.css")}">
  <script defer src="${href("assets/site.js")}"></script>
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
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="topbar">Catálogo técnico atualizado • Compra e entrega finalizadas no Mercado Livre</div>
  <header class="site-header">
    <a class="brand" href="${href()}"><img src="${href("brand/logo-horizontal.webp")}" width="280" height="82" alt="OMEGAIMPORTS"></a>
    <form class="header-search" action="${href("produtos/")}" role="search">
      <label class="sr-only" for="site-search">Buscar no catálogo</label>
      <input id="site-search" name="q" type="search" placeholder="ESP32, GPS, SCT-013, Hi-Link..." autocomplete="off">
    </form>
    <nav class="main-nav" aria-label="Principal">
      <a href="${href("produtos/")}">Produtos</a>
      <a href="${href("categorias/")}">Categorias</a>
      <a href="${href("aplicacoes/")}">Aplicações</a>
      <a href="${href("guias/")}">Guias</a>
      <a href="${href("sobre/")}">Sobre</a>
    </nav>
    <a class="header-cta marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Ver loja no Mercado Livre</a>
    <button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false">Menu</button>
  </header>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <a href="${href("produtos/")}">Produtos</a>
    <a href="${href("categorias/")}">Categorias</a>
    <a href="${href("aplicacoes/")}">Aplicações</a>
    <a href="${href("guias/")}">Guias</a>
    <a href="${href("sobre/")}">Sobre</a>
    <a href="${href("como-comprar/")}">Como comprar</a>
    <a class="marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Ver loja no Mercado Livre</a>
  </div>
  <main id="conteudo">${body}</main>
  <footer class="footer">
    <div>
      <img src="${href("brand/logo-horizontal.webp")}" width="230" height="68" alt="OMEGAIMPORTS">
      <p>OMEGAIMPORTS — tecnologia, componentes e cuidado em cada pedido.</p>
      <p>Operação fundada em 23 de dezembro de 2024, especializada em componentes eletroeletrônicos, IoT, telemetria, energia, prototipagem e automação.</p>
    </div>
    <nav aria-label="Rodapé">
      <a href="${href("produtos/")}">Produtos</a>
      <a href="${href("familias/")}">Famílias</a>
      <a href="${href("categorias/")}">Categorias</a>
      <a href="${href("aplicacoes/")}">Aplicações</a>
      <a href="${href("guias/")}">Guias técnicos</a>
      <a href="${href("como-comprar/")}">Como comprar</a>
      <a href="${href("duvidas-frequentes/")}">Dúvidas frequentes</a>
      <a href="${href("contato/")}">Contato</a>
      <a href="${href("politica-de-privacidade/")}">Privacidade</a>
      <a href="${href("termos-de-uso/")}">Termos</a>
    </nav>
    <p class="fine-print">Preços, disponibilidade, frete, pagamento e condições finais de compra devem ser confirmados no anúncio correspondente no Mercado Livre.</p>
  </footer>
</body>
</html>`;
}
