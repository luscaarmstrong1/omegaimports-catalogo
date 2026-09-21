import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  absolute,
  applicationCards,
  assetUrl,
  blogCoverPicture,
  categories,
  conditionLabel,
  escapeHtml,
  familyCards,
  formatDate,
  formatPrice,
  icon,
  loadBlogPosts,
  loadProducts,
  normalizeText,
  pageShell,
  pageUrl,
  productCard,
  productFormat,
  productPicture,
  site,
} from "./shared.mjs";

const dist = new URL("../dist/", import.meta.url);
const allProducts = loadProducts({ all: true });
const published = loadProducts().filter((product) => product.active && product.imageStatus === "verified" && !product.image?.includes("product-placeholder"));
const hidden = allProducts.filter((product) => product.status !== "published");
const blogPosts = loadBlogPosts();
const merchandising = JSON.parse(readFileSync(new URL("../src/data/home-merchandising.json", import.meta.url), "utf8"));
const categoryCounts = Object.fromEntries(categories.map((category) => [category.slug, published.filter((product) => product.internalCategorySlug === category.slug).length]));
const visibleCategories = categories.filter((category) => (categoryCounts[category.slug] || 0) > 0);
const homeCategorySlugs = ["iot-gsm-e-comunicacao", "sensores-e-medicao", "fontes-e-alimentacao", "automacao-e-comando", "componentes-eletronicos", "instrumentos-de-bancada"];
const homeCategories = homeCategorySlugs.map((slug) => visibleCategories.find((category) => category.slug === slug)).filter(Boolean);
const visibleFamilies = familyCards.filter((family) => published.some((product) => product.familyId === family.slug));

function out(path, html) {
  const target = new URL(path, dist);
  mkdirSync(dirname(fileURLToPath(target)), { recursive: true });
  writeFileSync(target, html, "utf8");
}

function copyAssets() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(new URL("../public/brand/", import.meta.url), new URL("brand/", dist), { recursive: true });
  mkdirSync(new URL("blog/", dist), { recursive: true });
  cpSync(new URL("../public/blog/covers/", import.meta.url), new URL("blog/covers/", dist), { recursive: true });
  cpSync(new URL("../public/blog/stock/", import.meta.url), new URL("blog/stock/", dist), { recursive: true });
  cpSync(new URL("../public/assets/", import.meta.url), new URL("assets/", dist), { recursive: true });
  cpSync(new URL("../public/products/", import.meta.url), new URL("products/", dist), { recursive: true });
  cpSync(new URL("../public/versions/previous/", import.meta.url), new URL("versao-anterior/", dist), { recursive: true });
  cpSync(new URL("../public/manifest.webmanifest", import.meta.url), new URL("manifest.webmanifest", dist));
  const currentVersion = new URL("../public/versions/current/", import.meta.url);
  const currentOutput = new URL("versao-atual/", dist);
  cpSync(currentVersion, currentOutput, { recursive: true });
  rewriteVersionUrls(fileURLToPath(currentOutput));
}

function rewriteVersionUrls(directory) {
  for (const entry of readdirSync(directory)) {
    const target = `${directory}/${entry}`;
    if (statSync(target).isDirectory()) {
      rewriteVersionUrls(target);
      continue;
    }
    if (!/\.(?:html|css|js|json|xml|webmanifest)$/i.test(entry)) continue;
    const content = readFileSync(target, "utf8")
      .replaceAll("/omegaimports-catalogo/", "/omegaimports-catalogo/versao-atual/")
      .replaceAll('href="/omegaimports-catalogo/versao-atual/versao-anterior/"', 'href="/omegaimports-catalogo/"')
      .replaceAll("Versao anterior", "Versão V7");
    writeFileSync(target, content, "utf8");
  }
}

function section({ eyebrow, title, description = "", action = "", content, className = "section" }) {
  return `<section class="${className}">
    <div class="section-heading">
      <div class="section-heading-copy">
        ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
        <h2>${escapeHtml(title)}</h2>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      </div>
      ${action}
    </div>
    ${content}
  </section>`;
}

function collectionItems(entry, route) {
  if (route === "categorias") return published.filter((product) => product.internalCategorySlug === entry.slug);
  if (route === "familias") return published.filter((product) => product.familyId === entry.slug);
  const applicationCategories = {
    "telemetria-e-conectividade": ["iot-gsm-e-comunicacao", "gps-e-localizacao"],
    "monitoramento-de-energia": ["sensores-e-medicao", "fontes-e-alimentacao"],
    "automacao-e-comando": ["automacao-e-comando"],
    "prototipagem-eletronica": ["componentes-eletronicos", "placas-e-microcontroladores", "instrumentos-de-bancada"],
    "alimentacao-de-circuitos": ["fontes-e-alimentacao", "instrumentos-de-bancada"],
    "instrumentacao-de-bancada": ["instrumentos-de-bancada"],
  };
  const categorySlugs = applicationCategories[entry.slug] || [];
  return published.filter((product) => categorySlugs.includes(product.internalCategorySlug));
}

function appUrl(app) {
  const first = collectionItems(app, "aplicacoes")[0];
  return pageUrl(`produtos/${first ? `?categoria=${encodeURIComponent(first.internalCategorySlug)}` : ""}`);
}

function familyUrl(family) {
  return pageUrl(`produtos/?familia=${encodeURIComponent(family.slug)}`);
}

function selectByPriority() {
  const priorities = [
    (p) => p.familyId === "ttgo-t-call",
    (p) => p.familyId === "sensores-de-corrente" && /sct/i.test(p.title),
    (p) => p.familyId === "hi-link-hlk-pm01",
    (p) => p.familyId === "gps-neo-6m",
    (p) => p.familyId === "sensores-de-corrente",
    (p) => p.internalCategorySlug === "instrumentos-de-bancada",
    (p) => p.internalCategorySlug === "componentes-eletronicos",
  ];
  const selected = [];
  for (const test of priorities) {
    const product = published.find((item) => !selected.includes(item) && test(item));
    if (product) selected.push(product);
  }
  return selected;
}

function selectHomeProducts() {
  const max = Math.max(6, Math.min(Number(merchandising.maximumProducts || 8), 8));
  const excluded = new Set(merchandising.excludedMlbIds || []);
  const byId = new Map(published.map((product) => [product.mlbId, product]));
  const selected = [];
  const familyCount = new Map();
  function add(product) {
    if (!product || selected.includes(product) || excluded.has(product.mlbId)) return;
    const family = product.familyId || product.internalCategorySlug;
    if ((familyCount.get(family) || 0) >= 2) return;
    selected.push(product);
    familyCount.set(family, (familyCount.get(family) || 0) + 1);
  }
  for (const id of merchandising.pinnedMlbIds || []) add(byId.get(id));
  for (const product of selectByPriority()) add(product);
  for (const product of [...published].sort((a, b) => (a.price || 999999) - (b.price || 999999))) {
    if (selected.length >= max) break;
    add(product);
  }
  if (selected.length < 6) throw new Error("Home precisa de pelo menos 6 produtos publicados para a vitrine editorial.");
  return selected;
}

function productSearchText(product) {
  return normalizeText([
    product.title,
    product.shortTitle,
    product.shortDescription,
    product.technicalSummary,
    product.internalCategory,
    product.internalCategorySlug,
    product.familyId,
    product.brand,
    product.model,
    ...(product.specifications || []).flatMap((spec) => [spec.label, spec.value]),
  ].filter(Boolean).join(" "));
}

function tagMatchesProduct(product, tag) {
  const haystack = productSearchText(product);
  const compactHaystack = haystack.replace(/[^a-z0-9]/g, "");
  const needle = normalizeText(tag);
  const compactNeedle = needle.replace(/[^a-z0-9]/g, "");
  if (!needle || haystack.includes(needle) || compactHaystack.includes(compactNeedle)) return true;
  return needle.split(/[^a-z0-9]+/).filter(Boolean).every((part) => haystack.includes(part));
}

function verifiedTags(product, preferred = [], fallback = []) {
  const tags = [];
  const add = (tag, verified = false) => {
    if (!tag || tags.length >= 3) return;
    const clean = String(tag).replace(/\s+/g, " ").trim();
    if (!clean || tags.some((item) => normalizeText(item) === normalizeText(clean))) return;
    if (!verified && !tagMatchesProduct(product, clean)) return;
    tags.push(clean);
  };
  preferred.forEach((tag) => add(tag));
  fallback.forEach((tag) => add(tag, true));
  [product.model, product.brand, product.internalCategory, productFormat(product), conditionLabel(product)].forEach((tag) => add(tag, true));
  return tags.slice(0, 3);
}

function findShowcaseProduct(tests, selected) {
  for (const test of tests) {
    const product = published.find((item) => !selected.has(item.mlbId) && test(item));
    if (product) return product;
  }
  return published.find((item) => !selected.has(item.mlbId));
}

