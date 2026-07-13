import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  absolute,
  applicationCards,
  assetUrl,
  categories,
  conditionLabel,
  escapeHtml,
  familyCards,
  formatDate,
  formatPrice,
  guides,
  loadProducts,
  normalizeText,
  pageShell,
  pageUrl,
  productAlt,
  productCard,
  productFormat,
  productPicture,
  site,
} from "./shared.mjs";

const dist = new URL("../dist/", import.meta.url);
const allProducts = loadProducts({ all: true });
const published = loadProducts().filter((product) => product.active && product.imageStatus === "verified" && !product.image?.includes("product-placeholder"));
const hidden = allProducts.filter((product) => product.status !== "published");
const merchandising = JSON.parse(readFileSync(new URL("../src/data/home-merchandising.json", import.meta.url), "utf8"));
const categoryCounts = Object.fromEntries(categories.map((category) => [category.slug, published.filter((product) => product.internalCategorySlug === category.slug).length]));
const visibleCategories = categories.filter((category) => (categoryCounts[category.slug] || 0) > 0);
const visibleFamilies = familyCards.filter((family) => published.some((product) => product.familyId === family.slug));
const visibleApplications = applicationCards.filter((app) => collectionItems(app, "aplicacoes").length > 0);

function out(path, html) {
  const target = new URL(path, dist);
  mkdirSync(dirname(fileURLToPath(target)), { recursive: true });
  writeFileSync(target, html, "utf8");
}

function copyAssets() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(new URL("../public/brand/", import.meta.url), new URL("brand/", dist), { recursive: true });
  cpSync(new URL("../public/assets/", import.meta.url), new URL("assets/", dist), { recursive: true });
  cpSync(new URL("../public/products/", import.meta.url), new URL("products/", dist), { recursive: true });
}

function section(title, content, cls = "") {
  return `<section class="section ${cls}"><div class="section-heading"><h2>${title}</h2></div>${content}</section>`;
}

function icon(name) {
  const shapes = {
    microcontroller: '<rect x="16" y="16" width="32" height="32" rx="4"/><path d="M22 8v8M32 8v8M42 8v8M22 48v8M32 48v8M42 48v8M8 22h8M8 32h8M8 42h8M48 22h8M48 32h8M48 42h8"/><path d="M24 28h16M24 36h10"/>',
    antenna: '<path d="M32 50V28"/><circle cx="32" cy="22" r="4"/><path d="M22 28a14 14 0 0 1 20 0M15 21a24 24 0 0 1 34 0M9 14a33 33 0 0 1 46 0"/>',
    gps: '<path d="M32 56s18-17 18-32A18 18 0 1 0 14 24c0 15 18 32 18 32Z"/><circle cx="32" cy="24" r="6"/>',
    meter: '<path d="M13 43a22 22 0 1 1 38 0"/><path d="M32 41l10-17"/><path d="M20 43h24"/>',
    power: '<path d="M28 6h16L34 28h14L24 58l6-24H17L28 6Z"/>',
    command: '<rect x="12" y="14" width="40" height="36" rx="4"/><path d="M20 26h24M20 38h24"/><circle cx="24" cy="26" r="2"/><circle cx="40" cy="38" r="2"/>',
    components: '<path d="M18 20h28v24H18z"/><path d="M8 26h10M8 38h10M46 26h10M46 38h10"/><path d="M26 28h12M26 36h7"/>',
    connectors: '<path d="M18 18h18v28H18zM36 25h10a8 8 0 0 1 0 16H36"/><path d="M12 26h6M12 38h6"/>',
    instruments: '<rect x="10" y="16" width="44" height="34" rx="5"/><path d="M18 28h18M18 38h10"/><circle cx="43" cy="34" r="5"/>',
  };
  return `<svg class="category-icon" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${shapes[name] || shapes.components}</g></svg>`;
}

