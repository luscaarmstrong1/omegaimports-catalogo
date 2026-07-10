import { readFileSync } from "node:fs";

export const rootUrl = new URL("../", import.meta.url);
export const site = {
  name: "OMEGAIMPORTS",
  founded: "dezembro de 2024",
  site: "https://luscaarmstrong1.github.io",
  base: "/omegaimports-catalogo",
  productionUrl: "https://luscaarmstrong1.github.io/omegaimports-catalogo/",
  marketplaceUrl: "https://www.mercadolivre.com.br/pagina/omegaimports",
};

export const categories = [
  ["Placas e Microcontroladores", "placas-e-microcontroladores", "ESP32, módulos de desenvolvimento e hardware para sistemas embarcados."],
  ["IoT, GSM e Comunicação", "iot-gsm-e-comunicacao", "Conectividade GSM, GPRS, RF e módulos para telemetria."],
  ["GPS e Localização", "gps-e-localizacao", "Módulos e antenas para rastreamento, telemetria e navegação."],
  ["Sensores e Medição", "sensores-e-medicao", "Monitoramento de corrente, energia e variáveis de processo."],
  ["Fontes e Alimentação", "fontes-e-alimentacao", "Fontes compactas, reguladores e componentes para alimentação de circuitos."],
  ["Automação e Comando", "automacao-e-comando", "Contatores, relés e dispositivos para acionamento e controle."],
  ["Componentes Eletrônicos", "componentes-eletronicos", "Resistores, varistores, reguladores e componentes para montagem eletrônica."],
  ["Conectores e Instalação", "conectores-e-instalacao", "Conectores, proteção, montagem e itens para instalações organizadas."],
  ["Instrumentos de Bancada", "instrumentos-de-bancada", "Equipamentos para testes, manutenção, bancada e desenvolvimento técnico."],
].map(([label, slug, description]) => ({ label, slug, description }));

export const guides = [
  ["como-escolher-sensor-corrente", "Como escolher um sensor de corrente", "Critérios práticos para comparar faixa, instalação, tipo de saída e aplicação."],
  ["ttgo-tcall-alimentacao-cuidados", "TTGO T-Call: alimentação e cuidados de integração", "Pontos de atenção ao usar ESP32, SIM800L, USB-C, bateria e antena em projetos IoT."],
  ["como-escolher-fonte-ac-dc-compacta", "Como escolher uma fonte AC-DC compacta", "Como avaliar tensão, corrente, isolamento, ambiente e margem de operação."],
].map(([slug, title, summary]) => ({ slug, title, summary }));

export function loadProducts() {
  return JSON.parse(readFileSync(new URL("../src/data/products.json", import.meta.url), "utf8"));
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
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function formatPrice(product) {
  if (!product.price || !product.priceLastVerifiedAt) return "Consulte o preço no anúncio";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: product.currency }).format(product.price);
}

export function productAlt(product) {
  const kit = product.quantity > 1 ? `Kit com ${product.quantity} unidades` : "Unidade";
  return `${kit} - ${product.shortTitle || product.title} (${product.mlbId})`;
}

export function productCard(product, index = 0) {
  const imageLabel = product.imageStatus === "verified" ? productAlt(product) : "Imagem em validação";
  return `<article class="product-card" data-title="${escapeHtml(normalizeText(product.title))}" data-category="${product.categorySlug}" data-condition="${product.condition}" data-package="${product.packageType}" data-image-status="${product.imageStatus}" data-price="${product.price || ""}" data-mlb="${product.mlbId}">
    <a class="product-media" href="${href(`produtos/${product.slug}/`)}">
      <img src="${href(product.image)}" alt="${escapeHtml(imageLabel)}" width="480" height="480" loading="${index < 3 ? "eager" : "lazy"}">
      <span class="image-status ${product.imageStatus}">${product.imageStatus === "verified" ? "Imagem verificada" : "Imagem em validação"}</span>
    </a>
    <div class="product-content">
      <p class="eyebrow">${escapeHtml(product.category)}</p>
      <h3>${escapeHtml(product.title)}</h3>
      <p>${escapeHtml(product.shortDescription)}</p>
      <dl class="product-meta">
        <div><dt>Formato</dt><dd>${product.quantity > 1 ? `Kit com ${product.quantity}` : "Unidade"}</dd></div>
        <div><dt>Condição</dt><dd>${product.condition === "novo" ? "Novo" : "Usado"}</dd></div>
        <div><dt>Preço</dt><dd>${formatPrice(product)}</dd></div>
      </dl>
      <div class="card-actions">
        <a class="primary-action marketplace-link" href="${product.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored" data-event="marketplace_click" data-mlb="${product.mlbId}" data-title="${escapeHtml(product.title)}" data-category="${escapeHtml(product.category)}" data-position="${index + 1}">Ver oferta no Mercado Livre</a>
        <a class="secondary-action" href="${href(`produtos/${product.slug}/`)}">Detalhes técnicos</a>
      </div>
    </div>
  </article>`;
}

export function pageShell({ title, description, path = "", body, extraHead = "" }) {
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
  <meta property="og:image" content="${absolute("brand/og-default.jpg")}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#070B12">
  <link rel="icon" href="${href("brand/favicon.svg")}" type="image/svg+xml">
  <link rel="icon" href="${href("brand/favicon-32.png")}" sizes="32x32">
  <link rel="apple-touch-icon" href="${href("brand/apple-touch-icon.png")}">
  <link rel="stylesheet" href="${href("assets/site.css")}">
  <script defer src="${href("assets/site.js")}"></script>
  ${extraHead}
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="topbar">Catálogo técnico OMEGAIMPORTS • Compra finalizada com segurança no Mercado Livre</div>
  <header class="site-header">
    <a class="brand" href="${href()}"><img src="${href("brand/logo-horizontal.webp")}" width="280" height="82" alt="OMEGAIMPORTS"></a>
    <nav class="main-nav" aria-label="Principal">
      <a href="${href("produtos/")}">Produtos</a>
      <a href="${href("categorias/")}">Categorias</a>
      <a href="${href("guias/")}">Guias</a>
      <a href="${href("sobre/")}">Sobre</a>
    </nav>
    <a class="header-cta" href="${href("produtos/")}">Ver catálogo</a>
    <button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false">Menu</button>
  </header>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <a href="${href("produtos/")}">Produtos</a>
    <a href="${href("categorias/")}">Categorias</a>
    <a href="${href("guias/")}">Guias</a>
    <a href="${href("sobre/")}">Sobre</a>
    <a href="${href("como-comprar/")}">Como comprar</a>
    <a href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Mercado Livre</a>
  </div>
  <main id="conteudo">${body}</main>
  <footer class="footer">
    <div>
      <img src="${href("brand/logo-horizontal.webp")}" width="230" height="68" alt="OMEGAIMPORTS">
      <p>Operação de e-commerce fundada em dezembro de 2024, especializada em componentes eletroeletrônicos, IoT, telemetria, energia e automação.</p>
    </div>
    <nav aria-label="Rodapé">
      <a href="${href("produtos/")}">Produtos</a>
      <a href="${href("categorias/")}">Categorias</a>
      <a href="${href("guias/")}">Guias técnicos</a>
      <a href="${href("como-comprar/")}">Como comprar</a>
      <a href="${href("contato/")}">Contato</a>
      <a href="${href("privacidade/")}">Privacidade</a>
      <a href="${href("termos/")}">Termos</a>
    </nav>
    <p class="fine-print">Preços, disponibilidade, frete, pagamento e condições finais de compra devem ser confirmados no anúncio correspondente no Mercado Livre.</p>
  </footer>
</body>
</html>`;
}