function selectShowcaseProducts() {
  const selected = new Set();
  const briefs = [
    {
      categorySlug: "iot-gsm-e-comunicacao",
      label: "IoT e Comunicação",
      headline: "Conecte projetos ao mundo real.",
      preferredTags: ["ESP32", "GPRS", "IoT"],
      size: "large",
      tests: [
        (p) => p.familyId === "ttgo-t-call" && /ttgo|t-call|sim800/i.test(p.title),
        (p) => p.internalCategorySlug === "iot-gsm-e-comunicacao",
      ],
    },
    {
      categorySlug: "sensores-e-medicao",
      label: "Sensores e Medição",
      headline: "Precisão para medir o que importa.",
      preferredTags: ["100 A", "AC", "Sensor"],
      size: "tall",
      tests: [
        (p) => p.familyId === "sensores-de-corrente" && /sct-?013/i.test(p.title),
        (p) => p.internalCategorySlug === "sensores-e-medicao",
      ],
    },
    {
      categorySlug: "fontes-e-alimentacao",
      label: "Fontes e Alimentação",
      headline: "Potência compacta. Integração simples.",
      preferredTags: ["5 V", "3 W", "AC/DC"],
      size: "tall",
      tests: [
        (p) => p.familyId === "hi-link-hlk-pm01" && /hlk-pm01|hi-link/i.test(p.title),
        (p) => p.internalCategorySlug === "fontes-e-alimentacao",
      ],
    },
    {
      categorySlug: "gps-e-localizacao",
      label: "GPS e Localização",
      headline: "Saiba onde seus projetos estão.",
      preferredTags: ["GPS", "NEO-6M", "Módulo"],
      size: "compact",
      tests: [
        (p) => p.familyId === "gps-neo-6m" && /neo-?6m|gps/i.test(p.title),
        (p) => p.internalCategorySlug === "gps-e-localizacao",
      ],
    },
    {
      categorySlug: "automacao-e-comando",
      label: "Automação e Comando",
      headline: "Controle para aplicações reais.",
      preferredTags: ["Contator", "220 V", "AC"],
      size: "wide",
      tests: [
        (p) => p.internalCategorySlug === "automacao-e-comando" && /contator|rel[eé]|comando|supressor/i.test(p.title),
        (p) => p.internalCategorySlug === "automacao-e-comando",
      ],
    },
    {
      categorySlug: "instrumentos-de-bancada",
      label: "Instrumentos de Bancada",
      headline: "Meça, teste e desenvolva com precisão.",
      preferredTags: ["32 V", "5 A", "Bancada"],
      size: "compact",
      tests: [
        (p) => p.internalCategorySlug === "instrumentos-de-bancada" && /hikari|bancada|fonte/i.test(p.title),
        (p) => p.internalCategorySlug === "instrumentos-de-bancada",
      ],
    },
  ];

  return briefs.map((brief) => {
    const product = findShowcaseProduct(brief.tests, selected);
    if (product) selected.add(product.mlbId);
    const category = categories.find((item) => item.slug === (product?.internalCategorySlug || brief.categorySlug));
    return {
      product,
      category: category?.label || brief.label,
      label: brief.label,
      headline: brief.headline,
      tags: product ? verifiedTags(product, brief.preferredTags, [category?.label || brief.label]) : [],
      size: brief.size,
    };
  }).filter((item) => item.product);
}

function homeCategoryChips() {
  const chips = [
    ["", "Todos"],
    ["iot-gsm-e-comunicacao", "IoT"],
    ["sensores-e-medicao", "Sensores"],
    ["fontes-e-alimentacao", "Fontes"],
    ["automacao-e-comando", "Automação"],
    ["componentes-eletronicos", "Componentes"],
    ["instrumentos-de-bancada", "Instrumentos"],
  ];
  return `<nav class="home-showcase-chips" aria-label="Categorias rápidas" data-horizontal-scroll>
    ${chips.map(([slug, label], index) => `<a class="${index === 0 ? "is-active" : ""}" href="${pageUrl(slug ? `produtos/?categoria=${slug}` : "produtos/")}" data-showcase-category data-category="${escapeHtml(slug || "todos")}" data-position="${index + 1}">${escapeHtml(label)}</a>`).join("")}
  </nav>`;
}

function homeQuickSearch() {
  return `<form class="home-showcase-search" action="${pageUrl("produtos/")}" method="get" role="search" data-home-showcase-search>
    ${icon("search", "search-icon")}
    <label class="sr-only" for="home-showcase-search-input">Buscar no catálogo</label>
    <input id="home-showcase-search-input" name="q" type="search" placeholder="Buscar SCT-013, ESP32, Hi-Link, GPS..." autocomplete="off">
    <button type="submit" aria-label="Buscar no catálogo">${icon("arrow-right", "btn-icon")}</button>
  </form>`;
}

function homeShowcaseHero() {
  return `<section class="home-showcase-hero" data-hero>
    <div class="home-showcase-hero-inner">
      <p class="home-showcase-eyebrow" data-reveal>COMPONENTES · IOT · AUTOMAÇÃO</p>
      <h1 data-reveal>Componentes para projetos que precisam avançar.</h1>
      <p class="home-showcase-copy" data-reveal>Sensores, fontes, módulos e componentes selecionados para automação, eletrônica e desenvolvimento técnico.</p>
      <div data-reveal>${homeQuickSearch()}</div>
      <div data-reveal>${homeCategoryChips()}</div>
    </div>
  </section>`;
}

function showcaseCard(item, index) {
  const { product } = item;
  const loading = index < 2 ? "eager" : "lazy";
  const fetchpriority = index === 0 ? "high" : "auto";
  return `<a class="showcase-card showcase-card--${escapeHtml(item.size)}" href="${pageUrl(`produtos/${product.slug}/`)}" data-showcase-card data-mlb-id="${escapeHtml(product.mlbId)}" data-product-title="${escapeHtml(product.title)}" data-category="${escapeHtml(item.category)}" data-position="${index + 1}" data-reveal style="--reveal-delay:${Math.min(index * 70, 300)}ms" aria-label="Ver ${escapeHtml(product.shortTitle || product.title)}">
    <div class="showcase-card-visual">
      ${productPicture(product, { className: "showcase-picture", width: index === 0 ? 760 : 560, height: index === 0 ? 760 : 560, loading, fetchpriority, sizes: "(min-width: 1180px) 34vw, (min-width: 768px) 48vw, 86vw" })}
    </div>
    <div class="showcase-card-meta">
      <p class="showcase-category">${escapeHtml(item.category)}</p>
      <h3>${escapeHtml(item.headline)}</h3>
      <div class="showcase-tags">${item.tags.map((tag) => `<span class="showcase-tag">${escapeHtml(tag)}</span>`).join("")}</div>
    </div>
    <span class="showcase-arrow" aria-hidden="true">&#8599;</span>
  </a>`;
}

function homeCuratedShowcase(items = selectShowcaseProducts()) {
  return `<section class="home-curated-showcase" aria-label="Galeria curada de produtos OMEGAIMPORTS">
    <div class="showcase-grid" data-horizontal-scroll>
      ${items.map(showcaseCard).join("")}
    </div>
  </section>`;
}

function selectHeroProduct() {
  return selectByPriority()[0] || published[0];
}

function hero(product) {
  return `<section class="hero-premium" data-hero>
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="hero-eyebrow" data-reveal>COMPONENTES · IOT · AUTOMAÇÃO</p>
        <h1 data-reveal>A peça certa para<br>o seu projeto avançar.</h1>
        <p data-reveal>Componentes eletrônicos, sensores, fontes e módulos selecionados para aplicações técnicas.</p>
        <div class="hero-actions" data-reveal>
          <a class="secondary-action" href="${pageUrl("produtos/")}">Explorar produtos ${icon("arrow-right", "btn-icon")}</a>
          <a class="primary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Comprar no Mercado Livre ${icon("external", "btn-icon")}</a>
        </div>
      </div>
      <div class="hero-stage" data-hero-stage data-reveal aria-label="Produto em destaque">
        <div class="hero-stage-grid" aria-hidden="true"></div>
        <a class="hero-product" href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver ${escapeHtml(product.shortTitle || product.title)}">
          <span>${escapeHtml(product.internalCategory)}</span>
          ${productPicture(product, { className: "hero-product-picture", width: 760, height: 760, loading: "eager", fetchpriority: "high", sizes: "(min-width: 980px) 42vw, 88vw" })}
          <strong>${escapeHtml(product.shortTitle || product.title)}</strong>
        </a>
      </div>
    </div>
  </section>`;
}

function trustStrip() {
  const items = [
    ["Produtos técnicos selecionados", "Curadoria por aplicação, família e uso real."],
    ["Compra pelo Mercado Livre", "Pagamento, frete e entrega no checkout oficial."],
    ["Atendimento especializado", "Ajuda para validar componente, quantidade e compatibilidade."],
    ["Catálogo atualizado", "Produtos ativos, próprios e com imagem verificada."],
  ];
  return `<section class="trust-strip" aria-label="Confiança OMEGAIMPORTS">
    ${items.map(([title, text]) => `<article data-reveal><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></article>`).join("")}
  </section>`;
}