function selectHomeProducts() {
  const max = Math.max(6, Math.min(Number(merchandising.maximumProducts || 8), 8));
  const excluded = new Set(merchandising.excludedMlbIds || []);
  const byId = new Map(published.map((product) => [product.mlbId, product]));
  const selected = [];
  const seen = new Set();
  for (const id of merchandising.pinnedMlbIds || []) {
    const product = byId.get(id);
    if (product && !excluded.has(id)) {
      selected.push(product);
      seen.add(id);
    }
  }
  const pool = published
    .filter((product) => !seen.has(product.mlbId) && !excluded.has(product.mlbId) && product.price && product.priceLastVerifiedAt)
    .sort((a, b) => {
      const categoryA = selected.some((item) => item.internalCategorySlug === a.internalCategorySlug) ? 1 : 0;
      const categoryB = selected.some((item) => item.internalCategorySlug === b.internalCategorySlug) ? 1 : 0;
      const familyA = selected.some((item) => item.familyId && item.familyId === a.familyId) ? 1 : 0;
      const familyB = selected.some((item) => item.familyId && item.familyId === b.familyId) ? 1 : 0;
      return categoryA - categoryB || familyA - familyB || a.price - b.price;
    });
  for (const product of pool) {
    if (selected.length >= max) break;
    selected.push(product);
  }
  if (published.length && selected.length < 6) throw new Error("Home merchandising retornou menos de 6 produtos publicados.");
  return selected;
}

function heroProduct(product, index) {
  return `<a class="hero-product hero-product-${index + 1}" href="${pageUrl(`produtos/${product.slug}/`)}">
    ${productPicture(product, { className: "hero-product-picture", width: 360, height: 360, loading: "eager", fetchpriority: index === 0 ? "high" : "auto", sizes: "(min-width: 900px) 260px, 44vw" })}
    <span>${escapeHtml(product.shortTitle || product.title)}</span>
    <small>${escapeHtml(product.internalCategory)}</small>
  </a>`;
}

function categoryCard(category) {
  return `<a class="category-card" href="${pageUrl(`categorias/${category.slug}/`)}">
    ${icon(category.icon)}
    <span>${categoryCounts[category.slug]}</span>
    <h3>${escapeHtml(category.label)}</h3>
    <p>${escapeHtml(category.description)}</p>
    <strong>Explorar categoria</strong>
  </a>`;
}

function collectionItems(entry, route) {
  if (route === "categorias") return published.filter((product) => product.internalCategorySlug === entry.slug);
  if (route === "familias") return published.filter((product) => product.familyId === entry.slug);
  const applicationCategories = {
    "telemetria-e-conectividade": ["iot-gsm-e-comunicacao", "gps-e-localizacao"],
    "monitoramento-de-energia": ["sensores-e-medicao", "fontes-e-alimentacao"],
    "automacao-e-comando": ["automacao-e-comando"],
    "prototipagem-eletronica": ["componentes-eletronicos", "placas-e-microcontroladores", "instrumentos-de-bancada"],
  };
  const categorySlugs = applicationCategories[entry.slug] || [];
  return published.filter((product) => categorySlugs.includes(product.internalCategorySlug));
}

function combinedFamilyApplications() {
  return `<div class="split-grid">
    <div>
      <h3>Familias e kits</h3>
      <div class="compact-list">${visibleFamilies.slice(0, 5).map((family) => `<a href="${pageUrl(`familias/${family.slug}/`)}"><strong>${family.label}</strong><span>${family.description}</span></a>`).join("")}</div>
    </div>
    <div>
      <h3>Solucoes por aplicacao</h3>
      <div class="compact-list">${visibleApplications.map((app) => `<a href="${pageUrl(`aplicacoes/${app.slug}/`)}"><strong>${app.label}</strong><span>${app.description}</span></a>`).join("")}</div>
    </div>
  </div>`;
}

