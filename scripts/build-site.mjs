import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  pageUrl,
  productCard,
  productFormat,
  productPicture,
  site,
} from "./shared.mjs";
import { renderV2Home, renderV2InternalPage } from "./v2-home.mjs";

const dist = new URL("../dist/", import.meta.url);
const allProducts = loadProducts({ all: true });
const published = loadProducts().filter((product) => product.active && product.imageStatus === "verified" && !product.image?.includes("product-placeholder"));
const hidden = allProducts.filter((product) => product.status !== "published" || !product.active);
const catalogProducts = [...published, ...allProducts.filter((product) => !published.some((p) => p.mlbId === product.mlbId))];
const blogPosts = loadBlogPosts();
const merchandising = JSON.parse(readFileSync(new URL("../src/data/home-merchandising.json", import.meta.url), "utf8"));
const categoryCounts = Object.fromEntries(categories.map((category) => [category.slug, catalogProducts.filter((product) => product.internalCategorySlug === category.slug).length]));
const visibleCategories = categories.filter((category) => (categoryCounts[category.slug] || 0) > 0);
const homeCategorySlugs = ["iot-gsm-e-comunicacao", "sensores-e-medicao", "fontes-e-alimentacao", "automacao-e-comando", "componentes-eletronicos", "instrumentos-de-bancada"];
const homeCategories = homeCategorySlugs.map((slug) => visibleCategories.find((category) => category.slug === slug)).filter(Boolean);
const visibleFamilies = familyCards.filter((family) => catalogProducts.some((product) => product.familyId === family.slug));

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
  cpSync(new URL("../public/v2/", import.meta.url), new URL("v2/", dist), { recursive: true });
  cpSync(new URL("../public/products/", import.meta.url), new URL("products/", dist), { recursive: true });
  const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  manifest.start_url = pageUrl();
  manifest.scope = pageUrl();
  manifest.icons = manifest.icons.map((entry) => ({
    ...entry,
    src: assetUrl(entry.src.replace(/^\/omegaimports-catalogo\//, "")),
  }));
  out("manifest.webmanifest", `${JSON.stringify(manifest, null, 2)}\n`);
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
  if (route === "categorias") return catalogProducts.filter((product) => product.internalCategorySlug === entry.slug);
  if (route === "familias") return catalogProducts.filter((product) => product.familyId === entry.slug);
  const applicationCategories = {
    "telemetria-e-conectividade": ["iot-gsm-e-comunicacao", "gps-e-localizacao"],
    "monitoramento-de-energia": ["sensores-e-medicao", "fontes-e-alimentacao"],
    "automacao-e-comando": ["automacao-e-comando"],
    "prototipagem-eletronica": ["componentes-eletronicos", "placas-e-microcontroladores", "instrumentos-de-bancada"],
    "alimentacao-de-circuitos": ["fontes-e-alimentacao", "instrumentos-de-bancada"],
    "instrumentacao-de-bancada": ["instrumentos-de-bancada"],
  };
  const categorySlugs = applicationCategories[entry.slug] || [];
  return catalogProducts.filter((product) => categorySlugs.includes(product.internalCategorySlug));
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
    [`${catalogProducts.length}`, "produtos no catálogo", "Seleção técnica completa organizada por família e aplicação."],
    [`${visibleCategories.length}`, "categorias técnicas", "Busca por aplicação, família e tipo de componente."],
    [`${blogPosts.length}`, "guias editoriais", "Conteúdo conectado ao catálogo real, não a texto genérico."],
    ["ML", "checkout oficial", "Pagamento, frete e entrega são confirmados no Mercado Livre."],
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
        <article class="signal-card">${icon("shield", "signal-icon")}<strong>Finalização no Mercado Livre</strong><p>Preço, frete e pagamento são confirmados na plataforma.</p></article>
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
    ["2", "Compare informações", "Consulte imagem, preço verificado, condição, família técnica e conteúdo relacionado."],
    ["3", "Confirme a aplicação", "Tire dúvidas de tensão, corrente, pinagem, acessórios e quantidade pelo WhatsApp."],
    ["4", "Abra a oferta oficial", "Consulte frete, pagamento e entrega no anúncio do Mercado Livre."],
  ];
  return `<section class="technical-flow">
    <div class="section-heading">
      <div class="section-heading-copy">
        <p class="eyebrow">Fluxo de compra</p>
        <h2>Uma jornada clara, da pesquisa à oferta oficial.</h2>
        <p>O catálogo organiza a escolha e indica onde confirmar as condições finais de compra.</p>
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

const categoryCutoutMap = {
  "iot-gsm-e-comunicacao": "v2/assets/categories/modulos-iot-cutout.png",
  "sensores-e-medicao": "v2/assets/categories/sensores-cutout.png",
  "fontes-e-alimentacao": "v2/assets/categories/fontes-e-energia-cutout.png",
  "automacao-e-comando": "v2/assets/categories/reles-e-acionamento-cutout.png",
  "gps-e-localizacao": "v2/assets/categories/gps-e-navegacao-cutout.png",
  "componentes-eletronicos": "v2/assets/categories/componentes-eletronicos-cutout.png",
  "conectores-e-instalacao": "v2/assets/categories/cabos-e-conectores-cutout.png",
  "instrumentos-de-bancada": "v2/assets/categories/displays-e-ihm-cutout.png",
};

function categoryCard(category, index, { compact = false } = {}) {
  const cutout = categoryCutoutMap[category.slug] || "v2/assets/categories/modulos-iot-cutout.png";
  return `<a class="category-card" href="${pageUrl(`categorias/${category.slug}/`)}" data-event="category_click" data-category="${category.slug}" data-position="${index + 1}" data-reveal>
    <div class="category-card-top-row">
      <div class="category-card-icon-wrap">
        <img class="category-card-cutout" src="${assetUrl(cutout)}" alt="${escapeHtml(category.label)}" width="72" height="72" loading="lazy" decoding="async">
      </div>
      <span class="category-count">${categoryCounts[category.slug]}</span>
    </div>
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
  const coverPic = blogCoverPicture(post, {
    loading: index < 3 ? "eager" : "lazy",
    fetchpriority: index === 0 ? "high" : "auto",
    sizes: index === 0 ? "(min-width: 900px) 480px, 100vw" : "(min-width: 900px) 380px, 100vw"
  });
  return `<article class="article-card" data-blog-category="${escapeHtml(normalizeText(post.category))}" data-blog-title="${escapeHtml(normalizeText(post.title))}" data-reveal>
    <a class="article-cover" href="${pageUrl(`blog/${post.slug}/`)}" aria-label="Ler artigo: ${escapeHtml(post.title)}">${coverPic}</a>
    <div class="article-card-content">
      <div class="blog-card-meta-row">
        <span class="blog-badge">${escapeHtml(post.category)}</span>
        <span class="blog-card-date">${formatDate(post.publishedAt)}</span>
        <span class="blog-card-read">${escapeHtml(post.readingTime)}</span>
      </div>
      <h3><a href="${pageUrl(`blog/${post.slug}/`)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.summary)}</p>
      <a class="text-link blog-read-btn" href="${pageUrl(`blog/${post.slug}/`)}">Ler artigo ${icon("arrow-right", "text-link-icon")}</a>
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
  const recentPosts = [...blogPosts].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  out("index.html", renderV2Home({
    products: homeProducts.slice(0, 6),
    productCount: published.length,
    posts: recentPosts,
    categoryCount: visibleCategories.length,
  }));
}

function catalog() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: catalogProducts.slice(0, 40).map((product, index) => ({ "@type": "ListItem", position: index + 1, url: absolute(`produtos/${product.slug}/`), name: product.title })),
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
  const body = `<section class="page-hero catalog-hero"><p class="eyebrow">Catálogo</p><h1>Produtos OMEGAIMPORTS</h1><p><strong>${catalogProducts.length}</strong> produtos organizados para encontrar rápido o componente certo.</p><form class="catalog-search-panel" action="${pageUrl("produtos/")}" role="search">${icon("search", "search-icon")}<label class="sr-only" for="catalog-search">Buscar no catálogo</label><input id="catalog-search" name="q" type="search" placeholder="Buscar SCT-013, ESP32, Hi-Link, GPS..." autocomplete="off"><button class="secondary-action" type="submit">Buscar ${icon("arrow-right", "btn-icon")}</button></form><div class="catalog-chips" data-horizontal-scroll>${catalogChips.map(([slug, label]) => `<a href="${pageUrl(slug ? `produtos/?categoria=${slug}` : "produtos/")}" data-catalog-chip="${slug}">${label}</a>`).join("")}</div></section>
    <div class="catalog-mobile-bar">
      <button class="filter-toggle" type="button" aria-controls="catalog-filters" aria-expanded="false">${icon("sliders", "btn-icon")} <span class="filter-toggle-label">Filtrar e ordenar</span></button>
      <span><strong>${catalogProducts.length}</strong> produtos</span>
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
      <div><p class="result-count" aria-live="polite"><strong id="result-count">${catalogProducts.length}</strong> produtos encontrados</p><div class="product-grid" id="product-list">${catalogProducts.map(productCard).join("")}</div><div class="empty-state" id="empty-state" hidden><h2>Nenhum produto encontrado.</h2><p>Revise o termo ou remova alguns filtros.</p></div></div>
    </section>`;
  out("produtos/index.html", renderV2InternalPage({ title: "Produtos", description: "Catálogo com busca e filtros de ofertas públicas da OMEGAIMPORTS.", path: "produtos/", pageClass: "catalog-page", body, extraHead: `<script type="application/ld+json">${JSON.stringify(itemList)}</script>` }));
}

function collectionPages() {
  out("categorias/index.html", renderV2InternalPage({ title: "Categorias", description: "Categorias técnicas do catálogo OMEGAIMPORTS.", path: "categorias/", pageClass: "categories-page", body: `<nav class="breadcrumb"><a href="${pageUrl()}">Início</a><span>Categorias</span></nav><section class="page-hero"><p class="eyebrow">Categorias</p><h1>Organização técnica do catálogo</h1><p>Escolha por tipo de componente e avance para produtos reais, com fotos e ofertas oficiais.</p></section><div class="category-grid page-grid">${visibleCategories.map(categoryCard).join("")}</div>` }));
  for (const category of visibleCategories) {
    const items = collectionItems(category, "categorias");
    out(`categorias/${category.slug}/index.html`, renderV2InternalPage({ title: category.label, description: category.description, path: `categorias/${category.slug}/`, pageClass: "category-page", body: `<nav class="breadcrumb"><a href="${pageUrl()}">Início</a><a href="${pageUrl("categorias/")}">Categorias</a><span>${escapeHtml(category.label)}</span></nav><section class="page-hero"><p class="eyebrow">Categoria</p><h1>${escapeHtml(category.label)}</h1><p>${escapeHtml(category.description)}</p></section><div class="product-grid">${items.map(productCard).join("")}</div><section class="catalog-cta"><h2>Precisa comparar componentes?</h2><p>Fale com a OMEGAIMPORTS e informe a aplicação, tensão e requisitos do projeto.</p><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Falar no WhatsApp ${icon("message", "btn-icon")}</a></section>` }));
  }
}

function productPages() {
  for (const product of catalogProducts) {
    const isOutOfStock = product.status !== "published" || !product.active;
    const specs = product.specifications?.length ? `<section class="detail-block"><h2>Especificações</h2><dl class="spec-table">${product.specifications.slice(0, 14).map((s) => `<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join("")}</dl></section>` : "";
    const related = catalogProducts.filter((item) => item.mlbId !== product.mlbId && (item.familyId === product.familyId || item.internalCategorySlug === product.internalCategorySlug)).slice(0, 4);
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
        availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        itemCondition: product.condition === "usado" ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
        url: product.permalink || site.marketplaceUrl,
      },
    } : null;
    const body = `<nav class="breadcrumb"><a href="${pageUrl()}">Início</a><a href="${pageUrl("produtos/")}">Produtos</a><span>${escapeHtml(product.shortTitle || product.title)}</span></nav>
      <section class="product-detail">
        <div class="product-gallery">
          ${productPicture(product, { className: "product-detail-picture", width: 720, height: 720, loading: "eager", fetchpriority: "high", sizes: "(min-width: 900px) 48vw, 100vw" })}
          <a class="image-open" href="${assetUrl(`products/${product.mlbId}/optimized/main.jpg`)}">Abrir imagem maior</a>
        </div>
        <div class="product-summary"><p class="eyebrow">${escapeHtml(product.internalCategory)}</p><h1>${escapeHtml(product.title)}</h1><div class="summary-chips"><span>${conditionLabel(product)}</span><span>${productFormat(product)}</span><span>${escapeHtml(product.internalCategory)}</span>${isOutOfStock ? `<span style="background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:700;">Esgotado</span>` : ""}</div><p class="summary-price">${isOutOfStock && !product.price ? "Sob consulta" : formatPrice(product)}</p>${product.priceLastVerifiedAt ? `<p class="updated-at">Preço verificado em ${formatDate(product.priceLastVerifiedAt)}</p>` : ""}<div class="summary-actions"><a class="primary-action marketplace-link" href="${product.permalink || site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">${isOutOfStock ? "Consultar no Mercado Livre" : "Ver oferta no Mercado Livre"} ${icon("external", "btn-icon")}</a><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Tirar dúvida ${icon("message", "btn-icon")}</a></div><p class="external-note">Você será direcionado ao anúncio oficial para confirmar frete, pagamento e disponibilidade.</p></div>
      </section>
      ${quickSpecStrip(product)}
      <div class="mobile-product-bar">
        <div><span>${isOutOfStock ? "Status" : "Oferta oficial"}</span><strong>${isOutOfStock && !product.price ? "Esgotado" : formatPrice(product)}</strong></div>
        <a class="primary-action marketplace-link" href="${product.permalink || site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">${isOutOfStock ? "Consultar no ML" : "Ver oferta"} ${icon("external", "btn-icon")}</a>
        <a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="Tirar dúvida no WhatsApp">${icon("message", "btn-icon")}</a>
      </div>
      <section class="detail-grid"><section class="detail-block"><h2>Resumo técnico</h2><p>${escapeHtml(product.technicalSummary || product.shortDescription || product.title)}</p></section>${specs}<section class="detail-block"><h2>Características</h2><ul><li>${productFormat(product)}</li><li>${conditionLabel(product)}</li><li>${escapeHtml(product.internalCategory)}</li></ul></section><section class="detail-block"><h2>Cuidados</h2><p>Confirme tensão, corrente, pinagem, acessórios e compatibilidade diretamente no anúncio antes da compra. Para rede elétrica ou comando, conte com profissional habilitado.</p></section></section>
      ${articles.length ? section({ eyebrow: "Conteúdo relacionado", title: "Artigos para apoiar a escolha", content: `<div class="article-grid article-grid--compact">${articles.map(blogCard).join("")}</div>` }) : ""}
      ${related.length ? section({ eyebrow: "Relacionados", title: "Produtos da mesma família técnica", className: "section section--white", content: `<div class="product-grid">${related.map(productCard).join("")}</div>` }) : ""}`;
    out(`produtos/${product.slug}/index.html`, renderV2InternalPage({
      title: product.title,
      description: product.technicalSummary || product.title,
      path: `produtos/${product.slug}/`,
      pageClass: "product-page",
      body,
      extraHead: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: absolute("") }, { "@type": "ListItem", position: 2, name: "Produtos", item: absolute("produtos/") }, { "@type": "ListItem", position: 3, name: product.title, item: absolute(`produtos/${product.slug}/`) }] })}</script>${productSchema ? `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>` : ""}`,
    }));
  }
}

function blogPages() {
  const blogSchema = { "@context": "https://schema.org", "@type": "Blog", name: "Blog OMEGAIMPORTS", url: absolute("blog/") };
  const categoriesEditorial = [
    "IoT e conectividade",
    "Telemetria industrial",
    "Comunicação celular",
    "Placas e microcontroladores"
  ];
  const sortedPosts = [...blogPosts].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  const featuredPost = sortedPosts[0];
  const remainingPosts = sortedPosts.slice(1);

  out("blog/index.html", renderV2InternalPage({
    title: "Blog técnico",
    description: "Guias práticos sobre eletrônica, IoT, sensores, fontes, automação e prototipagem.",
    path: "blog/",
    pageClass: "blog-page",
    body: `<div class="blog-container">
      <header class="blog-header">
        <p class="eyebrow">BLOG TÉCNICO</p>
        <h1>Guias para escolher componentes com mais segurança.</h1>
        <p class="blog-header-sub">Conteúdo editorial conectado aos produtos reais do catálogo OMEGAIMPORTS.</p>
        
        <form class="blog-search" action="${pageUrl("blog/")}" role="search">
          ${icon("search", "search-icon")}
          <label class="sr-only" for="blog-search">Buscar no Blog</label>
          <input id="blog-search" name="q" type="search" placeholder="Buscar artigos, sensores, protocolos...">
        </form>

        <div class="chips blog-category-chips">
          <a data-blog-category="" href="${pageUrl("blog/")}">Todos</a>
          ${categoriesEditorial.map((category) => `<a data-blog-category="${escapeHtml(normalizeText(category))}" href="${pageUrl(`blog/?categoria=${encodeURIComponent(category)}`)}">${escapeHtml(category)}</a>`).join("")}
        </div>
      </header>

      <p class="result-count blog-result-count" aria-live="polite"><strong id="blog-result-count">${blogPosts.length}</strong> artigos encontrados</p>

      <div id="blog-list">
        <div class="blog-featured">
          ${featuredPost ? blogCard(featuredPost, 0) : ""}
        </div>
        <div class="article-grid page-grid">
          ${remainingPosts.map((post, index) => blogCard(post, index + 1)).join("")}
        </div>
      </div>

      <div class="empty-state blog-empty-state" id="blog-empty-state" hidden>
        <h2>Nenhum artigo encontrado.</h2>
        <p>Revise a busca ou escolha outra categoria.</p>
      </div>
    </div>`,
    extraHead: `<script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`,
  }));

  for (const post of blogPosts) {
    const relatedProducts = relatedProductsForPost(post);
    const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 3);
    const author = post.author || "Omega Imports";
    const sourceBlock = post.sourceUrl ? `<section class="article-section article-section--wide article-source"><h2>Fonte original</h2><p>Publicado originalmente pela OMEGAIMPORTS no LinkedIn.</p><a class="secondary-action" href="${escapeHtml(post.sourceUrl)}" target="_blank" rel="noopener noreferrer">Ver artigo no LinkedIn ${icon("external", "btn-icon")}</a></section>` : "";

    const body = `<div class="article-container">
      <nav class="breadcrumb"><a href="${pageUrl()}">Início</a> &gt; <a href="${pageUrl("blog/")}">Blog</a> &gt; <span>${escapeHtml(post.category)}</span> &gt; <span class="breadcrumb-current">${escapeHtml(post.title)}</span></nav>
      
      <article class="article article-detail">
        <header class="article-header">
          <h1>${escapeHtml(post.title)}</h1>
          <p class="article-lead">${escapeHtml(post.summary)}</p>
          <div class="article-meta-row">
            <span class="blog-badge">${escapeHtml(post.category)}</span>
            <span class="article-meta-item">${formatDate(post.publishedAt)}</span>
            <span class="article-meta-item">${escapeHtml(post.readingTime)}</span>
            <button type="button" class="btn-share" onclick="navigator.clipboard?.writeText(window.location.href);alert('Link copiado!');">${icon("external", "share-icon")} Compartilhar</button>
          </div>
        </header>

        <div class="article-hero-cover-wrapper">
          ${blogCoverPicture(post, { className: "article-hero-cover", width: 1400, height: 788, loading: "eager", fetchpriority: "high", sizes: "(min-width: 1180px) 1080px, 100vw" })}
        </div>

        <section class="article-summary-box">
          <div class="summary-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div class="summary-box-content">
            <h3>Resumo deste artigo</h3>
            <p>${escapeHtml(post.summary)} Neste guia prático, detalhamos como arquitetar a solução, contornar limitações e escolher componentes reais disponíveis no catálogo OMEGAIMPORTS.</p>
          </div>
        </section>

        <div class="article-layout-grid">
          <div class="article-main-col">
            <div class="article-sections-flow">
              ${post.sections.map(([title, text], index) => `
                <section class="article-section" id="secao-${index + 1}">
                  <h2 class="article-section-title"><span class="section-num">${String(index + 1).padStart(2, '0')}.</span> ${escapeHtml(title)}</h2>
                  <div class="article-text-body">${articleParagraphs(text)}</div>
                </section>
              `).join("")}

              <section class="article-section article-section--wide">
                <h2 class="article-section-title"><span class="section-num">${String(post.sections.length + 1).padStart(2, '0')}.</span> Conclusão</h2>
                <div class="article-text-body">
                  <p>Use o artigo como ponto de partida e confirme modelo, tensão, corrente, acessórios e disponibilidade no anúncio oficial antes da compra.</p>
                </div>
              </section>

              <section class="article-section article-section--wide">
                <h2 class="article-section-title"><span class="section-num">${String(post.sections.length + 2).padStart(2, '0')}.</span> Referências técnicas</h2>
                <ul class="article-ref-list">${post.references.map((reference) => `<li>${escapeHtml(reference)}</li>`).join("")}</ul>
              </section>

              ${sourceBlock}
            </div>
          </div>

          <aside class="article-sidebar-col">
            <div class="article-sidebar-sticky">
              <div class="article-toc-box">
                <h3 class="toc-header">Neste artigo</h3>
                <nav class="toc" aria-label="Sumário">
                  ${post.sections.map(([title], index) => `
                    <a href="#secao-${index + 1}" class="toc-nav-link" data-target="secao-${index + 1}">
                      <span class="toc-num">${String(index + 1).padStart(2, '0')}</span>
                      <span class="toc-text">${escapeHtml(title)}</span>
                    </a>
                  `).join("")}
                </nav>
              </div>

              <div class="article-support-box">
                <div class="support-box-badge">SUPORTE TÉCNICO</div>
                <h3>PRECISA DE AJUDA NO SEU PROJETO?</h3>
                <p>Nossa equipe pode ajudar você a encontrar os componentes ideais para a sua aplicação.</p>
                <a class="support-box-btn whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">
                  Falar com especialista ${icon("arrow-right", "btn-icon")}
                </a>
                <span class="sr-only">Chamar no WhatsApp</span>
              </div>
            </div>
          </aside>
        </div>

        <section class="article-whatsapp article-whatsapp--legacy" style="display:none;" aria-hidden="true">
          <h2>Precisa de ajuda para escolher?</h2>
          <p>Envie sua dúvida pelo WhatsApp oficial da OMEGAIMPORTS.</p>
          <a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a>
        </section>
      </article>

      ${relatedPosts.length ? `
        <section class="related-articles-section">
          <div class="related-header-row">
            <div>
              <p class="eyebrow">CONTINUE LENDO</p>
              <h2>Artigos relacionados</h2>
            </div>
            <a class="text-link" href="${pageUrl("blog/")}">Ver todos os artigos ${icon("arrow-right", "text-link-icon")}</a>
          </div>
          <div class="article-grid article-grid--compact">${relatedPosts.map(blogCard).join("")}</div>
        </section>
      ` : ""}

      ${relatedProducts.length ? section({ eyebrow: "Produtos relacionados", title: "Itens do catálogo ligados a este tema", className: "section section--white", content: `<div class="product-grid">${relatedProducts.map(productCard).join("")}</div>` }) : ""}
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
    out(`blog/${post.slug}/index.html`, renderV2InternalPage({ title: post.title, description: post.summary, path: `blog/${post.slug}/`, pageClass: "article-page", body, type: "article", ogImage: `${post.cover}-og.jpg`, extraHead: `<script type="application/ld+json">${JSON.stringify(schema)}</script>` }));
  }
}

