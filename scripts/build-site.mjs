import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  absolute,
  applicationCards,
  categories,
  escapeHtml,
  familyCards,
  formatPrice,
  guides,
  href,
  loadProducts,
  pageShell,
  productAlt,
  productCard,
  site,
} from "./shared.mjs";

const dist = new URL("../dist/", import.meta.url);
const allProducts = loadProducts({ all: true });
const published = loadProducts();
const hidden = allProducts.filter((product) => product.status !== "published");
const categoryCounts = Object.fromEntries(categories.map((category) => [category.slug, published.filter((product) => product.internalCategorySlug === category.slug).length]));

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
}

function section(title, content, cls = "") {
  return `<section class="section ${cls}"><div class="section-heading"><h2>${title}</h2></div>${content}</section>`;
}

function safeCatalogNotice() {
  return `<div class="audit-empty"><h3>Catálogo público em revisão técnica</h3><p>${hidden.length} anúncios foram preservados na base auditável, mas estão ocultos até que API, imagem real, condição, quantidade e status do Mercado Livre sejam confirmados.</p><a class="secondary-action" href="${href("como-comprar/")}">Como validamos os produtos</a></div>`;
}

function home() {
  const featured = published.filter((product) => product.featured && product.imageStatus === "verified").slice(0, 8);
  const selected = featured.length ? featured.map(productCard).join("") : safeCatalogNotice();
  const body = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">ELETRÔNICA • IoT • AUTOMAÇÃO</p>
        <h1>Hardware técnico para transformar ideias em projetos reais.</h1>
        <p>Encontre módulos, sensores, fontes e componentes para prototipagem, telemetria, medição e automação — com compra segura pelo Mercado Livre.</p>
        <div class="hero-actions">
          <a class="primary-action" href="${href("produtos/")}">Encontrar meu componente</a>
          <a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Ver ofertas no Mercado Livre</a>
        </div>
        <p class="hero-note">Desde 2024 conectando tecnologia, engenharia e operação.</p>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <img class="hero-bg" src="${href("brand/visuals/hero-circuit-background.webp")}" alt="" width="760" height="620">
        <img class="hero-logo" src="${href("brand/logo-symbol.webp")}" alt="" width="330" height="330">
      </div>
    </section>
    <section class="main-search-band" aria-label="Busca principal">
      <form action="${href("produtos/")}" role="search">
        <label class="sr-only" for="home-search">Buscar componente</label>
        <input id="home-search" name="q" type="search" placeholder="Busque por ESP32, GPS, SCT-013, Hi-Link, contator...">
        <button type="submit">Buscar</button>
      </form>
      <div class="chips">${["TTGO T-Call", "Sensores de corrente", "GPS", "Fontes AC/DC", "Automação", "Componentes"].map((chip) => `<a href="${href(`produtos/?q=${encodeURIComponent(chip)}`)}">${chip}</a>`).join("")}</div>
    </section>
    <section class="trust-grid" aria-label="Provas de confiança">
      <article><h2>Compra pelo Mercado Livre</h2><p>Pagamento, frete e condições no anúncio.</p></article>
      <article><h2>Produtos conferidos</h2><p>Atenção ao modelo, à quantidade e à condição.</p></article>
      <article><h2>Catálogo técnico</h2><p>Organização por família, aplicação e especificação.</p></article>
    </section>
    ${section("Categorias", `<div class="category-grid">${categories.slice(0, 6).map((category, index) => `<a class="category-card" href="${href(`categorias/${category.slug}/`)}"><img src="${href(["brand/visuals/category-iot.webp", "brand/visuals/category-energy.webp", "brand/visuals/category-automation.webp", "brand/visuals/category-components.webp"][index % 4])}" alt="" width="120" height="80"><span>${categoryCounts[category.slug] || 0}</span><h3>${category.label}</h3><p>${category.description}</p><strong>Explorar categoria</strong></a>`).join("")}</div>`, "light")}
    ${section("Produtos em destaque", `<div class="product-grid">${selected}</div>`, "light")}
    ${section("Famílias e kits", `<div class="family-grid">${familyCards.map((family) => `<a href="${href(`familias/${family.slug}/`)}"><h3>${family.label}</h3><p>${family.description}</p><strong>Comparar opções</strong></a>`).join("")}</div>`, "light")}
    ${section("Soluções por aplicação", `<div class="solution-grid">${applicationCards.map((app) => `<a href="${href(`aplicacoes/${app.slug}/`)}"><h3>${app.label}</h3><p>${app.description}</p></a>`).join("")}</div>`, "light")}
    ${section("Produtos novos ou atualizados", published.length ? `<div class="product-grid">${published.slice(0, 4).map(productCard).join("")}</div>` : safeCatalogNotice(), "light")}
    ${section("Como funciona", `<ol class="steps"><li><strong>Encontre</strong><span>Pesquise por produto, sigla, modelo, MLB, aplicação ou categoria.</span></li><li><strong>Compare</strong><span>Confira condição, quantidade, atualização e fonte dos dados.</span></li><li><strong>Compre</strong><span>Finalize preço, pagamento, frete e entrega no Mercado Livre.</span></li></ol>`, "light")}
    ${section("Guias técnicos", `<div class="guide-grid">${guides.map((guide) => `<a href="${href(`guias/${guide.slug}/`)}"><h3>${guide.title}</h3><p>${guide.summary}</p></a>`).join("")}</div>`, "light")}
    <section class="final-cta"><h2>Confirme o componente certo antes de comprar.</h2><p>Use o catálogo técnico para orientar a busca e finalize sempre no anúncio oficial da OMEGAIMPORTS no Mercado Livre.</p><a class="primary-action" href="${href("produtos/")}">Explorar catálogo</a><a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Comprar no Mercado Livre</a></section>`;
  out("index.html", pageShell({ title: "Hardware técnico para projetos reais", description: "Catálogo técnico OMEGAIMPORTS para eletrônica, IoT, telemetria, energia e automação.", body }));
}

function catalog() {
  const list = published.length ? published.map(productCard).join("") : safeCatalogNotice();
  const body = `<section class="page-hero"><p class="eyebrow">Catálogo</p><h1>Produtos OMEGAIMPORTS</h1><p>Busca, filtros e revisão de elegibilidade para compra segura no Mercado Livre.</p></section>
    <section class="catalog-layout">
      <aside class="filters" aria-label="Filtros do catálogo">
        <label>Busca<input id="catalog-search" type="search" placeholder="ESP32, SIM800L, GPS, SCT-013..." autocomplete="off"></label>
        <label>Categoria<select id="category-filter"><option value="">Todas</option>${categories.map((c) => `<option value="${c.slug}">${c.label}</option>`).join("")}</select></label>
        <label>Família<select id="family-filter"><option value="">Todas</option>${familyCards.map((family) => `<option value="${family.slug}">${family.label}</option>`).join("")}</select></label>
        <label>Condição<select id="condition-filter"><option value="">Todas</option><option value="novo">Novo</option><option value="usado">Usado</option></select></label>
        <label>Formato<select id="package-filter"><option value="">Todos</option><option value="unit">Unidade</option><option value="kit">Kit</option></select></label>
        <label>Imagem<select id="image-filter"><option value="">Todos</option><option value="verified">Verificada</option><option value="missing">Ausente</option><option value="mismatch">Incompatível</option><option value="pending-review">Pendente</option></select></label>
        <label>Ordenação<select id="sort-filter"><option value="relevance">Relevância</option><option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="title">Nome</option><option value="featured">Destaques</option></select></label>
        <button class="clear-filters" type="button" id="clear-filters">Limpar</button>
      </aside>
      <div><p class="result-count" aria-live="polite"><strong id="result-count">${published.length}</strong> produtos encontrados</p><div class="product-grid" id="product-list">${list}</div><div class="empty-state" id="empty-state" hidden><h2>Nenhum produto encontrado</h2><p>Tente remover filtros ou buscar por outro termo técnico.</p></div></div>
    </section>`;
  out("produtos/index.html", pageShell({ title: "Produtos", description: "Catálogo com busca, filtros e links para ofertas elegíveis da OMEGAIMPORTS.", path: "produtos/", body }));
}

function collectionPages(kind, entries, route) {
  out(`${route}/index.html`, pageShell({ title: kind, description: `${kind} do catálogo técnico OMEGAIMPORTS.`, path: `${route}/`, body: `<section class="page-hero"><h1>${kind}</h1><p>Organização técnica para encontrar o componente correto sem misturar anúncios, kits ou condições.</p></section><div class="category-grid page-grid">${entries.map((entry) => `<a class="category-card" href="${href(`${route}/${entry.slug}/`)}"><h2>${entry.label}</h2><p>${entry.description}</p></a>`).join("")}</div>` }));
  for (const entry of entries) {
    const items = route === "categorias" ? published.filter((product) => product.internalCategorySlug === entry.slug) : route === "familias" ? published.filter((product) => product.familyId === entry.slug) : published.filter((product) => product.searchTerms.some((term) => term.toLowerCase().includes(entry.label.toLowerCase().split(" ")[0])));
    out(`${route}/${entry.slug}/index.html`, pageShell({ title: entry.label, description: entry.description, path: `${route}/${entry.slug}/`, body: `<section class="page-hero"><p class="eyebrow">${kind}</p><h1>${entry.label}</h1><p>${entry.description}</p></section>${items.length ? `<div class="product-grid">${items.map(productCard).join("")}</div>` : safeCatalogNotice()}` }));
  }
}

function productPages() {
  for (const product of published) {
    const specs = product.specifications?.length ? `<section class="detail-block"><h2>Especificações</h2><dl class="spec-table">${product.specifications.map((s) => `<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join("")}</dl></section>` : "";
    const body = `<nav class="breadcrumb"><a href="${href()}">Início</a><a href="${href("produtos/")}">Produtos</a><span>${escapeHtml(product.shortTitle)}</span></nav>
      <section class="product-detail">
        <div class="product-gallery"><img src="${href(product.image)}" alt="${escapeHtml(productAlt(product))}" width="720" height="720"></div>
        <div class="product-summary"><p class="eyebrow">${escapeHtml(product.internalCategory)}</p><h1>${escapeHtml(product.title)}</h1><dl class="quick-specs"><div><dt>MLB</dt><dd>${product.mlbId}</dd></div><div><dt>Condição</dt><dd>${product.condition}</dd></div><div><dt>Quantidade</dt><dd>${product.quantity > 1 ? `Kit com ${product.quantity}` : "Unidade"}</dd></div><div><dt>Preço</dt><dd>${formatPrice(product)}</dd></div><div><dt>Atualização</dt><dd>${product.priceLastVerifiedAt}</dd></div></dl><a class="primary-action marketplace-link" href="${product.permalink}" target="_blank" rel="noopener noreferrer sponsored">Ver preço e comprar no Mercado Livre</a><p class="external-note">Você será direcionado ao anúncio oficial da OMEGAIMPORTS.</p></div>
      </section>
      <section class="detail-grid"><section class="detail-block"><h2>Resumo técnico</h2><p>${escapeHtml(product.technicalSummary)}</p></section>${specs}<section class="detail-block"><h2>Aplicações</h2><ul>${product.applications.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></section>${product.includedItems?.length ? `<section class="detail-block"><h2>Itens inclusos</h2><ul>${product.includedItems.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></section>` : ""}<section class="detail-block"><h2>Aviso sobre compra externa</h2><p>Pagamento, frete, entrega, disponibilidade e condições finais devem ser confirmados no Mercado Livre.</p></section></section>`;
    out(`produtos/${product.slug}/index.html`, pageShell({ title: product.title, description: product.technicalSummary, path: `produtos/${product.slug}/`, body, extraHead: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: absolute("") }, { "@type": "ListItem", position: 2, name: "Produtos", item: absolute("produtos/") }, { "@type": "ListItem", position: 3, name: product.title, item: absolute(`produtos/${product.slug}/`) }] })}</script>` }));
  }
}

function guidePages() {
  out("guias/index.html", pageShell({ title: "Guias técnicos", description: "Conteúdos técnicos da OMEGAIMPORTS para escolha de componentes.", path: "guias/", body: `<section class="page-hero"><h1>Guias técnicos</h1><p>Conteúdo prático e prudente para apoiar decisões de projeto.</p></section><div class="guide-grid page-grid">${guides.map((guide) => `<a href="${href(`guias/${guide.slug}/`)}"><h2>${guide.title}</h2><p>${guide.summary}</p></a>`).join("")}</div>` }));
  for (const guide of guides) {
    out(`guias/${guide.slug}/index.html`, pageShell({ title: guide.title, description: guide.summary, path: `guias/${guide.slug}/`, body: `<article class="article"><p class="eyebrow">Guia técnico</p><h1>${guide.title}</h1><p>${guide.summary}</p><h2>Como avaliar</h2><p>Comece pelo objetivo do projeto, faixa elétrica esperada, ambiente de instalação, interfaces necessárias e limites do componente. Compare sempre código do anúncio, condição, quantidade e especificações comprovadas.</p><h2>Pontos de atenção</h2><ul><li>Não use imagem como única fonte de compatibilidade.</li><li>Confirme tensão, corrente, pinagem e acessórios no anúncio.</li><li>Para tensão de rede ou comandos elétricos, conte com profissional habilitado.</li><li>Use o campo de perguntas do Mercado Livre quando algo não estiver claro.</li></ul></article>` }));
  }
}

function simplePages() {
  const pages = [
    ["sobre", "Sobre a OMEGAIMPORTS", "A OMEGAIMPORTS é uma operação de e-commerce técnico fundada em 23 de dezembro de 2024, especializada em componentes eletroeletrônicos, IoT, telemetria, energia, prototipagem e automação."],
    ["como-comprar", "Como comprar", "Encontre o produto, confira modelo, quantidade, condição e atualização, abra o anúncio oficial no Mercado Livre e finalize pagamento, frete e entrega pela plataforma."],
    ["duvidas-frequentes", "Dúvidas frequentes", "O site não tem checkout próprio. Preço, frete, estoque e prazo são confirmados no Mercado Livre. Produtos sem imagem ou dados validados ficam ocultos até revisão."],
    ["contato", "Contato", "Para dúvidas sobre produto, compatibilidade, quantidade, frete ou prazo, use o campo de perguntas do anúncio correspondente no Mercado Livre. WhatsApp só é exibido quando configurado."],
    ["politica-de-privacidade", "Política de privacidade", "Este site é uma vitrine estática. Não cria contas, não processa pagamentos e não armazena dados de checkout. Eventos de analytics permanecem inativos até configuração explícita."],
    ["termos-de-uso", "Termos de uso", "As informações ajudam a organizar e comparar produtos. Preços, disponibilidade, frete, pagamento e condições finais devem ser confirmados no Mercado Livre."],
  ];
  for (const [slug, title, text] of pages) out(`${slug}/index.html`, pageShell({ title, description: text.slice(0, 150), path: `${slug}/`, body: `<section class="page-hero"><h1>${title}</h1><p>${text}</p></section>` }));
}

function supportFiles() {
  const urls = ["", "produtos/", "familias/", "categorias/", "aplicacoes/", "guias/", "sobre/", "como-comprar/", "duvidas-frequentes/", "contato/", "politica-de-privacidade/", "termos-de-uso/", ...published.map((p) => `produtos/${p.slug}/`), ...categories.map((c) => `categorias/${c.slug}/`), ...familyCards.map((f) => `familias/${f.slug}/`), ...applicationCards.map((a) => `aplicacoes/${a.slug}/`), ...guides.map((g) => `guias/${g.slug}/`)];
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${absolute(url)}</loc></url>`).join("\n")}\n</urlset>`);
  out("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("sitemap.xml")}\n`);
  out("404.html", pageShell({ title: "Página não encontrada", description: "Página não encontrada.", path: "404.html", body: `<section class="page-hero"><h1>Página não encontrada</h1><p>O endereço pode ter mudado ou o produto pode estar em revisão.</p><a class="primary-action" href="${href("produtos/")}">Ver produtos</a></section>` }));
}

copyAssets();
home();
catalog();
collectionPages("Categorias", categories, "categorias");
collectionPages("Famílias", familyCards, "familias");
collectionPages("Aplicações", applicationCards, "aplicacoes");
productPages();
guidePages();
simplePages();
supportFiles();
console.log(`Build estático concluído: ${published.length} produtos públicos e ${hidden.length} pendentes/ocultos em dist/.`);
