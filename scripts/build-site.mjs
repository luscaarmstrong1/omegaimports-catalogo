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
  cpSync(new URL("../public/assets/", import.meta.url), new URL("assets/", dist), { recursive: true });
  cpSync(new URL("../public/products/", import.meta.url), new URL("products/", dist), { recursive: true });
  cpSync(new URL("../public/manifest.webmanifest", import.meta.url), new URL("manifest.webmanifest", dist));
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
    (p) => p.familyId === "hi-link-hlk-pm01",
    (p) => p.familyId === "sensores-de-corrente" && /sct/i.test(p.title),
    (p) => p.familyId === "gps-neo-6m",
    (p) => p.familyId === "ttgo-t-call",
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

function heroProduct(product, index) {
  const labels = ["5 V / 3 W", "Medição AC", "Telemetria", "Projeto IoT"];
  const classes = ["orbit-product--main", "orbit-product--secondary", "orbit-product--tertiary"];
  return `<a class="orbit-product ${classes[index] || ""}" href="${pageUrl(`produtos/${product.slug}/`)}">
    <span class="orbit-product-badge">${escapeHtml(labels[index] || product.internalCategory)}</span>
    ${productPicture(product, { className: "orbit-picture", width: index === 0 ? 620 : 460, height: index === 0 ? 620 : 460, loading: "eager", fetchpriority: index === 0 ? "high" : "auto", sizes: "(min-width: 980px) 320px, 55vw" })}
    <span class="orbit-copy"><strong>${escapeHtml(product.shortTitle || product.title)}</strong><small>${escapeHtml(product.internalCategory)}</small></span>
  </a>`;
}

function categoryCard(category, index) {
  return `<a class="category-card" href="${pageUrl(`categorias/${category.slug}/`)}" data-event="category_click" data-category="${category.slug}" data-position="${index + 1}">
    ${icon(category.icon, "category-icon")}
    <span class="category-count">${categoryCounts[category.slug]}</span>
    <h3>${escapeHtml(category.label)}</h3>
    <p>${escapeHtml(category.description)}</p>
    <strong>Ver categoria ${icon("arrow-right", "text-link-icon")}</strong>
  </a>`;
}