function commercialProof() {
  const proof = [
    [`${published.length}`, "produtos públicos", "Itens ativos, com imagem validada e rota própria."],
    [`${visibleCategories.length}`, "categorias técnicas", "Busca por aplicação, família e tipo de componente."],
    [`${blogPosts.length}`, "guias editoriais", "Conteúdo conectado ao catálogo real, não a texto genérico."],
    ["ML", "checkout protegido", "Pagamento, frete e entrega confirmados no Mercado Livre."],
  ];
  return `<section class="commercial-proof" aria-label="Resumo comercial OMEGAIMPORTS">
    ${proof.map(([value, label, text]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></article>`).join("")}
  </section>`;
}

function buyingIntelligenceSection(heroProducts) {
  const featured = heroProducts[0] || published[0];
  return `<section class="commerce-lab section section--white">
    <div class="commerce-lab-copy">
      <p class="eyebrow">Compra técnica orientada</p>
      <h2>Menos ruído entre a busca, a escolha e a compra.</h2>
      <p>Inspirado nos melhores fluxos de geração e qualificação de oportunidades B2B, o catálogo agora deixa claro onde encontrar, comparar e confirmar cada componente antes de avançar para a oferta oficial.</p>
      <div class="signal-grid">
        <article class="signal-card">${icon("search", "signal-icon")}<strong>Busca segmentada</strong><p>Filtros por categoria, família, condição, formato e faixa de preço.</p></article>
        <article class="signal-card">${icon("book", "signal-icon")}<strong>Decisão com contexto</strong><p>Guias técnicos e produtos relacionados reduzem dúvidas na escolha.</p></article>
        <article class="signal-card">${icon("message", "signal-icon")}<strong>Atendimento qualificado</strong><p>WhatsApp preparado para dúvidas de aplicação, compatibilidade e quantidade.</p></article>
        <article class="signal-card">${icon("shield", "signal-icon")}<strong>Finalização segura</strong><p>Checkout, frete e pagamento ficam dentro do Mercado Livre.</p></article>
      </div>
    </div>
    <div class="commerce-lab-media" aria-label="Bancada e componentes eletrônicos">
      <img class="commerce-photo commerce-photo--wide" src="${assetUrl("blog/stock/electronics-assembly.jpg")}" width="760" height="506" loading="lazy" decoding="async" alt="Bancada com montagem de componentes eletrônicos">
      <img class="commerce-photo commerce-photo--small" src="${assetUrl("blog/stock/components-flatlay.jpg")}" width="520" height="347" loading="lazy" decoding="async" alt="Componentes eletrônicos organizados para seleção técnica">
      ${featured ? `<a class="commerce-product-shot" href="${pageUrl(`produtos/${featured.slug}/`)}">${productPicture(featured, { className: "commerce-product-picture", width: 360, height: 360, loading: "lazy", sizes: "(min-width: 900px) 240px, 48vw" })}<span>Produto em destaque</span></a>` : ""}
    </div>
  </section>`;
}

function technicalFlowSection() {
  const steps = [
    ["1", "Encontre o perfil certo", "Use busca, chips e categorias para chegar ao componente por aplicação real."],
    ["2", "Compare com segurança", "Veja imagem, preço verificado, condição, família técnica e conteúdo relacionado."],
    ["3", "Confirme a aplicação", "Tire dúvidas de tensão, corrente, pinagem, acessórios e quantidade pelo WhatsApp."],
    ["4", "Finalize protegido", "Abra o anúncio oficial e conclua frete, pagamento e entrega no Mercado Livre."],
  ];
  return `<section class="technical-flow">
    <div class="section-heading">
      <div class="section-heading-copy">
        <p class="eyebrow">Fluxo de compra</p>
        <h2>Uma jornada mais parecida com venda consultiva.</h2>
        <p>O site continua simples para comprar, mas passa a comunicar melhor a curadoria, a qualificação da escolha e o próximo passo comercial.</p>
      </div>
      <a class="text-link" href="${pageUrl("como-comprar/")}">Como comprar ${icon("arrow-right", "text-link-icon")}</a>
    </div>
    <div class="flow-steps">${steps.map(([number, title, text]) => `<article class="flow-step"><span>${number}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div>
  </section>`;
}

function opportunityCta() {
  return `<section class="opportunity-cta">
    <div>
      <p class="eyebrow">Pedidos, kits e reposição</p>
      <h2>Comprando para bancada, manutenção ou integração?</h2>
      <p>Envie a aplicação, quantidade desejada e prazo. A OMEGAIMPORTS ajuda a localizar o item correto no catálogo e direciona para a oferta oficial.</p>
    </div>
    <div class="opportunity-actions">
      <a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Falar com atendimento ${icon("message", "btn-icon")}</a>
      <a class="secondary-action" href="${pageUrl("produtos/")}">Ver catálogo ${icon("arrow-right", "btn-icon")}</a>
    </div>
  </section>`;
}

function enhanceHomeBody(body, heroProducts) {
  return body
    .replace("\n    <section class=\"section section--white\">", `\n    ${commercialProof()}\n    ${buyingIntelligenceSection(heroProducts)}\n    <section class="section section--white">`)
    .replace("\n    <section class=\"section\">\n    <div class=\"section-heading\">", `\n    ${technicalFlowSection()}\n    <section class="section">\n    <div class="section-heading">`)
    .replace("\n    <section class=\"whatsapp-band\">", `\n    ${opportunityCta()}\n    <section class="whatsapp-band">`);
}

function enhanceAboutBody(body) {
  const visual = `<img src="${assetUrl("blog/stock/factory-pcb-test.jpg")}" width="760" height="506" loading="eager" decoding="async" alt="Inspeção de placas eletrônicas em bancada técnica">`;
  return body
    .replace("<section class=\"page-hero\">", "<section class=\"page-hero about-hero\">")
    .replace("</p></section><section class=\"detail-grid\">", `</p>${visual}</section>${commercialProof()}<section class="detail-grid">`) + technicalFlowSection() + opportunityCta();
}

function categoryCard(category, index, { compact = false } = {}) {
  return `<a class="category-card" href="${pageUrl(`categorias/${category.slug}/`)}" data-event="category_click" data-category="${category.slug}" data-position="${index + 1}" data-reveal>
    ${icon(category.icon, "category-icon")}
    <span class="category-count">${categoryCounts[category.slug]}</span>
    <h3>${escapeHtml(category.label)}</h3>
    ${compact ? "" : `<p>${escapeHtml(category.description)}</p>`}
    <strong>Ver categoria ${icon("arrow-right", "text-link-icon")}</strong>
  </a>`;
}

function categoryGrid(items = homeCategories, { home = false } = {}) {
  return `<div class="category-grid${home ? " category-grid--home" : ""}" data-horizontal-scroll>
    ${items.map((category, index) => categoryCard(category, index, { compact: home })).join("")}
  </div>`;
}

function blogCard(post, index = 0) {
  return `<article class="article-card" data-blog-category="${escapeHtml(normalizeText(post.category))}" data-blog-title="${escapeHtml(normalizeText(post.title))}" data-reveal>
    <a class="article-cover" href="${pageUrl(`blog/${post.slug}/`)}">${blogCoverPicture(post, { loading: index < 3 ? "eager" : "lazy", fetchpriority: index === 0 ? "high" : "auto" })}</a>
    <div class="article-card-content">
      <p class="eyebrow">${escapeHtml(post.category)} · ${formatDate(post.publishedAt)} · ${escapeHtml(post.readingTime)}</p>
      <h3><a href="${pageUrl(`blog/${post.slug}/`)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.summary)}</p>
      <a class="text-link" href="${pageUrl(`blog/${post.slug}/`)}">Ler artigo ${icon("arrow-right", "text-link-icon")}</a>
    </div>
  </article>`;
}

function productShowcase(products) {
  return section({
    eyebrow: "Produtos em destaque",
    title: "Seleção pronta para bancada, campo e protótipo",
    description: "Itens próprios, ativos, com imagem validada e compra finalizada no anúncio oficial.",
    action: `<a class="text-link" href="${pageUrl("produtos/")}">Ver todos os produtos ${icon("arrow-right", "text-link-icon")}</a>`,
    content: `<div class="product-grid product-grid--home">${products.map((product, index) => productCard(product, index)).join("")}</div>`,
  });
}

function quickSpecs(product, limit = 4) {
  const title = normalizeText(`${product.title} ${product.model || ""}`);
  if (title.includes("sct-013")) return ["100 A", "50 mA", "AC", "Não invasivo"];
  if (title.includes("hlk-pm01") || title.includes("hi-link")) return ["5 V", "3 W", "100-240 VAC", "AC/DC"];
  if (title.includes("ttgo") || title.includes("sim800")) return ["ESP32", "SIM800L", "GPRS", "IoT"];
  if (title.includes("gps") || title.includes("neo-6m")) return ["NEO-6M", "GPS", "Antena", "Telemetria"];
  const specs = [product.model, product.brand, productFormat(product), conditionLabel(product), product.internalCategory].filter(Boolean);
  return [...new Set(specs)].slice(0, limit);
}

function quickSpecStrip(product) {
  const specs = quickSpecs(product);
  if (!specs.length) return "";
  return `<section class="quick-spec-strip" aria-label="Especificações rápidas">${specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join("")}</section>`;
}

function featureStage(product) {
  const specs = quickSpecs(product, 3);
  return `<section class="feature-stage" data-reveal>
    <div class="feature-stage-copy">
      <p class="eyebrow">${escapeHtml(product.internalCategory)}</p>
      <h2>${escapeHtml(product.shortTitle || product.title)}</h2>
      <p>${escapeHtml(product.technicalSummary || product.shortDescription || "Produto selecionado para aplicações técnicas, protótipos e manutenção eletrônica.")}</p>
      <div class="feature-specs">${specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join("")}</div>
      <a class="secondary-action" href="${pageUrl(`produtos/${product.slug}/`)}">Ver produto ${icon("arrow-right", "btn-icon")}</a>
    </div>
    <a class="feature-stage-media" href="${pageUrl(`produtos/${product.slug}/`)}" aria-label="Ver ${escapeHtml(product.shortTitle || product.title)}">
      ${productPicture(product, { className: "feature-picture", width: 860, height: 860, loading: "lazy", sizes: "(min-width: 980px) 46vw, 92vw" })}
    </a>
  </section>`;
}

function articleShowcase(posts) {
  return section({
    eyebrow: "Blog técnico",
    title: "Conteúdo para escolher e aplicar melhor",
    description: "Artigos práticos conectados aos produtos reais do catálogo.",
    action: `<a class="text-link" href="${pageUrl("blog/")}">Ver todos os artigos ${icon("arrow-right", "text-link-icon")}</a>`,
    content: `<div class="article-grid article-grid--home">${posts.map(blogCard).join("")}</div>`,
  });
}

function articleParagraphs(text = "") {
  return String(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function contactBand() {
  return `<section class="whatsapp-band" data-reveal>${icon("message", "whatsapp-band-icon")}<div><p class="eyebrow">Atendimento</p><h2>Precisa confirmar o componente certo?</h2><p>Fale pelo WhatsApp oficial da OMEGAIMPORTS para receber ajuda antes de abrir a oferta no Mercado Livre.</p></div><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></section>`;
}

function relatedProductsForPost(post, limit = 4) {
  const related = published.filter((product) =>
    (post.relatedCategories || []).includes(product.internalCategorySlug) ||
    (post.relatedFamilies || []).includes(product.familyId),
  );
  return related.slice(0, limit);
}

function relatedPostsForProduct(product, limit = 3) {
  return blogPosts
    .filter((post) => (post.relatedCategories || []).includes(product.internalCategorySlug) || (post.relatedFamilies || []).includes(product.familyId))
    .slice(0, limit);
}

function home() {
  const homeProducts = selectHomeProducts();
  const showcaseProducts = selectShowcaseProducts();
  const featureLead = selectByPriority().find((product) => !showcaseProducts.some((item) => item.product.mlbId === product.mlbId)) || homeProducts[0];
  const recentPosts = [...blogPosts].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))).slice(0, 3);
  const body = `
    ${homeShowcaseHero()}
    ${homeCuratedShowcase(showcaseProducts)}
    ${trustStrip()}
    ${productShowcase(homeProducts)}
    ${featureStage(featureLead)}
    ${articleShowcase(recentPosts)}
    ${contactBand()}`;
  out("index.html", pageShell({
    title: "Componentes eletrônicos, IoT e automação",
    description: "Componentes eletrônicos, sensores, fontes, módulos IoT e itens de automação da OMEGAIMPORTS, com compra pelo Mercado Livre e atendimento pelo WhatsApp.",
    body,
  }));
}

