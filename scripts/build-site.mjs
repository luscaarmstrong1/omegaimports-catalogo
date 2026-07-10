import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { categories, escapeHtml, formatPrice, guides, href, loadProducts, pageShell, productCard, site, absolute } from "./shared.mjs";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
const products = loadProducts();
const published = products.filter((product) => product.status !== "hidden");
const categoryCounts = Object.fromEntries(categories.map((category) => [category.slug, published.filter((product) => product.categorySlug === category.slug).length]));

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

function home() {
  const verified = published.filter((product) => product.imageStatus === "verified" && product.featured).slice(0, 8);
  const selected = verified.length ? verified.map(productCard).join("") : `<div class="audit-empty"><h3>Produtos em validação visual</h3><p>Os produtos importados estão no catálogo completo, mas nenhum item foi promovido aos destaques da Home enquanto as imagens não forem confirmadas por anúncio exato.</p><a href="${href("produtos/")}">Ver catálogo auditado</a></div>`;
  const body = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">ELETRÔNICA • AUTOMAÇÃO • IoT</p>
        <h1>Componentes técnicos para tirar projetos do papel.</h1>
        <p>Módulos, sensores, fontes e dispositivos para prototipagem, telemetria, medição e automação. Encontre o item correto no catálogo e finalize sua compra no Mercado Livre.</p>
        <p class="hero-note">Desde 2024 conectando tecnologia, engenharia e operação.</p>
        <div class="hero-actions">
          <a class="primary-action" href="${href("produtos/")}">Explorar catálogo</a>
          <a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Comprar no Mercado Livre</a>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true"><img src="${href("brand/logo-symbol.webp")}" alt="" width="380" height="380"></div>
    </section>
    <section class="trust-grid" aria-label="Provas de confiança">
      <article><h2>Catálogo técnico organizado</h2><p>Produtos classificados por família e aplicação.</p></article>
      <article><h2>Compra pelo Mercado Livre</h2><p>Pagamento, frete e condições são conferidos no anúncio.</p></article>
      <article><h2>Pedidos separados e conferidos</h2><p>Atenção ao modelo, à quantidade e à condição anunciada.</p></article>
    </section>
    ${section("Categorias principais", `<div class="category-grid">${categories.slice(0, 6).map((category) => `<a class="category-card" href="${href(`categorias/${category.slug}/`)}"><span>${categoryCounts[category.slug] || 0}</span><h3>${category.label}</h3><p>${category.description}</p><strong>Explorar</strong></a>`).join("")}</div>`)}
    ${section("Produtos selecionados", `<div class="product-grid">${selected}</div>`)}
    ${section("Soluções por aplicação", `<div class="solution-grid">${[
      ["Projetos com ESP32 e sistemas embarcados", "ESP32"],
      ["Telemetria, GSM e localização", "GSM GPS"],
      ["Medição de corrente e energia", "corrente energia"],
      ["Automação, comando e proteção", "contator proteção"],
    ].map(([label, q]) => `<a href="${href(`produtos/?q=${encodeURIComponent(q)}`)}">${label}</a>`).join("")}</div>`)}
    ${section("Como funciona", `<ol class="steps"><li><strong>Encontre</strong><span>Pesquise por produto, aplicação ou especificação.</span></li><li><strong>Confira</strong><span>Valide quantidade, condição e informações técnicas.</span></li><li><strong>Compre</strong><span>Finalize pagamento e entrega no Mercado Livre.</span></li></ol>`)}
    ${section("Guias técnicos", `<div class="guide-grid">${guides.map((guide) => `<a href="${href(`guias/${guide.slug}/`)}"><h3>${guide.title}</h3><p>${guide.summary}</p></a>`).join("")}</div>`)}
    <section class="final-cta"><h2>Encontre o componente certo para o próximo projeto.</h2><p>Explore o catálogo técnico da OMEGAIMPORTS ou consulte as ofertas disponíveis no Mercado Livre.</p><a class="primary-action" href="${href("produtos/")}">Abrir catálogo completo</a><a class="secondary-action marketplace-link" href="${site.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored">Visitar loja no Mercado Livre</a></section>`;
  out("index.html", pageShell({ title: "Componentes técnicos para tirar projetos do papel", description: "Catálogo técnico OMEGAIMPORTS para eletrônica, automação, IoT e energia.", body }));
}

function catalog() {
  const body = `<section class="page-hero"><p class="eyebrow">Catálogo</p><h1>Produtos OMEGAIMPORTS</h1><p>Busque por produto, aplicação, especificação, família ou código MLB.</p></section>
    <section class="catalog-layout">
      <aside class="filters" aria-label="Filtros do catálogo">
        <label>Busca<input id="catalog-search" type="search" placeholder="ESP32, SIM800L, GPS, SCT-013..." autocomplete="off"></label>
        <label>Categoria<select id="category-filter"><option value="">Todas</option>${categories.map((c) => `<option value="${c.slug}">${c.label}</option>`).join("")}</select></label>
        <label>Condição<select id="condition-filter"><option value="">Todas</option><option value="novo">Novo</option><option value="usado">Usado</option></select></label>
        <label>Formato<select id="package-filter"><option value="">Todos</option><option value="unit">Unidade</option><option value="kit">Kit</option></select></label>
        <label>Imagem<select id="image-filter"><option value="">Todos</option><option value="verified">Verificada</option><option value="needs-review">Em validação</option><option value="missing">Ausente</option></select></label>
        <label>Ordenação<select id="sort-filter"><option value="relevance">Relevância</option><option value="title">Nome</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="recent">Atualização mais recente</option></select></label>
      </aside>
      <div><p class="result-count" aria-live="polite"><strong id="result-count">${published.length}</strong> produtos encontrados</p><div class="product-grid" id="product-list">${published.map(productCard).join("")}</div><div class="empty-state" id="empty-state" hidden><h2>Nenhum produto encontrado</h2><p>Tente remover filtros ou buscar por outro termo técnico.</p></div></div>
    </section>`;
  out("produtos/index.html", pageShell({ title: "Produtos", description: "Catálogo completo com busca, filtros e links para ofertas da OMEGAIMPORTS no Mercado Livre.", path: "produtos/", body }));
}

function categoryPages() {
  out("categorias/index.html", pageShell({ title: "Categorias", description: "Categorias técnicas do catálogo OMEGAIMPORTS.", path: "categorias/", body: `<section class="page-hero"><h1>Categorias técnicas</h1><p>Taxonomia interna criada para facilitar a escolha do componente correto.</p></section><div class="category-grid page-grid">${categories.map((category) => `<a class="category-card" href="${href(`categorias/${category.slug}/`)}"><span>${categoryCounts[category.slug] || 0}</span><h2>${category.label}</h2><p>${category.description}</p></a>`).join("")}</div>` }));
  for (const category of categories) {
    const items = published.filter((product) => product.categorySlug === category.slug);
    out(`categorias/${category.slug}/index.html`, pageShell({ title: category.label, description: category.description, path: `categorias/${category.slug}/`, body: `<section class="page-hero"><p class="eyebrow">Categoria</p><h1>${category.label}</h1><p>${category.description}</p></section><div class="product-grid">${items.map(productCard).join("")}</div>` }));
  }
}

function productPages() {
  for (const product of published) {
    const specs = product.specifications?.length ? `<section class="detail-block"><h2>Especificações</h2><dl class="spec-table">${product.specifications.map((s) => `<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join("")}</dl></section>` : "";
    const body = `<nav class="breadcrumb"><a href="${href()}">Início</a><a href="${href("produtos/")}">Produtos</a><span>${escapeHtml(product.shortTitle)}</span></nav>
      <section class="product-detail">
        <div class="product-gallery"><img src="${href(product.image)}" alt="${escapeHtml(product.imageStatus === "verified" ? `${product.quantity > 1 ? `Kit com ${product.quantity}` : "Unidade"} - ${product.shortTitle}` : "Imagem em validação")}" width="720" height="720"></div>
        <div class="product-summary"><p class="eyebrow">${escapeHtml(product.category)}</p><h1>${escapeHtml(product.title)}</h1><dl class="quick-specs"><div><dt>MLB</dt><dd>${product.mlbId}</dd></div><div><dt>Condição</dt><dd>${product.condition}</dd></div><div><dt>Quantidade</dt><dd>${product.quantity > 1 ? `Kit com ${product.quantity}` : "Unidade"}</dd></div><div><dt>Preço</dt><dd>${product.price ? formatPrice(product) : "Consulte o preço no anúncio"}</dd></div><div><dt>Imagem</dt><dd>${product.imageStatus === "verified" ? "verificada" : "em validação"}</dd></div></dl><a class="primary-action marketplace-link" href="${product.marketplaceUrl}" target="_blank" rel="noopener noreferrer sponsored" data-event="marketplace_click" data-mlb="${product.mlbId}" data-title="${escapeHtml(product.title)}" data-category="${escapeHtml(product.category)}">Ver preço e comprar no Mercado Livre</a><p class="external-note">A compra, pagamento, frete e entrega são finalizados no Mercado Livre.</p></div>
      </section>
      <section class="detail-grid"><section class="detail-block"><h2>Resumo técnico</h2><p>${escapeHtml(product.shortDescription)}</p></section><section class="detail-block"><h2>Principais características</h2><ul>${product.technicalHighlights.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></section>${specs}<section class="detail-block"><h2>Aplicações</h2><ul>${product.applications.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></section>${product.includedItems?.length ? `<section class="detail-block"><h2>Itens inclusos</h2><ul>${product.includedItems.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></section>` : ""}${product.warnings?.length ? `<section class="detail-block"><h2>Cuidados e observações</h2><ul>${product.warnings.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></section>` : ""}</section>`;
    out(`produtos/${product.slug}/index.html`, pageShell({ title: product.title, description: product.shortDescription, path: `produtos/${product.slug}/`, body, extraHead: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: absolute("") }, { "@type": "ListItem", position: 2, name: "Produtos", item: absolute("produtos/") }, { "@type": "ListItem", position: 3, name: product.title, item: absolute(`produtos/${product.slug}/`) }] })}</script>` }));
  }
}

function guidePages() {
  out("guias/index.html", pageShell({ title: "Guias técnicos", description: "Conteúdos técnicos da OMEGAIMPORTS para escolha de componentes.", path: "guias/", body: `<section class="page-hero"><h1>Guias técnicos</h1><p>Conteúdo prático e prudente para apoiar decisões de projeto.</p></section><div class="guide-grid page-grid">${guides.map((guide) => `<a href="${href(`guias/${guide.slug}/`)}"><h2>${guide.title}</h2><p>${guide.summary}</p></a>`).join("")}</div>` }));
  for (const guide of guides) {
    out(`guias/${guide.slug}/index.html`, pageShell({ title: guide.title, description: guide.summary, path: `guias/${guide.slug}/`, body: `<article class="article"><p class="eyebrow">Guia técnico</p><h1>${guide.title}</h1><p>${guide.summary}</p><h2>Como avaliar</h2><p>Comece pelo objetivo do projeto, faixa elétrica esperada, ambiente de instalação, interfaces necessárias e limites do componente. Compare sempre o código do anúncio, condição, quantidade e especificações disponíveis.</p><h2>Pontos de atenção</h2><ul><li>Não use a imagem como única fonte de compatibilidade.</li><li>Confirme tensão, corrente, pinagem e acessórios no anúncio.</li><li>Para tensão de rede ou comandos elétricos, conte com profissional habilitado.</li><li>Use o campo de perguntas do Mercado Livre quando algo não estiver claro.</li></ul></article>` }));
  }
}

function simplePages() {
  const pages = [
    ["sobre", "Sobre a OMEGAIMPORTS", "A OMEGAIMPORTS é uma operação de e-commerce fundada em dezembro de 2024 e especializada em componentes eletroeletrônicos, IoT, telemetria, energia e automação. A operação integra curadoria técnica de produtos, compras internacionais, gestão de estoque, inteligência de mercado, logística e desenvolvimento de soluções digitais. Nosso objetivo é organizar informações e facilitar o acesso a componentes para profissionais, integradores, estudantes e desenvolvedores de projetos. Fundada e gerida por um Engenheiro Eletricista com atuação em projetos, automação e análise de dados."],
    ["como-comprar", "Como comprar", "Encontre o produto, confira modelo, quantidade e condição, clique para abrir o anúncio no Mercado Livre, consulte preço, frete e prazo atualizados, finalize o pagamento na plataforma e acompanhe o pedido pela sua conta."],
    ["contato", "Contato", "Para dúvidas sobre produto, compatibilidade, quantidade, frete ou prazo, use o campo de perguntas do anúncio correspondente no Mercado Livre. Nenhum telefone ou WhatsApp é exibido sem configuração válida."],
    ["privacidade", "Política de privacidade", "Este site é uma vitrine estática. Não cria contas, não processa pagamentos e não armazena dados de checkout. Eventos de analytics permanecem inativos até configuração explícita."],
    ["termos", "Termos de uso", "As informações ajudam a organizar e comparar produtos. Preços, disponibilidade, frete, pagamento e condições finais devem ser confirmados no Mercado Livre. Conteúdo técnico não substitui avaliação profissional."],
  ];
  for (const [slug, title, text] of pages) out(`${slug}/index.html`, pageShell({ title, description: text.slice(0, 150), path: `${slug}/`, body: `<section class="page-hero"><h1>${title}</h1><p>${text}</p></section>` }));
}

function supportFiles() {
  const urls = ["", "produtos/", "categorias/", "guias/", "sobre/", "como-comprar/", "contato/", ...published.map((p) => `produtos/${p.slug}/`), ...categories.map((c) => `categorias/${c.slug}/`), ...guides.map((g) => `guias/${g.slug}/`)];
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${absolute(url)}</loc></url>`).join("\n")}\n</urlset>`);
  out("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("sitemap.xml")}\n`);
  out("404.html", pageShell({ title: "Página não encontrada", description: "Página não encontrada.", path: "404.html", body: `<section class="page-hero"><h1>Página não encontrada</h1><p>O endereço pode ter mudado ou o produto pode estar em revisão.</p><a class="primary-action" href="${href("produtos/")}">Ver produtos</a></section>` }));
}

copyAssets();
home();
catalog();
categoryPages();
productPages();
guidePages();
simplePages();
supportFiles();
console.log(`Build estático concluído: ${published.length} produtos publicados em dist/.`);