function blogCard(post, index = 0) {
  return `<article class="article-card" data-blog-category="${escapeHtml(normalizeText(post.category))}" data-blog-title="${escapeHtml(normalizeText(post.title))}">
    <a class="article-cover" href="${pageUrl(`blog/${post.slug}/`)}">${blogCoverPicture(post, { loading: index < 3 ? "eager" : "lazy", fetchpriority: index === 0 ? "high" : "auto" })}</a>
    <div class="article-card-content">
      <p class="eyebrow">${escapeHtml(post.category)} · ${formatDate(post.publishedAt)} · ${escapeHtml(post.readingTime)}</p>
      <h3><a href="${pageUrl(`blog/${post.slug}/`)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.summary)}</p>
      <a class="text-link" href="${pageUrl(`blog/${post.slug}/`)}">Ler artigo ${icon("arrow-right", "text-link-icon")}</a>
    </div>
  </article>`;
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
  const heroProducts = selectByPriority().slice(0, 3);
  const recentPosts = [...blogPosts].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))).slice(0, 3);
  const body = `
    <section class="hero-premium">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="hero-eyebrow">ELETRÔNICA · IOT · AUTOMAÇÃO</p>
          <h1>A peça certa para o seu projeto avançar.</h1>
          <p>Componentes eletrônicos, sensores, fontes e módulos para projetos técnicos, com acesso direto às ofertas oficiais da OMEGAIMPORTS.</p>
          <div class="hero-actions">
            <a class="secondary-action" href="${pageUrl("produtos/")}">Explorar produtos ${icon("arrow-right", "btn-icon")}</a>
            <a class="primary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Comprar no Mercado Livre ${icon("external", "btn-icon")}</a>
          </div>
        </div>
        <div class="hero-stage" aria-label="Produtos em destaque">
          <div class="hero-stage-grid" aria-hidden="true"></div>
          ${heroProducts.map(heroProduct).join("")}
          <span class="stage-label stage-label-one">Omega Circuit Lab</span>
          <span class="stage-label stage-label-two">Curadoria técnica</span>
        </div>
      </div>
      <section class="search-dock" aria-label="Busca principal">
        <form action="${pageUrl("produtos/")}" role="search">
          ${icon("search", "search-icon")}
          <label class="sr-only" for="home-search">Buscar componente</label>
          <input id="home-search" name="q" type="search" placeholder="Busque por ESP32, GPS, SCT-013, Hi-Link...">
          <button class="secondary-action" type="submit">Buscar ${icon("arrow-right", "btn-icon")}</button>
        </form>
        <div class="chips">${["ESP32", "GPS", "SCT-013", "ZMCT123A", "HLK-PM01", "fonte de bancada"].map((chip) => `<a href="${pageUrl(`produtos/?q=${encodeURIComponent(chip)}`)}">${chip}</a>`).join("")}</div>
      </section>
    </section>
    <section class="trust-grid" aria-label="Confiança">
      <article>${icon("shield", "trust-icon")}<strong>Compra protegida</strong><p>Pagamento, frete e entrega pelo Mercado Livre.</p></article>
      <article>${icon("package", "trust-icon")}<strong>Produtos reais</strong><p>Imagens e dados vinculados aos anúncios da OMEGAIMPORTS.</p></article>
      <article>${icon("message", "trust-icon")}<strong>Atendimento</strong><p>Ajuda para identificar o componente adequado pelo WhatsApp.</p></article>
    </section>
    ${section({ eyebrow: "Categorias", title: "Principais departamentos técnicos", description: "Acesso rápido aos grupos mais usados em eletrônica, IoT, medição, energia e bancada.", className: "section section--white", content: `<div class="category-grid category-grid--home">${homeCategories.map(categoryCard).join("")}</div><a class="text-link section-after-link" href="${pageUrl("categorias/")}">Ver todas as categorias ${icon("arrow-right", "text-link-icon")}</a>` })}
    ${section({ eyebrow: "Produtos em destaque", title: "Produtos em destaque", description: "Uma vitrine única com itens próprios, ativos, não catálogo e com imagem validada.", action: `<a class="text-link" href="${pageUrl("produtos/")}">Ver todos os produtos ${icon("arrow-right", "text-link-icon")}</a>`, content: `<div class="product-grid product-grid--home">${homeProducts.map((product, index) => productCard(product, index)).join("")}</div>` })}
    ${section({ eyebrow: "Blog técnico", title: "Conteúdo para escolher e aplicar melhor", description: "Artigos práticos conectados aos produtos reais do catálogo.", action: `<a class="text-link" href="${pageUrl("blog/")}">Ver todos os artigos ${icon("arrow-right", "text-link-icon")}</a>`, content: `<div class="article-grid">${recentPosts.map(blogCard).join("")}</div>` })}
    <section class="whatsapp-band">${icon("message", "whatsapp-band-icon")}<div><p class="eyebrow">Atendimento</p><h2>Precisa confirmar o componente certo?</h2><p>Fale pelo WhatsApp oficial da OMEGAIMPORTS para receber ajuda antes de abrir a oferta no Mercado Livre.</p></div><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></section>`;
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
  const body = `<section class="page-hero"><p class="eyebrow">Catálogo</p><h1>Produtos OMEGAIMPORTS</h1><p>Filtros comerciais para encontrar componentes por categoria, família, condição, formato e preço.</p></section>
    <div class="catalog-mobile-bar">
      <button class="filter-toggle" type="button" aria-controls="catalog-filters" aria-expanded="false">${icon("sliders", "btn-icon")} Filtrar e ordenar</button>
      <span><strong>${published.length}</strong> produtos</span>
    </div>
    <div class="filter-scrim" id="filter-scrim" hidden></div>
    <section class="catalog-layout">
      <aside class="filters" id="catalog-filters" aria-label="Filtros do catálogo">
        <div class="filters-head"><strong>Filtros</strong><button class="filter-close" type="button" aria-label="Fechar filtros">${icon("x", "btn-icon")}</button></div>
        <label>Busca<input id="catalog-search" type="search" placeholder="ESP32, SIM800L, GPS, SCT-013..." autocomplete="off"></label>
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

function collectionPages() {
  out("categorias/index.html", pageShell({ title: "Categorias", description: "Categorias técnicas do catálogo OMEGAIMPORTS.", path: "categorias/", body: `<section class="page-hero"><p class="eyebrow">Categorias</p><h1>Organização técnica do catálogo</h1><p>Escolha por tipo de componente e avance para produtos reais, com fotos e ofertas oficiais.</p></section><div class="category-grid page-grid">${visibleCategories.map(categoryCard).join("")}</div>` }));
  for (const category of visibleCategories) {
    const items = collectionItems(category, "categorias");
    out(`categorias/${category.slug}/index.html`, pageShell({ title: category.label, description: category.description, path: `categorias/${category.slug}/`, body: `<section class="page-hero"><p class="eyebrow">Categoria</p><h1>${escapeHtml(category.label)}</h1><p>${escapeHtml(category.description)}</p></section><div class="product-grid">${items.map(productCard).join("")}</div>` }));
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
        <div class="product-summary"><p class="eyebrow">${escapeHtml(product.internalCategory)}</p><h1>${escapeHtml(product.title)}</h1><div class="summary-chips"><span>${conditionLabel(product)}</span><span>${productFormat(product)}</span><span>${escapeHtml(product.internalCategory)}</span></div><p class="summary-price">${formatPrice(product)}</p>${product.priceLastVerifiedAt ? `<p class="updated-at">Preço verificado em ${formatDate(product.priceLastVerifiedAt)}</p>` : ""}<a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta no Mercado Livre ${icon("external", "btn-icon")}</a><p class="external-note">Você será direcionado ao anúncio oficial para confirmar frete, pagamento e disponibilidade.</p></div>
      </section>
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
  out("blog/index.html", pageShell({
    title: "Blog técnico",
    description: "Guias práticos sobre eletrônica, IoT, sensores, fontes, automação e prototipagem.",
    path: "blog/",
    body: `<section class="page-hero blog-hero"><p class="eyebrow">Blog técnico</p><h1>Guias para escolher componentes com mais segurança.</h1><p>Conteúdo editorial conectado aos produtos reais do catálogo OMEGAIMPORTS.</p><form class="blog-search" action="${pageUrl("blog/")}" role="search">${icon("search", "search-icon")}<label class="sr-only" for="blog-search">Buscar no Blog</label><input id="blog-search" name="q" type="search" placeholder="Buscar sensores, fontes, GPS, automação..."></form><div class="chips blog-category-chips"><a data-blog-category="" href="${pageUrl("blog/")}">Todos</a>${categoriesEditorial.map((category) => `<a data-blog-category="${escapeHtml(normalizeText(category))}" href="${pageUrl(`blog/?categoria=${encodeURIComponent(category)}`)}">${escapeHtml(category)}</a>`).join("")}</div></section><p class="result-count blog-result-count" aria-live="polite"><strong id="blog-result-count">${blogPosts.length}</strong> artigos encontrados</p><div class="article-grid page-grid" id="blog-list">${blogPosts.map(blogCard).join("")}</div><div class="empty-state blog-empty-state" id="blog-empty-state" hidden><h2>Nenhum artigo encontrado.</h2><p>Revise a busca ou escolha outra categoria.</p></div>`,
    extraHead: `<script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`,
  }));
  for (const post of blogPosts) {
    const relatedProducts = relatedProductsForPost(post);
    const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 3);
    const body = `<nav class="breadcrumb"><a href="${pageUrl()}">Início</a><a href="${pageUrl("blog/")}">Blog</a><span>${escapeHtml(post.title)}</span></nav>
      <article class="article article-detail">
        <header class="article-header"><p class="eyebrow">${escapeHtml(post.category)} · ${escapeHtml(post.readingTime)}</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.summary)}</p><div class="article-meta"><span>Equipe OMEGAIMPORTS</span><span>Publicado em ${formatDate(post.publishedAt)}</span><span>Revisado em ${formatDate(post.updatedAt)}</span></div></header>
        ${blogCoverPicture(post, { className: "article-hero-cover", width: 1400, height: 788, loading: "eager", fetchpriority: "high", sizes: "(min-width: 1180px) 1080px, 100vw" })}
        <aside class="toc" aria-label="Sumário"><strong>Sumário</strong>${post.sections.map(([title], index) => `<a href="#secao-${index + 1}">${escapeHtml(title)}</a>`).join("")}</aside>
        <div class="article-section-grid">
          ${post.sections.map(([title, text], index) => `<section class="article-section" id="secao-${index + 1}"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`).join("")}
          <section class="article-section article-section--wide"><h2>Conclusão</h2><p>Use o artigo como ponto de partida e confirme modelo, tensão, corrente, acessórios e disponibilidade no anúncio oficial antes da compra.</p></section>
          <section class="article-section article-section--wide"><h2>Referências técnicas</h2><ul>${post.references.map((reference) => `<li>${escapeHtml(reference)}</li>`).join("")}</ul></section>
        </div>
        <section class="article-whatsapp"><h2>Precisa de ajuda para escolher?</h2><p>Envie sua dúvida pelo WhatsApp oficial da OMEGAIMPORTS e informe o tipo de projeto, tensão, corrente e aplicação desejada.</p><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></section>
      </article>
      ${relatedProducts.length ? section({ eyebrow: "Produtos relacionados", title: "Itens do catálogo ligados a este tema", className: "section section--white", content: `<div class="product-grid">${relatedProducts.map(productCard).join("")}</div>` }) : ""}
      ${relatedPosts.length ? section({ eyebrow: "Continue lendo", title: "Artigos relacionados", content: `<div class="article-grid article-grid--compact">${relatedPosts.map(blogCard).join("")}</div>` }) : ""}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      image: absolute(`${post.cover}-og.jpg`),
      author: { "@type": "Organization", name: "OMEGAIMPORTS" },
      publisher: { "@type": "Organization", name: "OMEGAIMPORTS" },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: absolute(`blog/${post.slug}/`),
    };
    out(`blog/${post.slug}/index.html`, pageShell({ title: post.title, description: post.summary, path: `blog/${post.slug}/`, body, type: "article", ogImage: `${post.cover}-og.jpg`, extraHead: `<script type="application/ld+json">${JSON.stringify(schema)}</script>` }));
  }
}