function catalog() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: published.slice(0, 40).map((product, index) => ({ "@type": "ListItem", position: index + 1, url: absolute(`produtos/${product.slug}/`), name: product.title })),
  };
  const catalogChips = [
    ["", "Todos"],
    ["iot-gsm-e-comunicacao", "IoT"],
    ["sensores-e-medicao", "Sensores"],
    ["fontes-e-alimentacao", "Fontes"],
    ["automacao-e-comando", "Automação"],
    ["componentes-eletronicos", "Componentes"],
    ["instrumentos-de-bancada", "Instrumentos"],
  ];
  const body = `<section class="page-hero catalog-hero"><p class="eyebrow">Catálogo</p><h1>Produtos OMEGAIMPORTS</h1><p><strong>${published.length}</strong> produtos públicos, ativos e próprios, organizados para encontrar rápido o componente certo.</p><form class="catalog-search-panel" action="${pageUrl("produtos/")}" role="search">${icon("search", "search-icon")}<label class="sr-only" for="catalog-search">Buscar no catálogo</label><input id="catalog-search" name="q" type="search" placeholder="Buscar SCT-013, ESP32, Hi-Link, GPS..." autocomplete="off"><button class="secondary-action" type="submit">Buscar ${icon("arrow-right", "btn-icon")}</button></form><div class="catalog-chips" data-horizontal-scroll>${catalogChips.map(([slug, label]) => `<a href="${pageUrl(slug ? `produtos/?categoria=${slug}` : "produtos/")}" data-catalog-chip="${slug}">${label}</a>`).join("")}</div></section>
    <div class="catalog-mobile-bar">
      <button class="filter-toggle" type="button" aria-controls="catalog-filters" aria-expanded="false">${icon("sliders", "btn-icon")} <span class="filter-toggle-label">Filtrar e ordenar</span></button>
      <span><strong>${published.length}</strong> produtos</span>
    </div>
    <div class="filter-scrim" id="filter-scrim" hidden></div>
    <section class="catalog-layout">
      <aside class="filters" id="catalog-filters" aria-label="Filtros do catálogo">
        <div class="filters-head"><strong>Filtros</strong><button class="filter-close" type="button" aria-label="Fechar filtros">${icon("x", "btn-icon")}</button></div>
        <label>Categoria<select id="category-filter"><option value="">Todas</option>${visibleCategories.map((c) => `<option value="${c.slug}">${c.label}</option>`).join("")}</select></label>
        <label>Família<select id="family-filter"><option value="">Todas</option>${visibleFamilies.map((family) => `<option value="${family.slug}">${family.label}</option>`).join("")}</select></label>
        <label>Condição<select id="condition-filter"><option value="">Todas</option><option value="novo">Novo</option><option value="usado">Usado</option></select></label>
        <label>Formato<select id="package-filter"><option value="">Todos</option><option value="unit">Unidade</option><option value="kit">Kit</option></select></label>
        <label>Preço<select id="price-filter"><option value="">Todos</option><option value="0-100">Até R$ 100</option><option value="100-300">R$ 100 a R$ 300</option><option value="300-999999">Acima de R$ 300</option></select></label>
        <label>Ordenação<select id="sort-filter"><option value="relevance">Relevância</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="title">Nome</option></select></label>
        <div class="filter-actions">
          <button class="clear-filters" type="button" id="clear-filters">Limpar filtros</button>
          <button class="apply-filters" type="button" id="apply-filters">Aplicar filtros</button>
        </div>
      </aside>
      <div><p class="result-count" aria-live="polite"><strong id="result-count">${published.length}</strong> produtos encontrados</p><div class="product-grid" id="product-list">${published.map(productCard).join("")}</div><div class="empty-state" id="empty-state" hidden><h2>Nenhum produto encontrado.</h2><p>Revise o termo ou remova alguns filtros.</p></div></div>
    </section>`;
  out("produtos/index.html", pageShell({ title: "Produtos", description: "Catálogo com busca e filtros de ofertas públicas da OMEGAIMPORTS.", path: "produtos/", body, extraHead: `<script type="application/ld+json">${JSON.stringify(itemList)}</script>` }));
}

function internalSupportBanner() {
  return `<section class="internal-support-banner" data-reveal>
    <div class="internal-support-content">
      <p class="eyebrow" style="color: var(--cyan-400);">Precisa de Mais Ajuda?</p>
      <h2>Fale com a nossa <span>equipe técnica</span></h2>
      <p>Tire dúvidas sobre aplicações, modelos, pinagem e estoque diretamente com nossos especialistas via WhatsApp ou confira os anúncios na loja oficial do Mercado Livre.</p>
      <div class="internal-support-actions">
        <a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Falar no WhatsApp ${icon("message", "btn-icon")}</a>
        <a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Ver loja no Mercado Livre ${icon("external", "btn-icon")}</a>
      </div>
    </div>
    <div class="internal-support-media">
      <img src="${assetUrl("brand/visuals/support-specialist.png")}" width="540" height="340" loading="lazy" decoding="async" alt="Especialista técnico OMEGAIMPORTS em atendimento">
    </div>
  </section>`;
}

function collectionPages() {
  const categoriesBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Categorias</span>
          </nav>
          <p class="internal-hero-eyebrow">Catálogo Técnico Especializado</p>
          <h1 class="internal-hero-title">Categorias de <span>Componentes</span></h1>
          <p class="internal-hero-desc">Explore nossa organização técnica por aplicação, família e tecnologia. Produtos com pronta entrega no Brasil, garantia e compra 100% segura pelo Mercado Livre.</p>
          <div class="internal-hero-trust-row">
            <span class="internal-hero-trust-item">${icon("shield")} Produtos Originais e Testados</span>
            <span class="internal-hero-trust-item">${icon("package")} Pronta Entrega no Brasil</span>
            <span class="internal-hero-trust-item">${icon("zap")} Envio Imediato via Mercado Livre</span>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/hero-esp32-circuit.png")}" width="680" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Módulo eletrônico ESP32 em bancada técnica OMEGAIMPORTS">
        </div>
      </div>
    </section>
    <div class="internal-content-wrap">
      <div class="internal-section-header">
        <p class="eyebrow">Organização Técnica</p>
        <h2>Navegue pelas <span>linhas de produtos</span></h2>
        <p>Escolha o segmento técnico do seu projeto e encontre módulos, sensores e ferramentas com documentação e especificações claras.</p>
      </div>
      <div class="category-grid page-grid">
        ${visibleCategories.map(categoryCard).join("")}
      </div>
      <div style="margin-top: 64px;">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  out("categorias/index.html", pageShell({
    title: "Categorias de componentes eletrônicos",
    description: "Categorias técnicas do catálogo OMEGAIMPORTS com sensores, IoT, fontes, relés, instrumentação e componentes com compra segura no Mercado Livre.",
    path: "categorias/",
    body: categoriesBody,
  }));

  for (const category of visibleCategories) {
    const items = collectionItems(category, "categorias");
    const singleCatBody = `<div class="internal-page">
      <section class="internal-hero">
        <div class="internal-hero-container">
          <div class="internal-hero-content">
            <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
              <a href="${pageUrl()}">Início</a>
              <span>/</span>
              <a href="${pageUrl("categorias/")}">Categorias</a>
              <span>/</span>
              <span>${escapeHtml(category.label)}</span>
            </nav>
            <p class="internal-hero-eyebrow">Categoria Técnica</p>
            <h1 class="internal-hero-title">${escapeHtml(category.label)}</h1>
            <p class="internal-hero-desc">${escapeHtml(category.description)}</p>
            <div class="internal-hero-trust-row">
              <span class="internal-hero-trust-item">${icon("shield")} Garantia Mercado Livre</span>
              <span class="internal-hero-trust-item">${icon("package")} ${items.length} produtos disponíveis</span>
            </div>
          </div>
          <div class="internal-hero-media">
            <img src="${assetUrl("brand/visuals/hero-esp32-circuit.png")}" width="680" height="380" loading="eager" fetchpriority="high" decoding="async" alt="${escapeHtml(category.label)} OMEGAIMPORTS">
          </div>
        </div>
      </section>
      <div class="internal-content-wrap">
        <div class="internal-section-header">
          <p class="eyebrow">Produtos na Categoria</p>
          <h2>Ofertas ativas em <span>${escapeHtml(category.label)}</span></h2>
          <p>Itens originais com pronta entrega e suporte técnico especializado da equipe OMEGAIMPORTS.</p>
        </div>
        <div class="product-grid">
          ${items.map(productCard).join("")}
        </div>
        <div style="margin-top: 64px;">
          ${internalSupportBanner()}
        </div>
      </div>
    </div>`;

    out(`categorias/${category.slug}/index.html`, pageShell({
      title: category.label,
      description: category.description,
      path: `categorias/${category.slug}/`,
      body: singleCatBody,
    }));
  }
}