function home() {
  const homeProducts = selectHomeProducts();
  const heroProducts = [...homeProducts].sort((a, b) => (a.familyId || a.internalCategorySlug).localeCompare(b.familyId || b.internalCategorySlug)).slice(0, 3);
  const body = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Eletronica, IoT e automacao</p>
        <h1>Componentes reais, organizados para compra tecnica.</h1>
        <p>Explore modulos, sensores, fontes, conectores e itens de bancada com fotos oficiais, preco atualizado e link direto para a oferta da OMEGAIMPORTS no Mercado Livre.</p>
        <div class="hero-actions">
          <a class="primary-action" href="${pageUrl("produtos/")}">Ver catalogo</a>
          <a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Loja no Mercado Livre</a>
        </div>
      </div>
      <div class="hero-visual">${heroProducts.map(heroProduct).join("")}</div>
    </section>
    <section class="main-search-band" aria-label="Busca principal">
      <form action="${pageUrl("produtos/")}" role="search">
        <label class="sr-only" for="home-search">Buscar componente</label>
        <input id="home-search" name="q" type="search" placeholder="Busque por ESP32, GPS, SCT-013, Hi-Link, contator...">
        <button type="submit">Buscar</button>
      </form>
      <div class="chips">${["ESP32", "GPS", "SCT-013", "ZMCT123A", "HLK-PM01", "Split Bolt", "fonte de bancada"].map((chip) => `<a href="${pageUrl(`produtos/?q=${encodeURIComponent(chip)}`)}">${chip}</a>`).join("")}</div>
    </section>
    <section class="trust-grid" aria-label="Provas de confianca">
      <article><h2>41 ofertas publicas</h2><p>Somente produtos ativos, com imagem real e link para o anuncio oficial.</p></article>
      <article><h2>Compra protegida</h2><p>Pagamento, frete e prazo continuam dentro do Mercado Livre.</p></article>
      <article><h2>Busca tecnica</h2><p>Encontre por modelo, MLB, familia, categoria ou sigla do componente.</p></article>
    </section>
    ${section("Categorias", `<div class="category-grid">${visibleCategories.map(categoryCard).join("")}</div>`, "light")}
    ${section("Produtos em destaque", `<div class="product-grid">${homeProducts.map(productCard).join("")}</div>`, "light featured-section")}
    ${section("Familias e aplicacoes", combinedFamilyApplications(), "light")}
    ${section("Guias tecnicos", `<div class="guide-grid">${guides.map((guide) => `<a href="${pageUrl(`guias/${guide.slug}/`)}"><h3>${guide.title}</h3><p>${guide.summary}</p></a>`).join("")}</div>`, "light")}
    <section class="final-cta"><h2>Escolha o componente certo e finalize no anuncio oficial.</h2><p>Use a vitrine para comparar formato, condicao, preco e familia. A compra acontece sempre na pagina da OMEGAIMPORTS no Mercado Livre.</p><a class="primary-action" href="${pageUrl("produtos/")}">Explorar produtos</a><a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Loja no Mercado Livre</a></section>`;
  out("index.html", pageShell({ title: "Componentes reais para projetos tecnicos", description: "Vitrine tecnica OMEGAIMPORTS com produtos oficiais do Mercado Livre, fotos reais, categorias e busca por componente.", body }));
}

function catalog() {
  const body = `<section class="page-hero"><p class="eyebrow">Catalogo</p><h1>Produtos OMEGAIMPORTS</h1><p>Filtros comerciais para encontrar componentes por categoria, familia, condicao, formato e preco.</p></section>
    <section class="catalog-layout">
      <aside class="filters" aria-label="Filtros do catalogo">
        <label>Busca<input id="catalog-search" type="search" placeholder="ESP32, SIM800L, GPS, SCT-013..." autocomplete="off"></label>
        <label>Categoria<select id="category-filter"><option value="">Todas</option>${visibleCategories.map((c) => `<option value="${c.slug}">${c.label}</option>`).join("")}</select></label>
        <label>Familia<select id="family-filter"><option value="">Todas</option>${familyCards.filter((family) => published.some((product) => product.familyId === family.slug)).map((family) => `<option value="${family.slug}">${family.label}</option>`).join("")}</select></label>
        <label>Condicao<select id="condition-filter"><option value="">Todas</option><option value="novo">Novo</option><option value="usado">Usado</option></select></label>
        <label>Formato<select id="package-filter"><option value="">Todos</option><option value="unit">Unidade</option><option value="kit">Kit</option></select></label>
        <label>Preco<select id="price-filter"><option value="">Todos</option><option value="0-100">Ate R$ 100</option><option value="100-300">R$ 100 a R$ 300</option><option value="300-999999">Acima de R$ 300</option></select></label>
        <label>Ordenacao<select id="sort-filter"><option value="relevance">Relevancia</option><option value="price-asc">Menor preco</option><option value="price-desc">Maior preco</option><option value="title">Nome</option></select></label>
        <button class="clear-filters" type="button" id="clear-filters">Limpar</button>
      </aside>
      <div><p class="result-count" aria-live="polite"><strong id="result-count">${published.length}</strong> produtos encontrados</p><div class="product-grid" id="product-list">${published.map(productCard).join("")}</div><div class="empty-state" id="empty-state" hidden><h2>Nenhum produto encontrado.</h2><p>Revise o termo ou remova alguns filtros.</p></div></div>
    </section>`;
  out("produtos/index.html", pageShell({ title: "Produtos", description: "Catalogo com busca e filtros de ofertas publicas da OMEGAIMPORTS.", path: "produtos/", body }));
}

function collectionPages(kind, entries, route) {
  const visibleEntries = entries.filter((entry) => collectionItems(entry, route).length > 0);
  out(`${route}/index.html`, pageShell({ title: kind, description: `${kind} do catalogo tecnico OMEGAIMPORTS.`, path: `${route}/`, body: `<section class="page-hero"><h1>${kind}</h1><p>Organizacao comercial para chegar rapidamente ao componente certo.</p></section><div class="category-grid page-grid">${visibleEntries.map((entry) => `<a class="category-card" href="${pageUrl(`${route}/${entry.slug}/`)}">${entry.icon ? icon(entry.icon) : ""}<h2>${entry.label}</h2><p>${entry.description}</p></a>`).join("")}</div>` }));
  for (const entry of visibleEntries) {
    const items = collectionItems(entry, route);
    if (!items.length) continue;
    out(`${route}/${entry.slug}/index.html`, pageShell({ title: entry.label, description: entry.description, path: `${route}/${entry.slug}/`, body: `<section class="page-hero"><p class="eyebrow">${kind}</p><h1>${entry.label}</h1><p>${entry.description}</p></section><div class="product-grid">${items.map(productCard).join("")}</div>` }));
  }
}

function productPages() {
  for (const product of published) {
    const specs = product.specifications?.length ? `<section class="detail-block"><h2>Especificacoes</h2><dl class="spec-table">${product.specifications.slice(0, 14).map((s) => `<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join("")}</dl></section>` : "";
    const related = published.filter((item) => item.mlbId !== product.mlbId && (item.familyId === product.familyId || item.internalCategorySlug === product.internalCategorySlug)).slice(0, 4);
    const body = `<nav class="breadcrumb"><a href="${pageUrl()}">Inicio</a><a href="${pageUrl("produtos/")}">Produtos</a><span>${escapeHtml(product.shortTitle)}</span></nav>
      <section class="product-detail">
        <div class="product-gallery">
          ${productPicture(product, { className: "product-detail-picture", width: 720, height: 720, loading: "eager", fetchpriority: "high", sizes: "(min-width: 900px) 48vw, 100vw" })}
          <a class="image-open" href="${assetUrl(`products/${product.mlbId}/optimized/main.jpg`)}">Abrir imagem maior</a>
        </div>
        <div class="product-summary"><p class="eyebrow">${escapeHtml(product.internalCategory)}</p><h1>${escapeHtml(product.title)}</h1><div class="summary-chips"><span>${conditionLabel(product)}</span><span>${productFormat(product)}</span><span>${product.mlbId}</span></div><p class="summary-price">${formatPrice(product)}</p>${product.priceLastVerifiedAt ? `<p class="updated-at">Atualizado em ${formatDate(product.priceLastVerifiedAt)}</p>` : ""}<a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta no Mercado Livre</a><p class="external-note">Voce sera direcionado ao anuncio oficial da OMEGAIMPORTS para confirmar frete, pagamento e disponibilidade.</p></div>
      </section>
      <section class="detail-grid"><section class="detail-block"><h2>Resumo</h2><p>${escapeHtml(product.technicalSummary || product.shortDescription || product.title)}</p></section>${specs}<section class="detail-block"><h2>Caracteristicas</h2><ul><li>${productFormat(product)}</li><li>${conditionLabel(product)}</li><li>${escapeHtml(product.internalCategory)}</li></ul></section><section class="detail-block"><h2>Cuidados</h2><p>Confirme tensao, corrente, pinagem, acessorios e compatibilidade diretamente no anuncio antes da compra.</p></section></section>
      ${related.length ? section("Relacionados", `<div class="product-grid">${related.map(productCard).join("")}</div>`, "light") : ""}`;
    out(`produtos/${product.slug}/index.html`, pageShell({ title: product.title, description: product.technicalSummary || product.title, path: `produtos/${product.slug}/`, body, extraHead: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: absolute("") }, { "@type": "ListItem", position: 2, name: "Produtos", item: absolute("produtos/") }, { "@type": "ListItem", position: 3, name: product.title, item: absolute(`produtos/${product.slug}/`) }] })}</script>` }));
  }
}

function guidePages() {
  out("guias/index.html", pageShell({ title: "Guias tecnicos", description: "Conteudos tecnicos da OMEGAIMPORTS para escolha de componentes.", path: "guias/", body: `<section class="page-hero"><h1>Guias tecnicos</h1><p>Conteudo pratico para apoiar decisoes de projeto.</p></section><div class="guide-grid page-grid">${guides.map((guide) => `<a href="${pageUrl(`guias/${guide.slug}/`)}"><h2>${guide.title}</h2><p>${guide.summary}</p></a>`).join("")}</div>` }));
  for (const guide of guides) {
    out(`guias/${guide.slug}/index.html`, pageShell({ title: guide.title, description: guide.summary, path: `guias/${guide.slug}/`, body: `<article class="article"><p class="eyebrow">Guia tecnico</p><h1>${guide.title}</h1><p>${guide.summary}</p><h2>Como avaliar</h2><p>Comece pelo objetivo do projeto, faixa eletrica esperada, ambiente de instalacao, interfaces necessarias e limites do componente.</p><h2>Pontos de atencao</h2><ul><li>Confirme tensao, corrente, pinagem e acessorios no anuncio.</li><li>Para tensao de rede ou comandos eletricos, conte com profissional habilitado.</li><li>Use o campo de perguntas do Mercado Livre quando algo nao estiver claro.</li></ul></article>` }));
  }
}

function simplePages() {
  const pages = [
    ["sobre", "Sobre a OMEGAIMPORTS", "A OMEGAIMPORTS e uma operacao de e-commerce tecnico fundada em 23 de dezembro de 2024, especializada em componentes eletroeletronicos, IoT, telemetria, energia, prototipagem e automacao."],
    ["como-comprar", "Como comprar", "Encontre o produto, confira modelo, quantidade, condicao e atualizacao, abra o anuncio oficial no Mercado Livre e finalize pagamento, frete e entrega pela plataforma."],
    ["duvidas-frequentes", "Duvidas frequentes", "O site nao tem checkout proprio. Preco, frete, estoque e prazo sao confirmados no Mercado Livre."],
    ["contato", "Contato", "Para duvidas sobre produto, compatibilidade, quantidade, frete ou prazo, use o campo de perguntas do anuncio correspondente no Mercado Livre."],
    ["politica-de-privacidade", "Politica de privacidade", "Este site e uma vitrine estatica. Nao cria contas, nao processa pagamentos e nao armazena dados de checkout."],
    ["termos-de-uso", "Termos de uso", "As informacoes ajudam a organizar e comparar produtos. Precos, disponibilidade, frete, pagamento e condicoes finais devem ser confirmados no Mercado Livre."],
  ];
  for (const [slug, title, text] of pages) out(`${slug}/index.html`, pageShell({ title, description: text.slice(0, 150), path: `${slug}/`, body: `<section class="page-hero"><h1>${title}</h1><p>${text}</p></section>` }));
}

function supportFiles() {
  const urls = ["", "produtos/", "familias/", "categorias/", "aplicacoes/", "guias/", "sobre/", "como-comprar/", "duvidas-frequentes/", "contato/", "politica-de-privacidade/", "termos-de-uso/", ...published.map((p) => `produtos/${p.slug}/`), ...visibleCategories.map((c) => `categorias/${c.slug}/`), ...visibleFamilies.map((f) => `familias/${f.slug}/`), ...visibleApplications.map((a) => `aplicacoes/${a.slug}/`), ...guides.map((g) => `guias/${g.slug}/`)];
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${absolute(url)}</loc></url>`).join("\n")}\n</urlset>`);
  out("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("sitemap.xml")}\n`);
  out("404.html", pageShell({ title: "Pagina nao encontrada", description: "Pagina nao encontrada.", path: "404.html", body: `<section class="page-hero"><h1>Pagina nao encontrada</h1><p>O endereco pode ter mudado.</p><a class="primary-action" href="${pageUrl("produtos/")}">Ver produtos</a></section>` }));
}

if (!published.length) throw new Error("Nenhum produto publico elegivel para publicar.");
copyAssets();
home();
catalog();
collectionPages("Categorias", visibleCategories, "categorias");
collectionPages("Familias", familyCards, "familias");
collectionPages("Aplicacoes", applicationCards, "aplicacoes");
productPages();
guidePages();
simplePages();
supportFiles();
console.log(`Build estatico concluido: ${published.length} produtos publicos e ${hidden.length} pendentes/ocultos em dist/.`);