function simplePages() {
  const pages = [
    ["sobre", "Sobre a OMEGAIMPORTS", "A OMEGAIMPORTS organiza componentes eletrônicos, IoT, telemetria, energia, prototipagem e automação em uma vitrine técnica ligada aos anúncios oficiais no Mercado Livre.", `<section class="page-hero"><p class="eyebrow">Sobre</p><h1>Uma vitrine técnica para comprar componentes com mais clareza.</h1><p>A OMEGAIMPORTS iniciou suas operações em dezembro de 2024 e atua com componentes eletrônicos, IoT, sensores, fontes, conectores, instrumentos de bancada e itens de prototipagem.</p></section><section class="detail-grid"><div class="detail-block"><h2>Proposta</h2><p>Organizar produtos reais por categoria, aplicação e família técnica, sem transformar a compra em um relatório interno.</p></div><div class="detail-block"><h2>Mercado Livre</h2><p>A finalização da compra acontece no anúncio oficial, onde preço, estoque, frete e pagamento são confirmados.</p></div><div class="detail-block"><h2>Clareza técnica</h2><p>Os textos priorizam informação objetiva, cuidados de uso e relação entre produto, aplicação e conteúdo editorial.</p></div><div class="detail-block"><h2>WhatsApp</h2><p>Para dúvidas sobre escolha de componente, compatibilidade ou aplicação, fale com a OMEGAIMPORTS pelo WhatsApp oficial.</p><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></div></section>`],
    ["como-comprar", "Como comprar", "Encontre o produto, confira modelo e condição, abra o anúncio oficial e finalize a compra pelo Mercado Livre.", `<section class="page-hero"><h1>Como comprar</h1><p>Use o catálogo para comparar componentes e finalize sempre no anúncio oficial da OMEGAIMPORTS no Mercado Livre.</p></section>`],
    ["politica-de-privacidade", "Política de privacidade", "Este site é uma vitrine estática. Não cria contas, não processa pagamentos e não armazena dados de checkout.", `<section class="page-hero"><h1>Política de privacidade</h1><p>Este site é uma vitrine estática. Não cria contas, não processa pagamentos e não armazena dados de checkout.</p></section>`],
    ["termos-de-uso", "Termos de uso", "As informações ajudam a organizar e comparar produtos. Condições finais devem ser confirmadas no Mercado Livre.", `<section class="page-hero"><h1>Termos de uso</h1><p>Preços, disponibilidade, frete, pagamento e condições finais devem ser confirmados no anúncio oficial do Mercado Livre.</p></section>`],
    ["contato", "Contato", "Atendimento pelo WhatsApp oficial da OMEGAIMPORTS e compra finalizada pelo Mercado Livre.", `<section class="page-hero"><h1>Contato</h1><p>Para dúvidas sobre produto, compatibilidade, quantidade, frete ou prazo, fale pelo WhatsApp oficial da OMEGAIMPORTS.</p><a class="whatsapp-action whatsapp-link" href="${site.whatsappUrl}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp ${icon("message", "btn-icon")}</a></section>`],
    ["duvidas-frequentes", "Dúvidas frequentes", "O site não tem checkout próprio. Preço, frete, estoque e prazo são confirmados no Mercado Livre.", `<section class="page-hero"><h1>Dúvidas frequentes</h1><p>O site não tem checkout próprio. Preço, frete, estoque e prazo são confirmados no Mercado Livre.</p></section>`],
  ];
  for (const [slug, title, description, body] of pages) out(`${slug}/index.html`, pageShell({ title, description, path: `${slug}/`, body }));
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