function productPages() {
  for (const product of published) {
    const specs = product.specifications?.length ? `<section class="detail-block"><h2>Especificações</h2><dl class="spec-table">${product.specifications.slice(0, 14).map((s) => `<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join("")}</dl></section>` : "";
    const related = published.filter((item) => item.mlbId !== product.mlbId && (item.familyId === product.familyId || item.internalCategorySlug === product.internalCategorySlug)).slice(0, 4);
    const articles = relatedPostsForProduct(product);
    const productSchema = product.price ? {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      image: absolute(`products/${product.mlbId}/optimized/main.jpg`),
      description: product.technicalSummary || product.shortDescription || product.title,
      sku: product.mlbId,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency || "BRL",
        availability: "https://schema.org/InStock",
        itemCondition: product.condition === "usado" ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
        url: product.permalink,
      },
    } : null;
    const body = `<nav class="breadcrumb"><a href="${pageUrl()}">Início</a><a href="${pageUrl("produtos/")}">Produtos</a><span>${escapeHtml(product.shortTitle)}</span></nav>
      <section class="product-detail">
        <div class="product-gallery">
          ${productPicture(product, { className: "product-detail-picture", width: 720, height: 720, loading: "eager", fetchpriority: "high", sizes: "(min-width: 900px) 48vw, 100vw" })}
          <a class="image-open" href="${assetUrl(`products/${product.mlbId}/optimized/main.jpg`)}">Abrir imagem maior</a>
        </div>
        <div class="product-summary"><p class="eyebrow">${escapeHtml(product.internalCategory)}</p><h1>${escapeHtml(product.title)}</h1><div class="summary-chips"><span>${conditionLabel(product)}</span><span>${productFormat(product)}</span><span>${escapeHtml(product.internalCategory)}</span></div><p class="summary-price">${formatPrice(product)}</p>${product.priceLastVerifiedAt ? `<p class="updated-at">Preço verificado em ${formatDate(product.priceLastVerifiedAt)}</p>` : ""}<div class="summary-actions"><a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta no Mercado Livre ${icon("external", "btn-icon")}</a><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Tirar dúvida ${icon("message", "btn-icon")}</a></div><p class="external-note">Você será direcionado ao anúncio oficial para confirmar frete, pagamento e disponibilidade.</p></div>
      </section>
      ${quickSpecStrip(product)}
      <div class="mobile-product-bar">
        <div><span>Oferta oficial</span><strong>${formatPrice(product)}</strong></div>
        <a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta ${icon("external", "btn-icon")}</a>
        <a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="Tirar dúvida no WhatsApp">${icon("message", "btn-icon")}</a>
      </div>
      <section class="detail-grid"><section class="detail-block"><h2>Resumo técnico</h2><p>${escapeHtml(product.technicalSummary || product.shortDescription || product.title)}</p></section>${specs}<section class="detail-block"><h2>Características</h2><ul><li>${productFormat(product)}</li><li>${conditionLabel(product)}</li><li>${escapeHtml(product.internalCategory)}</li></ul></section><section class="detail-block"><h2>Cuidados</h2><p>Confirme tensão, corrente, pinagem, acessórios e compatibilidade diretamente no anúncio antes da compra. Para rede elétrica ou comando, conte com profissional habilitado.</p></section></section>
      ${articles.length ? section({ eyebrow: "Conteúdo relacionado", title: "Artigos para apoiar a escolha", content: `<div class="article-grid article-grid--compact">${articles.map(blogCard).join("")}</div>` }) : ""}
      ${related.length ? section({ eyebrow: "Relacionados", title: "Produtos da mesma família técnica", className: "section section--white", content: `<div class="product-grid">${related.map(productCard).join("")}</div>` }) : ""}`;
    out(`produtos/${product.slug}/index.html`, pageShell({
      title: product.title,
      description: product.technicalSummary || product.title,
      path: `produtos/${product.slug}/`,
      body,
      extraHead: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: absolute("") }, { "@type": "ListItem", position: 2, name: "Produtos", item: absolute("produtos/") }, { "@type": "ListItem", position: 3, name: product.title, item: absolute(`produtos/${product.slug}/`) }] })}</script>${productSchema ? `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>` : ""}`,
    }));
  }
}

function blogPages() {
  const blogSchema = { "@context": "https://schema.org", "@type": "Blog", name: "Blog OMEGAIMPORTS", url: absolute("blog/") };
  const categoriesEditorial = [...new Set(blogPosts.map((post) => post.category))];
  const sortedPosts = [...blogPosts].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  const featuredPost = sortedPosts[0];
  const remainingPosts = sortedPosts.slice(1);

  const blogHomeBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Blog</span>
          </nav>
          <p class="internal-hero-eyebrow">Conteúdo Técnico & Aplicações</p>
          <h1 class="internal-hero-title">Blog <span>OMEGAIMPORTS</span></h1>
          <p class="internal-hero-desc">Artigos práticos, guias de seleção e projetos detalhados sobre IoT, automação, sensores e telemetria industrial, conectados aos produtos reais do nosso catálogo.</p>
          <form class="internal-hero-search" action="${pageUrl("blog/")}" role="search">
            <label class="sr-only" for="blog-search">Buscar artigos</label>
            <input id="blog-search" name="q" type="search" placeholder="Buscar telemetria, sensores, ESP32, fontes..." autocomplete="off">
            <button type="submit">Buscar</button>
          </form>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/hero-telemetry-outdoor.png")}" width="680" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Estação de telemetria IoT outdoor OMEGAIMPORTS">
        </div>
      </div>
    </section>
    <div class="internal-content-wrap">
      <div class="chips blog-category-chips" style="margin-bottom: 36px;">
        <a data-blog-category="" href="${pageUrl("blog/")}">Todos</a>
        ${categoriesEditorial.map((category) => `<a data-blog-category="${escapeHtml(normalizeText(category))}" href="${pageUrl(`blog/?categoria=${encodeURIComponent(category)}`)}">${escapeHtml(category)}</a>`).join("")}
      </div>
      <p class="result-count blog-result-count" aria-live="polite"><strong id="blog-result-count">${blogPosts.length}</strong> artigos técnicos publicados</p>
      <div id="blog-list">
        <div class="blog-featured" style="margin-bottom: 40px;">
          ${featuredPost ? blogCard(featuredPost, 0) : ""}
        </div>
        <div class="article-grid page-grid">
          ${remainingPosts.map((post, index) => blogCard(post, index + 1)).join("")}
        </div>
      </div>
      <div class="empty-state blog-empty-state" id="blog-empty-state" hidden>
        <h2>Nenhum artigo encontrado.</h2>
        <p>Revise o termo digitado ou selecione outra categoria.</p>
      </div>
      <div style="margin-top: 64px;">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  out("blog/index.html", pageShell({
    title: "Blog técnico",
    description: "Guias práticos sobre eletrônica, IoT, sensores, fontes, automação e prototipagem.",
    path: "blog/",
    body: blogHomeBody,
    extraHead: `<script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`,
  }));

  for (const post of blogPosts) {
    const relatedProducts = relatedProductsForPost(post);
    const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 3);
    const author = post.author || "Omega Imports";
    const sourceBlock = post.sourceUrl ? `<section class="article-section article-section--wide article-source"><h2>Fonte original</h2><p>Publicado originalmente pela OMEGAIMPORTS no LinkedIn.</p><a class="secondary-action" href="${escapeHtml(post.sourceUrl)}" target="_blank" rel="noopener noreferrer">Ver artigo no LinkedIn ${icon("external", "btn-icon")}</a></section>` : "";
    const body = `<nav class="breadcrumb"><a href="${pageUrl()}">Início</a><a href="${pageUrl("blog/")}">Blog</a><span>${escapeHtml(post.title)}</span></nav>
      <article class="article article-detail">
        <header class="article-header"><p class="eyebrow">${escapeHtml(post.category)} · ${escapeHtml(post.readingTime)}</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.summary)}</p><div class="article-meta"><span>${escapeHtml(author)}</span><span>Publicado em ${formatDate(post.publishedAt)}</span><span>Atualizado em ${formatDate(post.updatedAt)}</span></div></header>
        ${blogCoverPicture(post, { className: "article-hero-cover", width: 1400, height: 788, loading: "eager", fetchpriority: "high", sizes: "(min-width: 1180px) 1080px, 100vw" })}
        <aside class="toc" aria-label="Sumário"><strong>Sumário</strong>${post.sections.map(([title], index) => `<a href="#secao-${index + 1}">${escapeHtml(title)}</a>`).join("")}</aside>
        <div class="article-section-grid">
          ${post.sections.map(([title, text], index) => `<section class="article-section" id="secao-${index + 1}"><h2>${escapeHtml(title)}</h2>${articleParagraphs(text)}</section>`).join("")}
          <section class="article-section article-section--wide"><h2>Conclusão</h2><p>Use o artigo como ponto de partida e confirme modelo, tensão, corrente, acessórios e disponibilidade no anúncio oficial antes da compra.</p></section>
          <section class="article-section article-section--wide"><h2>Referências técnicas</h2><ul>${post.references.map((reference) => `<li>${escapeHtml(reference)}</li>`).join("")}</ul></section>
          ${sourceBlock}
        </div>
        <section class="article-whatsapp"><h2>Precisa de ajuda para escolher?</h2><p>Envie sua dúvida pelo WhatsApp oficial da OMEGAIMPORTS e informe o tipo de projeto, tensão, corrente e aplicação desejada.</p><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></section>
      </article>
      ${relatedProducts.length ? section({ eyebrow: "Produtos relacionados", title: "Itens do catálogo ligados a este tema", className: "section section--white", content: `<div class="product-grid">${relatedProducts.map(productCard).join("")}</div>` }) : ""}
      ${relatedPosts.length ? section({ eyebrow: "Continue lendo", title: "Artigos relacionados", content: `<div class="article-grid article-grid--compact">${relatedPosts.map(blogCard).join("")}</div>` }) : ""}
      <div style="padding: 0 max(24px, calc((100vw - var(--max)) / 2)) 56px;">
        ${internalSupportBanner()}
      </div>`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      image: absolute(`${post.cover}-og.jpg`),
      author: { "@type": "Organization", name: author },
      publisher: { "@type": "Organization", name: "OMEGAIMPORTS" },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: absolute(`blog/${post.slug}/`),
    };
    if (post.sourceUrl) schema.isBasedOn = post.sourceUrl;
    out(`blog/${post.slug}/index.html`, pageShell({ title: post.title, description: post.summary, path: `blog/${post.slug}/`, body, type: "article", ogImage: `${post.cover}-og.jpg`, extraHead: `<script type="application/ld+json">${JSON.stringify(schema)}</script>` }));
  }
}