function simplePages() {
  const howIcon = (name) => {
    const paths = {
      cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 8H6"/>',
      home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
      card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
      truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
      grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
      target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m14.5 9.5 6-6M16 3h5v5"/>',
      file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
      headset: '<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2ZM20 13h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19c0 2-2 3-5 3"/>',
      users: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a6 6 0 0 1 12 0v2M16 4a4 4 0 0 1 0 8M17 15a6 6 0 0 1 5 6"/>',
      whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.5c.5 4 3 6.5 7 7"/>',
      lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      cookie: '<path d="M21 12a9 9 0 1 1-9-9c0 3 2 5 5 5 0 2 2 4 4 4Z"/><circle cx="8.5" cy="10.5" r=".7" fill="currentColor"/><circle cx="11" cy="16" r=".7" fill="currentColor"/><circle cx="6.5" cy="15" r=".7" fill="currentColor"/>',
      refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>',
      chevron: '<path d="m7 10 5 5 5-5"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  };

  const comoComprarBody = `<div class="how-page">
    <section class="how-hero" aria-labelledby="how-title">
      <img class="how-hero-background" src="${assetUrl("brand/visuals/banner-laptop-mercadolivre-v2.png")}" width="2048" height="768" alt="" fetchpriority="high" decoding="async">
      <div class="how-hero-shade"></div>
      <div class="how-container how-hero-inner">
        <div class="how-hero-copy">
          <p class="how-eyebrow">Compra pelo canal oficial</p>
          <h1 id="how-title">Como <span>comprar</span></h1>
          <p>Encontre o componente certo e conclua a compra no Mercado Livre, onde preço, estoque, frete e pagamento são confirmados.</p>
          <span class="how-accent" aria-hidden="true"></span>
        </div>
        <p class="how-handwriting">Tecnologia<br>mais perto<br>de você!<span aria-hidden="true"></span></p>
      </div>
    </section>

    <section class="how-steps" aria-labelledby="how-steps-title">
      <div class="how-container">
        <header class="how-section-heading">
          <p class="how-section-eyebrow">Passo a passo</p>
          <h2 id="how-steps-title">É simples comprar na OMEGAIMPORTS</h2>
          <p>Siga quatro etapas para escolher o item e finalizar pelo canal oficial.</p>
        </header>
        <ol class="how-step-list">
          <li class="how-step">
            <div class="how-step-visual"><span>1</span>${icon("search")}</div>
            <h3>Encontre o produto</h3>
            <p>Explore o catálogo e confira qual modelo atende ao seu projeto.</p>
          </li>
          <li class="how-step-divider" aria-hidden="true">›</li>
          <li class="how-step">
            <div class="how-step-visual"><span>2</span>${howIcon("cart")}</div>
            <h3>Faça a compra</h3>
            <p>Adicione ao carrinho e conclua o pedido pelo Mercado Livre.</p>
          </li>
          <li class="how-step-divider" aria-hidden="true">›</li>
          <li class="how-step">
            <div class="how-step-visual"><span>3</span>${icon("package")}</div>
            <h3>Acompanhe o envio</h3>
            <p>Receba as atualizações do processo diretamente no Mercado Livre.</p>
          </li>
          <li class="how-step-divider" aria-hidden="true">›</li>
          <li class="how-step">
            <div class="how-step-visual"><span>4</span>${howIcon("home")}</div>
            <h3>Receba o pedido</h3>
            <p>Acompanhe a entrega no endereço informado na plataforma.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="how-benefits" aria-labelledby="how-benefits-title">
      <div class="how-container">
        <header class="how-section-heading">
          <p class="how-section-eyebrow">Informação para decidir melhor</p>
          <h2 id="how-benefits-title">Por que comprar com a gente?</h2>
        </header>
        <div class="how-benefit-grid">
          <article class="how-benefit-card"><div>${howIcon("card")}</div><h3>Checkout oficial</h3><p>O pagamento é processado pelo Mercado Livre.</p></article>
          <article class="how-benefit-card"><div>${howIcon("truck")}</div><h3>Frete no anúncio</h3><p>Valor, modalidade e prazo aparecem antes da compra.</p></article>
          <article class="how-benefit-card"><div>${icon("shield")}</div><h3>Condições claras</h3><p>Estoque e regras aplicáveis ficam disponíveis na oferta.</p></article>
          <article class="how-benefit-card"><div>${icon("message")}</div><h3>Suporte técnico</h3><p>Conte com ajuda para escolher o componente adequado.</p></article>
        </div>
      </div>
    </section>

    <section class="how-cta" aria-labelledby="how-cta-title">
      <div class="how-container how-cta-inner">
        <div class="how-cta-copy">
          <p class="how-eyebrow">Pronto para começar?</p>
          <h2 id="how-cta-title">Explore nosso catálogo<br>no <span>Mercado Livre</span></h2>
          <p>Componentes, módulos e muito mais para seus projetos.</p>
          <div class="how-cta-actions">
            <a class="how-button how-button--primary" href="${pageUrl("produtos/")}">${howIcon("grid")}<span>Explorar catálogo</span>${icon("arrow-right")}</a>
            <a class="how-button how-button--secondary marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">${icon("external")}<span>Ir para a Loja no Mercado Livre</span>${icon("arrow-right")}</a>
          </div>
        </div>
        <div class="how-cta-media">
          <img src="${assetUrl("brand/visuals/banner-boxes-esp32.png")}" width="407" height="255" alt="Caixas e placa ESP32 em uma bancada tecnológica" loading="lazy" decoding="async">
          <p>Grandes<br>projetos<br>começam<br><strong>aqui!</strong></p>
        </div>
      </div>
    </section>
  </div>`;

  const privacyBody = `<div class="privacy-page">
    <section class="privacy-hero" aria-labelledby="privacy-title">
      <img class="privacy-hero-background" src="${assetUrl("brand/visuals/hero-privacy-shield.png")}" width="2048" height="1152" alt="" fetchpriority="high" decoding="async">
      <div class="privacy-hero-shade"></div>
      <div class="privacy-container privacy-hero-inner">
        <nav class="privacy-breadcrumb" aria-label="Navegação estrutural"><a href="${pageUrl()}">Início</a><span aria-hidden="true">›</span><span>Política de privacidade</span></nav>
        <div class="privacy-hero-copy">
          <h1 id="privacy-title">Política de<br> <span>privacidade</span></h1>
          <p>Entenda como este catálogo funciona e como os canais externos tratam as informações que você decide compartilhar.</p>
          <span class="privacy-accent" aria-hidden="true"></span>
        </div>
        <ul class="privacy-proof-list" aria-label="Princípios de privacidade">
          <li>${icon("shield")}<span>Privacidade</span></li>
          <li>${howIcon("lock")}<span>Segurança</span></li>
          <li>${howIcon("users")}<span>Clareza</span></li>
          <li>${howIcon("file")}<span>Transparência</span></li>
        </ul>
        <p class="privacy-handwriting">Seus<br>dados em<br>boas mãos.<span aria-hidden="true"></span></p>
      </div>
    </section>

    <section class="privacy-content" aria-labelledby="privacy-cards-title">
      <div class="privacy-content-container">
        <header class="privacy-heading">
          <p>Transparência sem complicação</p>
          <h2 id="privacy-cards-title">Como tratamos seus dados</h2>
          <span>Este catálogo não cria contas nem processa pagamentos. Veja o papel do site e dos canais externos.</span>
        </header>
        <div class="privacy-card-grid">
          <article class="privacy-card privacy-card--third"><div>${howIcon("file")}</div><h3>Dados no catálogo</h3><p>A navegação é pública. A busca usa apenas o termo informado na URL e não exige cadastro neste site.</p></article>
          <article class="privacy-card privacy-card--third"><div>${howIcon("cookie")}</div><h3>Navegação</h3><p>O catálogo não depende de uma conta própria. Seu navegador pode aplicar configurações técnicas e de acessibilidade.</p></article>
          <article class="privacy-card privacy-card--third"><div>${icon("external")}</div><h3>Links externos</h3><p>Mercado Livre, WhatsApp e LinkedIn possuem políticas próprias para dados enviados em suas plataformas.</p></article>
          <article class="privacy-card privacy-card--wide-left"><div>${howIcon("lock")}</div><h3>Segurança</h3><p>O site não recebe senhas nem dados de pagamento. A compra e o checkout acontecem no ambiente do Mercado Livre.</p></article>
          <article class="privacy-card privacy-card--wide-right"><div>${howIcon("user")}</div><h3>Seus direitos</h3><p>Você pode pedir esclarecimentos sobre informações enviadas diretamente à OMEGAIMPORTS pelos canais oficiais.</p><a href="${pageUrl("contato/")}">Ver canais de contato ${icon("arrow-right")}</a></article>
        </div>
        <aside class="privacy-help" aria-label="Canais de atendimento">
          <div class="privacy-help-symbol">${howIcon("headset")}</div>
          <div class="privacy-help-copy"><p>Precisa de ajuda?</p><h2>Fale com nossa equipe</h2><span>Para dúvidas sobre esta política, use um dos canais oficiais.</span></div>
          <div class="privacy-help-actions">
            <a class="privacy-help-whatsapp whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">${howIcon("whatsapp")}<span>Falar no WhatsApp</span></a>
            <a href="${pageUrl("contato/")}">${icon("message")}<span>Ver canais de contato</span></a>
          </div>
          <p class="privacy-help-note">Estamos<br>aqui para<br><strong>ajudar!</strong></p>
        </aside>
      </div>
    </section>
  </div>`;

  const faqBody = `<div class="faq-page">
    <section class="faq-hero" aria-labelledby="faq-title">
      <img class="faq-hero-background" src="${assetUrl("brand/visuals/hero-esp32-circuit.png")}" width="2048" height="1152" alt="" fetchpriority="high" decoding="async">
      <div class="faq-hero-shade"></div>
      <div class="faq-container faq-hero-inner">
        <div class="faq-hero-copy">
          <p>Suporte sem complicação</p>
          <h1 id="faq-title">Dúvidas <span>frequentes</span></h1>
          <div>Encontre respostas rápidas para as principais perguntas sobre compra, envio, pagamento e muito mais.</div>
          <form class="faq-search" role="search" action="#faq-list">
            <label class="sr-only" for="faq-search-input">Buscar uma dúvida</label>
            ${icon("search")}
            <input id="faq-search-input" type="search" placeholder="Digite sua dúvida aqui..." autocomplete="off">
            <button type="submit">Buscar</button>
          </form>
        </div>
        <p class="faq-handwriting">Tecnologia<br>mais perto<br>de você.<span aria-hidden="true"></span></p>
      </div>
    </section>

    <section class="faq-content" aria-labelledby="faq-list-title">
      <div class="faq-container">
        <header class="faq-heading">
          <p>Perguntas mais comuns</p>
          <h2 id="faq-list-title">Tudo o que você precisa saber</h2>
          <span>Consulte as respostas para as dúvidas mais frequentes sobre o catálogo e a compra no canal oficial.</span>
        </header>
        <div class="faq-list" id="faq-list">
          <details class="faq-item" data-question="como comprar produto omegaimports mercado livre">
            <summary><span class="faq-item-icon">${icon("package")}</span><strong>Como faço para comprar na OMEGAIMPORTS?</strong><span class="faq-chevron">${howIcon("chevron")}</span></summary>
            <p>Escolha um produto no catálogo, abra o anúncio oficial e confirme modelo, preço, estoque, frete e pagamento no Mercado Livre antes de finalizar.</p>
          </details>
          <details class="faq-item" id="pagamento" data-question="formas pagamento cartão pix boleto">
            <summary><span class="faq-item-icon">${howIcon("card")}</span><strong>Quais são as formas de pagamento?</strong><span class="faq-chevron">${howIcon("chevron")}</span></summary>
            <p>As opções disponíveis são apresentadas e processadas pelo Mercado Livre durante o checkout. Consulte a oferta para ver as condições aplicáveis ao pedido.</p>
          </details>
          <details class="faq-item" id="entrega" data-question="prazo entrega envio frete">
            <summary><span class="faq-item-icon">${howIcon("truck")}</span><strong>Qual é o prazo de entrega?</strong><span class="faq-chevron">${howIcon("chevron")}</span></summary>
            <p>O prazo depende do produto, do endereço e da modalidade de envio. A estimativa válida aparece no anúncio e no checkout do Mercado Livre.</p>
          </details>
          <details class="faq-item" id="trocas-devolucoes" data-question="troca devolver devolução produto">
            <summary><span class="faq-item-icon">${howIcon("refresh")}</span><strong>Posso trocar ou devolver um produto?</strong><span class="faq-chevron">${howIcon("chevron")}</span></summary>
            <p>Solicitações seguem as condições da oferta e as regras aplicáveis do Mercado Livre. Use a área do pedido na plataforma para consultar e iniciar o atendimento.</p>
          </details>
          <details class="faq-item" id="garantia" data-question="produto original garantia condição">
            <summary><span class="faq-item-icon">${icon("shield")}</span><strong>Os produtos são originais e têm garantia?</strong><span class="faq-chevron">${howIcon("chevron")}</span></summary>
            <p>A condição do item e a garantia aplicável são informadas em cada anúncio. Confirme esses dados na oferta oficial antes de concluir a compra.</p>
          </details>
          <details class="faq-item" id="contato" data-question="contato suporte ajuda whatsapp mercado livre">
            <summary><span class="faq-item-icon">${howIcon("headset")}</span><strong>Como faço para entrar em contato com o suporte?</strong><span class="faq-chevron">${howIcon("chevron")}</span></summary>
            <p>Fale pelo WhatsApp oficial para dúvidas técnicas ou use o atendimento do Mercado Livre quando a questão estiver relacionada a um pedido.</p>
          </details>
        </div>
        <p class="faq-empty" role="status" hidden>Nenhuma pergunta encontrada. Tente outro termo.</p>
      </div>
    </section>

    <section class="faq-help" aria-labelledby="faq-help-title">
      <div class="faq-container faq-help-inner">
        <div class="faq-help-symbol">${icon("message")}</div>
        <div class="faq-help-copy"><p>Ainda precisa de ajuda?</p><h2 id="faq-help-title">Fale com a <span>nossa equipe</span></h2><div>Escolha o canal adequado para sua dúvida.</div></div>
        <div class="faq-help-actions">
          <a class="whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">${howIcon("whatsapp")}<span>Falar no WhatsApp</span>${icon("arrow-right")}</a>
          <a class="marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">${icon("external")}<span>Atendimento no Mercado Livre</span>${icon("arrow-right")}</a>
        </div>
        <p class="faq-help-note">Resposta<br>rápida e<br>sem burocracia.<span aria-hidden="true"></span></p>
      </div>
    </section>

    <script>
      (() => {
        const page = document.querySelector('.faq-page');
        if (!page) return;
        const form = page.querySelector('.faq-search');
        const input = page.querySelector('#faq-search-input');
        const items = [...page.querySelectorAll('.faq-item')];
        const empty = page.querySelector('.faq-empty');
        const normalize = (value) => value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim();
        const filter = () => {
          const query = normalize(input.value);
          let visible = 0;
          for (const item of items) {
            const matches = !query || normalize(item.dataset.question + ' ' + item.textContent).includes(query);
            item.hidden = !matches;
            if (matches) visible += 1;
          }
          empty.hidden = visible !== 0;
        };
        form.addEventListener('submit', (event) => { event.preventDefault(); filter(); page.querySelector('#faq-list').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        input.addEventListener('input', filter);
      })();
    </script>
  </div>`;

  const termsBody = `<div class="terms-page">
    <section class="terms-hero" aria-labelledby="terms-title">
      <img class="terms-hero-background" src="${assetUrl("brand/visuals/hero-esp32-vertical.png")}" width="2048" height="1152" alt="" fetchpriority="high" decoding="async">
      <div class="terms-hero-shade"></div>
      <div class="terms-container terms-hero-inner">
        <nav class="terms-breadcrumb" aria-label="Navegação estrutural"><a href="${pageUrl()}">Início</a><span aria-hidden="true">›</span><span>Termos de uso</span></nav>
        <div class="terms-hero-copy">
          <h1 id="terms-title">Termos de <span>uso</span></h1>
          <p>Regras simples e transparentes para navegar, consultar o catálogo e acessar nossos canais oficiais.</p>
        </div>
        <ul class="terms-proof-list" aria-label="Princípios dos termos de uso">
          <li>${icon("shield")}<span>Informação<br>transparente</span></li>
          <li>${howIcon("file")}<span>Condições no<br>Mercado Livre</span></li>
          <li>${howIcon("users")}<span>Foco na sua<br>experiência</span></li>
        </ul>
        <p class="terms-handwriting">Tecnologia<br>hoje.<br>Projetos reais<br>amanhã.<span aria-hidden="true"></span></p>
      </div>
    </section>

    <section class="terms-content" aria-labelledby="terms-points-title">
      <div class="terms-container">
        <header class="terms-heading">
          <p>Conheça nossos termos</p>
          <h2 id="terms-points-title">Pontos principais</h2>
          <span>Veja os aspectos essenciais que orientam o uso do site e a consulta dos produtos.</span>
        </header>
        <div class="terms-card-grid">
          <article class="terms-card">${howIcon("target")}<h3>1. Propósito do site</h3><p>A OMEGAIMPORTS apresenta uma vitrine informativa de componentes eletrônicos, IoT, automação e produtos relacionados.</p><a href="${pageUrl("sobre/")}" aria-label="Conhecer a OMEGAIMPORTS">${icon("arrow-right")}</a></article>
          <article class="terms-card">${icon("package")}<h3>2. Catálogo e informações</h3><p>Descrições, imagens e especificações organizam a consulta. Confirme os dados finais no anúncio oficial antes da compra.</p><a href="${pageUrl("produtos/")}" aria-label="Consultar o catálogo">${icon("arrow-right")}</a></article>
          <article class="terms-card">${howIcon("cart")}<h3>3. Compras no Mercado Livre</h3><p>Preço, estoque, frete, pagamento e entrega são definidos e confirmados na plataforma do Mercado Livre.</p><a class="marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Abrir a loja no Mercado Livre">${icon("arrow-right")}</a></article>
          <article class="terms-card">${icon("shield")}<h3>4. Garantias e pós-venda</h3><p>Garantia, troca e devolução seguem as condições informadas na oferta e as regras aplicáveis do Mercado Livre.</p><a class="marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored" aria-label="Consultar condições no Mercado Livre">${icon("arrow-right")}</a></article>
          <article class="terms-card">${howIcon("file")}<h3>5. Conteúdo informativo</h3><p>Artigos, guias e textos apoiam a pesquisa técnica. Verifique requisitos e compatibilidade para cada projeto.</p><a href="${pageUrl("blog/")}" aria-label="Acessar o blog">${icon("arrow-right")}</a></article>
          <article class="terms-card">${howIcon("headset")}<h3>6. Contato e suporte</h3><p>Para dúvidas sobre produto ou aplicação, utilize os canais oficiais indicados neste site.</p><a href="${pageUrl("contato/")}" aria-label="Acessar os canais de contato">${icon("arrow-right")}</a></article>
        </div>
        <aside class="terms-help" aria-label="Atendimento">
          <div class="terms-help-icon">${howIcon("headset")}</div>
          <div><h2>Precisa de ajuda?</h2><p>Use o canal oficial para tirar dúvidas sobre produtos e aplicações.</p></div>
          <a class="whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">${howIcon("whatsapp")}<span>Falar com um especialista</span>${icon("arrow-right")}</a>
        </aside>
      </div>
    </section>
  </div>`;

  const pages = [
    ["sobre", "Sobre a OMEGAIMPORTS", "A OMEGAIMPORTS organiza componentes eletrônicos, IoT, telemetria, energia, prototipagem e automação em uma vitrine técnica ligada aos anúncios oficiais no Mercado Livre.", `<section class="page-hero"><p class="eyebrow">Sobre</p><h1>Uma vitrine técnica para comprar componentes com mais clareza.</h1><p>A OMEGAIMPORTS apresenta componentes eletrônicos, IoT, sensores, fontes, conectores, instrumentos de bancada e itens de prototipagem em um catálogo técnico organizado.</p></section><section class="detail-grid"><div class="detail-block"><h2>Proposta</h2><p>Organizar produtos reais por categoria, aplicação e família técnica, sem transformar a compra em um relatório interno.</p></div><div class="detail-block"><h2>Mercado Livre</h2><p>A finalização da compra acontece no anúncio oficial, onde preço, estoque, frete e pagamento são confirmados.</p></div><div class="detail-block"><h2>Clareza técnica</h2><p>Os textos priorizam informação objetiva, cuidados de uso e relação entre produto, aplicação e conteúdo editorial.</p></div><div class="detail-block"><h2>WhatsApp</h2><p>Para dúvidas sobre escolha de componente, compatibilidade ou aplicação, fale com a OMEGAIMPORTS pelo WhatsApp oficial.</p><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></div></section>`],
    ["como-comprar", "Como comprar", "Encontre o produto, confira modelo e condição, abra o anúncio oficial e finalize a compra pelo Mercado Livre.", comoComprarBody],
    ["politica-de-privacidade", "Política de privacidade", "Este site é uma vitrine estática. Não cria contas, não processa pagamentos e não armazena dados de checkout.", privacyBody],
    ["termos-de-uso", "Termos de uso", "As informações ajudam a organizar e comparar produtos. Condições finais devem ser confirmadas no Mercado Livre.", termsBody],
    ["contato", "Contato", "Canais oficiais da OMEGAIMPORTS: WhatsApp, Mercado Livre e LinkedIn.", `<section class="page-hero"><p class="eyebrow">Canais oficiais</p><h1>Contato</h1><p>Escolha o canal adequado para dúvidas técnicas, consulta de ofertas ou conteúdos da OMEGAIMPORTS.</p></section><section class="contact-channel-grid"><a class="contact-channel-card whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">${icon("message")}<span><strong>WhatsApp</strong><small>Dúvidas sobre produto, compatibilidade e aplicação.</small></span>${icon("arrow-right")}</a><a class="contact-channel-card marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">${icon("external")}<span><strong>Mercado Livre</strong><small>Ofertas, preço, estoque, frete e condições da compra.</small></span>${icon("arrow-right")}</a><a class="contact-channel-card" href="${site.linkedinUrl}" target="_blank" rel="noopener noreferrer">${icon("book")}<span><strong>LinkedIn</strong><small>Conteúdos e atualizações institucionais.</small></span>${icon("arrow-right")}</a></section>`],
    ["duvidas-frequentes", "Dúvidas frequentes", "Encontre respostas sobre compra, pagamento, entrega, pós-venda e atendimento da OMEGAIMPORTS.", faqBody],
  ];
  const v2PageConfig = {
    "sobre": { pageClass: "about-page" },
    "contato": { pageClass: "contact-page" },
    "como-comprar": { pageClass: "how-to-buy-page", ogImage: "brand/visuals/banner-laptop-mercadolivre-v2.png" },
    "termos-de-uso": { pageClass: "terms-of-use-page", ogImage: "brand/visuals/hero-esp32-vertical.png" },
    "politica-de-privacidade": { pageClass: "privacy-policy-page", ogImage: "brand/visuals/hero-privacy-shield.png" },
    "duvidas-frequentes": { pageClass: "faq-page-shell", ogImage: "brand/visuals/hero-esp32-circuit.png" },
  };
  for (const [slug, title, description, body] of pages) {
    const enhancedBody = slug === "sobre" ? enhanceAboutBody(body) : body;
    out(`${slug}/index.html`, renderV2InternalPage({ title, description, path: `${slug}/`, body: enhancedBody, ...v2PageConfig[slug] }));
  }
}

function legacyPages() {
  const legacy = [
    ["familias", "Famílias agora ficam no catálogo", "Use os filtros de família na página de produtos.", "produtos/"],
    ["aplicacoes", "Aplicações agora ficam no catálogo", "Use os filtros e a busca para navegar por aplicação.", "produtos/"],
    ["guias", "Guias técnicos migraram para o Blog", "Os guias foram reorganizados como artigos editoriais.", "blog/"],
  ];
  for (const [slug, title, text, target] of legacy) {
    out(`${slug}/index.html`, renderV2InternalPage({ title, description: text, path: `${slug}/`, pageClass: "legacy-redirect-page", noindex: true, body: `<section class="page-hero"><h1>${title}</h1><p>${text}</p><a class="secondary-action" href="${pageUrl(target)}">Continuar ${icon("arrow-right", "btn-icon")}</a></section>`, extraHead: `<meta http-equiv="refresh" content="0; url=${pageUrl(target)}">` }));
  }
}

function supportFiles() {
  const urls = ["", "produtos/", "categorias/", "blog/", "sobre/", "contato/", "como-comprar/", "politica-de-privacidade/", "termos-de-uso/", "duvidas-frequentes/", ...catalogProducts.map((p) => `produtos/${p.slug}/`), ...visibleCategories.map((c) => `categorias/${c.slug}/`), ...blogPosts.map((post) => `blog/${post.slug}/`)];
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${absolute(url)}</loc></url>`).join("\n")}\n</urlset>`);
  out("robots.txt", site.isPreview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nSitemap: ${absolute("sitemap.xml")}\n`);
  out("404.html", renderV2InternalPage({ title: "Página não encontrada", description: "Página não encontrada.", path: "404.html", pageClass: "not-found-page", noindex: true, body: `<section class="page-hero"><p class="eyebrow">Erro 404</p><h1>Página não encontrada</h1><p>O endereço pode ter mudado. Continue pelo catálogo público da OMEGAIMPORTS.</p><a class="secondary-action" href="${pageUrl("produtos/")}">Ver produtos ${icon("arrow-right", "btn-icon")}</a></section>` }));
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