function simplePages() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Como faço para comprar na OMEGAIMPORTS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Navegue pelo nosso catálogo de componentes técnicos, selecione o item desejado e clique no botão 'Ver oferta' ou 'Comprar no Mercado Livre'. Você será direcionado para o anúncio oficial da OMEGAIMPORTS no Mercado Livre, onde conclui o pagamento com toda a segurança e proteção do programa Compra Garantida.",
        },
      },
      {
        "@type": "Question",
        name: "Quais são as formas de pagamento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Como as compras são finalizadas no Mercado Livre, você conta com todos os meios disponíveis pela plataforma: Pix com aprovação imediata, cartão de crédito com parcelamento facilitado, boleto bancário e saldo em conta Mercado Pago.",
        },
      },
      {
        "@type": "Question",
        name: "Qual o prazo de entrega?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nossos produtos contam com pronta entrega e envio rápido para todo o Brasil. O prazo exato e o valor do frete são calculados diretamente na página do anúncio no Mercado Livre, variando de acordo com o seu CEP e a modalidade de envio escolhida.",
        },
      },
      {
        "@type": "Question",
        name: "Posso trocar ou devolver um produto?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. Todas as compras possuem cobertura total do programa de Devolução Grátis do Mercado Livre. Você tem até 30 dias a partir do recebimento para solicitar a devolução sem custos adicionais caso o produto não atenda às suas expectativas.",
        },
      },
      {
        "@type": "Question",
        name: "Os produtos são originais e têm garantia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim, trabalhamos exclusivamente com componentes novos, originais e inspecionados em bancada técnica. Todos os itens contam com garantia legal contra defeitos de fabricação assegurada pela OMEGAIMPORTS e respaldada pelo Mercado Livre.",
        },
      },
      {
        "@type": "Question",
        name: "Como faço para entrar em contato com o suporte?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nossa equipe técnica especializada atende diretamente pelo WhatsApp oficial (+55 35 99952-8858) e também pelo campo de mensagens do Mercado Livre para esclarecer dúvidas de pinagem, compatibilidade e aplicação.",
        },
      },
    ],
  };

  const duvidasFrequentesBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Dúvidas frequentes</span>
          </nav>
          <p class="internal-hero-eyebrow">Suporte sem complicação</p>
          <h1 class="internal-hero-title">Dúvidas <span>frequentes</span></h1>
          <p class="internal-hero-desc">Encontre respostas rápidas para as principais perguntas sobre compra, envio, pagamento e muito mais.</p>
          <div class="internal-hero-search">
            <input type="search" placeholder="Digite sua dúvida aqui..." aria-label="Pesquisar nas dúvidas frequentes">
            <button type="button">Buscar</button>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/hero-esp32-vertical.png")}" width="540" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Microcontrolador ESP32 iluminado na bancada técnica">
        </div>
      </div>
    </section>

    <div class="internal-content-wrap">
      <div class="internal-section-header text-center">
        <p class="eyebrow" style="color: var(--blue-600);">Perguntas Mais Comuns</p>
        <h2>Tudo o que você <span>precisa saber</span></h2>
        <p>Encontre abaixo as respostas para as dúvidas mais frequentes dos nossos clientes.</p>
      </div>

      <div class="faq-accordion-list">
        <details class="faq-item" open>
          <summary class="faq-trigger">
            <div class="faq-trigger-content">
              <div class="faq-icon-box">${icon("package")}</div>
              <h3>Como faço para comprar na OMEGAIMPORTS?</h3>
            </div>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="faq-answer">
            Navegue pelo nosso catálogo de componentes técnicos, selecione o item desejado e clique no botão <strong>"Ver oferta"</strong> ou <strong>"Comprar no Mercado Livre"</strong>. Você será direcionado para o anúncio oficial da OMEGAIMPORTS no Mercado Livre, onde conclui o pagamento com toda a segurança e proteção do programa Compra Garantida.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-trigger">
            <div class="faq-trigger-content">
              <div class="faq-icon-box">${icon("shield")}</div>
              <h3>Quais são as formas de pagamento?</h3>
            </div>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="faq-answer">
            Como as compras são finalizadas no Mercado Livre, você conta com todos os meios disponíveis pela plataforma: <strong>Pix com aprovação imediata</strong>, cartão de crédito com parcelamento facilitado, boleto bancário e saldo em conta Mercado Pago.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-trigger">
            <div class="faq-trigger-content">
              <div class="faq-icon-box">${icon("zap")}</div>
              <h3>Qual o prazo de entrega?</h3>
            </div>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="faq-answer">
            Nossos produtos contam com <strong>pronta entrega e envio rápido</strong> para todo o Brasil. O prazo exato e o valor do frete são calculados diretamente na página do anúncio no Mercado Livre, variando de acordo com o seu CEP e a modalidade de envio escolhida.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-trigger">
            <div class="faq-trigger-content">
              <div class="faq-icon-box">${icon("sliders")}</div>
              <h3>Posso trocar ou devolver um produto?</h3>
            </div>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="faq-answer">
            Sim. Todas as compras possuem cobertura total do programa de <strong>Devolução Grátis do Mercado Livre</strong>. Você tem até 30 dias a partir do recebimento para solicitar a devolução sem custos adicionais caso o produto não atenda às suas necessidades.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-trigger">
            <div class="faq-trigger-content">
              <div class="faq-icon-box">${icon("shield")}</div>
              <h3>Os produtos são originais e têm garantia?</h3>
            </div>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="faq-answer">
            Sim, trabalhamos exclusivamente com componentes novos, originais e inspecionados em bancada técnica. Todos os itens contam com garantia legal contra defeitos de fabricação assegurada pela OMEGAIMPORTS e respaldada pelo Mercado Livre.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-trigger">
            <div class="faq-trigger-content">
              <div class="faq-icon-box">${icon("message")}</div>
              <h3>Como faço para entrar em contato com o suporte?</h3>
            </div>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="faq-answer">
            Nossa equipe técnica especializada atende diretamente pelo <strong>WhatsApp oficial (+55 35 99952-8858)</strong> e também pelo campo de mensagens do Mercado Livre para esclarecer dúvidas de pinagem, compatibilidade e aplicação.
          </div>
        </details>
      </div>

      <div style="margin-top: clamp(48px, 6vw, 80px);">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  const politicaPrivacidadeBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Política de privacidade</span>
          </nav>
          <p class="internal-hero-eyebrow">Transparência e Confiança</p>
          <h1 class="internal-hero-title">Política de <span>privacidade</span></h1>
          <p class="internal-hero-desc">Sua privacidade é importante para nós. Veja como coletamos, usamos e protegemos seus dados na OMEGAIMPORTS.</p>
          <div class="internal-hero-trust-row">
            <span class="internal-hero-trust-item">${icon("shield")} Privacidade Garantida</span>
            <span class="internal-hero-trust-item">${icon("shield")} Segurança Ativa</span>
            <span class="internal-hero-trust-item">${icon("shield")} Confiança e Ética</span>
            <span class="internal-hero-trust-item">${icon("shield")} Transparência Total</span>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/hero-privacy-shield.png")}" width="540" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Escudo de segurança e privacidade digital em hardware">
        </div>
      </div>
    </section>

    <div class="internal-content-wrap">
      <div class="internal-section-header text-center">
        <p class="eyebrow" style="color: var(--blue-600);">Transparência Sem Complicação</p>
        <h2>Como tratamos <span>seus dados</span></h2>
        <p>Coletamos apenas o necessário, usamos seus dados com responsabilidade e seguimos as melhores práticas de segurança da informação.</p>
      </div>

      <div class="info-card-grid">
        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("book")}</div>
            <span class="info-card-badge">Dados</span>
          </div>
          <h3>Dados coletados</h3>
          <p>Este site opera como uma vitrine estática informativa. Não realizamos cadastros, não criamos contas e não armazenamos senhas ou números de cartões. Dados de compra são processados exclusivamente pelo Mercado Livre.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("sliders")}</div>
            <span class="info-card-badge">Navegação</span>
          </div>
          <h3>Cookies</h3>
          <p>Utilizamos cookies estritamente técnicos e recursos locais do navegador para salvar preferências de busca e filtros do catálogo. Você pode limpar ou bloquear cookies diretamente nas configurações do seu navegador.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("external")}</div>
            <span class="info-card-badge">Integração</span>
          </div>
          <h3>Links externos</h3>
          <p>Nosso catálogo contém links diretos para os anúncios oficiais no Mercado Livre e canais no WhatsApp e LinkedIn. Cada plataforma possui sua própria política de privacidade e termos de serviço independentes.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("shield")}</div>
            <span class="info-card-badge">Proteção</span>
          </div>
          <h3>Segurança</h3>
          <p>Adotamos criptografia HTTPS/TLS em todas as conexões, garantindo tráfego seguro contra interceptações. Seus contatos com nosso suporte via WhatsApp permanecem sob sigilo técnico e respeito comercial.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("message")}</div>
            <span class="info-card-badge">LGPD</span>
          </div>
          <h3>Seus direitos</h3>
          <p>Você pode solicitar a visualização, correção ou exclusão de qualquer dado pessoal de contato mantido conosco a qualquer momento, conforme assegurado pela Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
        </article>
      </div>

      <div style="margin-top: clamp(48px, 6vw, 80px);">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  const termosUsoBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Termos de uso</span>
          </nav>
          <p class="internal-hero-eyebrow">Confiança em cada conexão</p>
          <h1 class="internal-hero-title">Termos de <span>uso</span></h1>
          <p class="internal-hero-desc">Regras simples e transparentes para você comprar com segurança na OMEGAIMPORTS através do Mercado Livre.</p>
          <div class="internal-hero-trust-row">
            <span class="internal-hero-trust-item">${icon("cpu")} Tecnologia que conecta ideias</span>
            <span class="internal-hero-trust-item">${icon("shield")} Garantia Assegurada</span>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/hero-chip-gold.png")}" width="540" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Microchip dourado representando precisão técnica e segurança">
        </div>
      </div>
    </section>

    <div class="internal-content-wrap">
      <div class="internal-section-header text-center">
        <p class="eyebrow" style="color: var(--blue-600);">Nossos Termos em Resumo</p>
        <h2>Tudo o que você <span>precisa saber</span></h2>
        <p>Aqui você encontra os principais pontos dos nossos Termos de Uso. Para mais detalhes, entre em contato com nossa equipe.</p>
      </div>

      <div class="info-card-grid">
        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("book")}</div>
            <span class="info-card-badge">01</span>
          </div>
          <h3>Propósito do site</h3>
          <p>A OMEGAIMPORTS disponibiliza uma vitrine técnica que organiza produtos e conteúdos sobre componentes eletrônicos, IoT e automação, com foco em clareza informativa e suporte pré-venda.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("package")}</div>
            <span class="info-card-badge">02</span>
          </div>
          <h3>Informações do catálogo</h3>
          <p>Imagens, códigos, modelos e especificações técnicas baseiam-se em dados de bancada e fabricantes. Preços e disponibilidade de estoque em tempo real devem ser sempre confirmados no Mercado Livre.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("external")}</div>
            <span class="info-card-badge">03</span>
          </div>
          <h3>Compras no Mercado Livre</h3>
          <p>As compras são concretizadas exclusivamente no Mercado Livre, responsável pela emissão de notas fiscais, cobrança segura, gestão logística e rastreamento oficial do pedido.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("shield")}</div>
            <span class="info-card-badge">04</span>
          </div>
          <h3>Garantia e pós-venda</h3>
          <p>Todos os produtos possuem garantia e direito de devolução conforme o Código de Defesa do Consumidor e as diretrizes do Mercado Livre. Nossa equipe está sempre à disposição para orientar.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("cpu")}</div>
            <span class="info-card-badge">05</span>
          </div>
          <h3>Conteúdo informacional</h3>
          <p>Os guias do blog e esquemas elétricos fornecidos possuem caráter educativo e de auxílio técnico. Projetos de engenharia devem sempre validar limites operacionais em datasheets oficiais.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("message")}</div>
            <span class="info-card-badge">06</span>
          </div>
          <h3>Contato e suporte</h3>
          <p>Para suporte técnico, esclarecimento sobre compras ou orçamentos para lotes, utilize nosso WhatsApp oficial ou o canal de perguntas dos anúncios no Mercado Livre.</p>
        </article>
      </div>

      <div style="margin-top: clamp(48px, 6vw, 80px);">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  const comoComprarBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Como comprar</span>
          </nav>
          <p class="internal-hero-eyebrow">Compra Segura e Sem Complicação</p>
          <h1 class="internal-hero-title">Como <span>comprar</span></h1>
          <p class="internal-hero-desc">Veja como é fácil comprar componentes eletrônicos da OMEGAIMPORTS no Mercado Livre e receber seus produtos com agilidade e total segurança.</p>
          <div class="internal-hero-trust-row">
            <span class="internal-hero-trust-item">${icon("zap")} Pronta Entrega no Brasil</span>
            <span class="internal-hero-trust-item">${icon("shield")} Compra Garantida</span>
            <span class="internal-hero-trust-item">${icon("package")} Rastreio em Tempo Real</span>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/banner-laptop-mercadolivre.png")}" width="680" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Loja oficial da OMEGAIMPORTS no Mercado Livre exibida no laptop">
        </div>
      </div>
    </section>

    <div class="internal-content-wrap">
      <div class="internal-section-header text-center">
        <p class="eyebrow" style="color: var(--blue-600);">Passo a Passo</p>
        <h2>É simples comprar na <span>OMEGAIMPORTS</span></h2>
        <p>Siga os 4 passos e receba seus componentes no conforto da sua casa ou laboratório.</p>
      </div>

      <div class="steps-row">
        <article class="step-card">
          <span class="step-badge">1</span>
          <div class="step-icon-box">${icon("search")}</div>
          <h3>Encontre o produto</h3>
          <p>Navegue pelo nosso catálogo, explore as categorias técnicas e localize o componente ideal para seu projeto.</p>
        </article>

        <article class="step-card">
          <span class="step-badge">2</span>
          <div class="step-icon-box">${icon("package")}</div>
          <h3>Faça a compra</h3>
          <p>Abra o anúncio oficial no Mercado Livre, confira especificações, adicione ao carrinho e conclua com pagamento protegido.</p>
        </article>

        <article class="step-card">
          <span class="step-badge">3</span>
          <div class="step-icon-box">${icon("zap")}</div>
          <h3>Acompanhe o envio</h3>
          <p>Receba o código de rastreamento oficial e acompanhe cada etapa do transporte até o destino.</p>
        </article>

        <article class="step-card">
          <span class="step-badge">4</span>
          <div class="step-icon-box">${icon("shield")}</div>
          <h3>Receba em mãos</h3>
          <p>Seus componentes chegam com nota fiscal, devidamente embalados e com suporte técnico pronto para tirar dúvidas.</p>
        </article>
      </div>

      <div class="internal-section-header text-center" style="margin-top: clamp(48px, 6vw, 72px);">
        <p class="eyebrow" style="color: var(--blue-600);">Suas Compras com Mais Tranquilidade</p>
        <h2>Por que comprar <span>com a gente?</span></h2>
        <p>Garantimos a melhor experiência de compra técnica desde a seleção até a entrega final.</p>
      </div>

      <div class="trust-cards-row">
        <article class="trust-card">
          <div class="trust-card-icon">${icon("shield")}</div>
          <h4>Pagamento seguro</h4>
          <p>Toda a transação é processada com proteção total através do Mercado Pago no Mercado Livre.</p>
        </article>

        <article class="trust-card">
          <div class="trust-card-icon">${icon("package")}</div>
          <h4>Frete para todo o Brasil</h4>
          <p>Logística ágil com entregas via Mercado Envios e opção de frete rápido para a maioria das regiões.</p>
        </article>

        <article class="trust-card">
          <div class="trust-card-icon">${icon("shield")}</div>
          <h4>Garantia e proteção</h4>
          <p>Sua compra protegida pelo programa Compra Garantida com até 30 dias para devolução gratuita.</p>
        </article>

        <article class="trust-card">
          <div class="trust-card-icon">${icon("message")}</div>
          <h4>Suporte especializado</h4>
          <p>Nossa equipe técnica está pronta para ajudar você a escolher o componente certo via WhatsApp.</p>
        </article>
      </div>

      <div style="margin-top: clamp(48px, 6vw, 80px);">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  const sobreBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Sobre nós</span>
          </nav>
          <p class="internal-hero-eyebrow">Quem Somos e O Que Fazemos</p>
          <h1 class="internal-hero-title">Sobre a <span>OMEGAIMPORTS</span></h1>
          <p class="internal-hero-desc">Uma vitrine técnica criada para conectar engenheiros, makers, técnicos e integradores aos componentes certos com clareza e transparência.</p>
          <div class="internal-hero-trust-row">
            <span class="internal-hero-trust-item">${icon("cpu")} Curadoria Técnica em Bancada</span>
            <span class="internal-hero-trust-item">${icon("shield")} Anúncios Oficiais Verificados</span>
            <span class="internal-hero-trust-item">${icon("message")} Atendimento Especializado</span>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/support-specialist.png")}" width="680" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Especialista em componentes eletrônicos no laboratório OMEGAIMPORTS">
        </div>
      </div>
    </section>

    <div class="internal-content-wrap">
      <div class="internal-section-header text-center">
        <p class="eyebrow" style="color: var(--blue-600);">Nossa Proposta</p>
        <h2>Uma vitrine técnica para comprar com <span>clareza</span></h2>
        <p>A OMEGAIMPORTS iniciou suas operações em dezembro de 2024 para transformar a compra de componentes eletrônicos em uma experiência direta, segura e fundamentada.</p>
      </div>

      <div class="info-card-grid">
        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("cpu")}</div>
            <span class="info-card-badge">Missão</span>
          </div>
          <h3>Curadoria Especializada</h3>
          <p>Organizar produtos reais por categoria, aplicação e família técnica, eliminando dúvidas de pinagem, compatibilidade e tensão antes da compra.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("package")}</div>
            <span class="info-card-badge">Segurança</span>
          </div>
          <h3>Mercado Livre Oficial</h3>
          <p>A finalização da compra acontece no anúncio oficial, onde preço, estoque, frete rápido e pagamento seguro são confirmados pela plataforma.</p>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("book")}</div>
            <span class="info-card-badge">Conteúdo</span>
          </div>
          <h3>Clareza Técnica</h3>
          <p>Nossos guias técnicos conectam teoria e prática com exemplos reais de esquemas, códigos e aplicações de IoT, telemetria e sensoriamento.</p>
        </article>
      </div>

      <div style="margin-top: clamp(48px, 6vw, 80px);">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  const contatoBody = `<div class="internal-page">
    <section class="internal-hero">
      <div class="internal-hero-container">
        <div class="internal-hero-content">
          <nav class="internal-breadcrumb" aria-label="Navegação estrutural">
            <a href="${pageUrl()}">Início</a>
            <span>/</span>
            <span>Contato</span>
          </nav>
          <p class="internal-hero-eyebrow">Canais Oficiais de Atendimento</p>
          <h1 class="internal-hero-title">Fale com a <span>OMEGAIMPORTS</span></h1>
          <p class="internal-hero-desc">Para dúvidas sobre escolha de componentes, compatibilidade técnica, pedidos ou compras em lote, estamos prontos para atender você.</p>
          <div class="internal-hero-trust-row">
            <span class="internal-hero-trust-item">${icon("message")} Resposta rápida e sem burocracia</span>
            <span class="internal-hero-trust-item">${icon("shield")} Suporte técnico dedicado</span>
          </div>
        </div>
        <div class="internal-hero-media">
          <img src="${assetUrl("brand/visuals/support-specialist.png")}" width="540" height="380" loading="eager" fetchpriority="high" decoding="async" alt="Equipe de atendimento técnico OMEGAIMPORTS">
        </div>
      </div>
    </section>

    <div class="internal-content-wrap">
      <div class="internal-section-header text-center">
        <p class="eyebrow" style="color: var(--blue-600);">Atendimento Especializado</p>
        <h2>Como você prefere <span>conversar?</span></h2>
        <p>Escolha o canal mais conveniente para tirar suas dúvidas com nossos especialistas.</p>
      </div>

      <div class="info-card-grid">
        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("message")}</div>
            <span class="info-card-badge">Principal</span>
          </div>
          <h3>WhatsApp Oficial</h3>
          <p>Canal direto para dúvidas de aplicação, especificações técnicas, compatibilidade de módulos e disponibilidade de estoque.</p>
          <a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="margin-top: 14px;">Chamar no WhatsApp ${icon("message", "btn-icon")}</a>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("external")}</div>
            <span class="info-card-badge">Mercado Livre</span>
          </div>
          <h3>Perguntas no Anúncio</h3>
          <p>Faça perguntas diretamente na página do produto no Mercado Livre para conferir prazos de entrega e frete para seu CEP.</p>
          <a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored" style="margin-top: 14px;">Ver anúncios ${icon("external", "btn-icon")}</a>
        </article>

        <article class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">${icon("book")}</div>
            <span class="info-card-badge">Institucional</span>
          </div>
          <h3>LinkedIn Corporativo</h3>
          <p>Acompanhe artigos técnicos, atualizações de novos componentes e novidades da OMEGAIMPORTS na rede profissional.</p>
          <a class="secondary-action" href="${site.linkedinUrl}" target="_blank" rel="noopener noreferrer" style="margin-top: 14px;">Ver LinkedIn ${icon("external", "btn-icon")}</a>
        </article>
      </div>

      <div style="margin-top: clamp(48px, 6vw, 80px);">
        ${internalSupportBanner()}
      </div>
    </div>
  </div>`;

  const pages = [
    ["sobre", "Sobre a OMEGAIMPORTS", "A OMEGAIMPORTS organiza componentes eletrônicos, IoT, sensores e fontes em uma vitrine técnica conectada aos anúncios oficiais no Mercado Livre.", sobreBody],
    ["como-comprar", "Como comprar", "Aprenda a comprar componentes eletrônicos com segurança na OMEGAIMPORTS via Mercado Livre em 4 passos simples.", comoComprarBody],
    ["politica-de-privacidade", "Política de privacidade", "Conheça as práticas de privacidade, proteção de dados e transparência adotadas pela OMEGAIMPORTS de acordo com a LGPD.", politicaPrivacidadeBody],
    ["termos-de-uso", "Termos de uso", "Regras claras e termos transparentes para consulta de catálogo e compra de componentes técnicos pela OMEGAIMPORTS.", termosUsoBody],
    ["contato", "Contato", "Atendimento técnico e comercial da OMEGAIMPORTS via WhatsApp oficial e mensagens no Mercado Livre.", contatoBody],
    ["duvidas-frequentes", "Dúvidas frequentes", "Respostas para dúvidas comuns sobre compra, frete, formas de pagamento, garantia e suporte na OMEGAIMPORTS.", duvidasFrequentesBody, `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`],
  ];

  for (const [slug, title, description, body, extraHead = ""] of pages) {
    out(`${slug}/index.html`, pageShell({ title, description, path: `${slug}/`, body, extraHead }));
  }
}

function legacyPages() {
  const legacy = [
    ["familias", "Famílias agora ficam no catálogo", "Use os filtros de família na página de produtos.", "produtos/"],
    ["aplicacoes", "Aplicações agora ficam no catálogo", "Use os filtros e a busca para navegar por aplicação.", "produtos/"],
    ["guias", "Guias técnicos migraram para o Blog", "Os guias foram reorganizados como artigos editoriais.", "blog/"],
  ];
  for (const [slug, title, text, target] of legacy) {
    out(`${slug}/index.html`, pageShell({ title, description: text, path: `${slug}/`, body: `<section class="page-hero"><h1>${title}</h1><p>${text}</p><a class="secondary-action" href="${pageUrl(target)}">Continuar ${icon("arrow-right", "btn-icon")}</a></section>`, extraHead: `<meta http-equiv="refresh" content="0; url=${pageUrl(target)}">` }));
  }
}

function supportFiles() {
  const urls = ["", "produtos/", "categorias/", "blog/", "sobre/", "como-comprar/", "politica-de-privacidade/", "termos-de-uso/", ...published.map((p) => `produtos/${p.slug}/`), ...visibleCategories.map((c) => `categorias/${c.slug}/`), ...blogPosts.map((post) => `blog/${post.slug}/`)];
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${absolute(url)}</loc></url>`).join("\n")}\n</urlset>`);
  out("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("sitemap.xml")}\n`);
  out("404.html", pageShell({ title: "Página não encontrada", description: "Página não encontrada.", path: "404.html", body: `<section class="page-hero"><h1>Página não encontrada</h1><p>O endereço pode ter mudado.</p><a class="secondary-action" href="${pageUrl("produtos/")}">Ver produtos ${icon("arrow-right", "btn-icon")}</a></section>` }));
}

if (!published.length) throw new Error("Nenhum produto público elegível para publicar.");
copyAssets();
home();
catalog();
collectionPages();
productPages();
blogPages();
simplePages();
legacyPages();
supportFiles();
console.log(`Build estático concluído: ${published.length} produtos públicos, ${blogPosts.length} artigos e ${hidden.length} pendentes/ocultos em dist/.`);
