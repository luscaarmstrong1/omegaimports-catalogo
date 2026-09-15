# Auditoria antes do redesign premium v8

Data: 2026-08-17
Branch de trabalho: `feat/premium-commerce-redesign-v8`

## Escopo auditado

- Repositório local: `omegaimports-catalogo`
- URL pública alvo: `https://luscaarmstrong1.github.io/omegaimports-catalogo/`
- Stack atual: Node.js, gerador estático, HTML, CSS e JavaScript nativo.
- Arquivos principais: `scripts/build-site.mjs`, `scripts/shared.mjs`, `public/assets/site.css`, `public/assets/site.js`.
- Dados preservados: `src/data/products.json`, `src/data/blog-posts.json`, `src/data/families.json`, `src/data/home-merchandising.json`.

## Arquitetura atual

- `scripts/build-site.mjs` gera `dist/`, copia assets públicos, cria Home, catálogo, categorias, páginas de produto, blog, páginas simples, sitemap, robots e 404.
- `scripts/shared.mjs` concentra metadados do site, helpers de URL, formatação, imagens responsivas, ícones SVG inline, shell HTML, header, mobile drawer, footer e `productCard()`.
- `public/assets/site.css` concentra todo o design system em um único arquivo de aproximadamente 40 KB.
- `public/assets/site.js` controla busca, menu mobile, filtros de catálogo, chips do blog, tracking e progresso de leitura.
- A publicação principal continua compatível com GitHub Pages via base `/omegaimports-catalogo`.
- Também existe `.openai/hosting.json`, mas o objetivo desta missão é preservar GitHub Pages e abrir PR no GitHub.

## Estado funcional encontrado

- O catálogo filtra produtos publicados, ativos, com imagem verificada e sem placeholder.
- Links de Mercado Livre usam `permalink`, `target="_blank"`, `rel="noopener noreferrer sponsored"` e `data-event="marketplace_click"`.
- WhatsApp usa URL oficial configurada em `site.whatsappUrl`.
- Categorias, produtos, blog, sitemap, robots, breadcrumbs e schema.org são gerados no build.
- Scripts de QA existentes no `package.json`: `build`, `lint`, `typecheck`, `test`, `test:e2e`, `audit:products`, `audit:images`, `audit:copy`, `audit:seo`, `audit:blog`, `audit:links`, `audit:specifications`, entre outros.

## Problemas de UX/design antes da intervenção

- Home ainda usa hero com múltiplos produtos orbitais, badges e labels, contrariando o objetivo de foco em um único produto protagonista.
- O logo do header aparece dentro de um bloco branco/cartão, o que separa visualmente a marca do header.
- Trust strip existe como grid de cards com 3 itens, não como linha única de 4 sinais com divisórias.
- Home mantém blocos redundantes após a vitrine: `commercialProof()`, `buyingIntelligenceSection()`, `technicalFlowSection()` e `opportunityCta()`.
- Não há funções reutilizáveis com os nomes exigidos para montar a Home (`hero`, `trustStrip`, `categoryGrid`, `productShowcase`, `featureStage`, `articleShowcase`, `contactBand`).
- CSS usa tokens próximos, mas não reflete exatamente a nomenclatura pedida (`--omega-*`, `--ink`, `--body`, `--muted`, `--hairline`).
- CSS não está seccionado explicitamente na ordem solicitada.
- Não há sistema único de reveal `[data-reveal]` com `IntersectionObserver`.
- Header não possui estado compacto em scroll.
- Catálogo depende de sidebar/bottom sheet, mas ainda falta uma camada visual de chips rápidos logo abaixo da busca.
- Página de produto exibe hero funcional, porém ainda muito “cardizado” e sem quick specs em destaque antes das seções.
- Blog já ocupa mais espaço que versões anteriores, mas pode ganhar hierarquia editorial com featured post e cards mais contidos.
- Footer usa 4 colunas, mas o visual da marca ainda aparece como bloco branco isolado.

## Direção extraída das referências

As páginas públicas do Refero/Refero Styles indicam uso de referências por tipo de página, comércio, produto, catálogo, blog e contato. Para esta implementação, os princípios extraídos são:

- Foco em produto real e fotografia, não em decoração.
- Hierarquia forte no primeiro viewport.
- Menos badges e metadados na vitrine.
- Espaço negativo, contraste e escala tipográfica.
- Navegação pública curta e previsível.
- Cards com sombra mínima ou ausente em áreas de commerce.
- Motion discreto, progressivo e desativável por preferência do usuário.

## Plano de alteração

1. Refatorar a montagem da Home para a ordem final pedida: header, hero, trust strip, categorias, produtos, feature stage, blog recente, contato/WhatsApp, footer.
2. Criar funções reutilizáveis no gerador estático sem mudar stack.
3. Atualizar `pageShell()` para header premium, logo integrado, estado de scroll e footer mais enxuto.
4. Atualizar `site.css` para tokens, header, hero focado, trust strip, categorias, produtos, feature stage, catálogo, produto, blog, footer, motion e responsivo.
5. Atualizar `site.js` com funções fail-safe: `setupHeaderScroll()`, `setupRevealObserver()`, `setupHeroParallax()`, `setupHorizontalScroller()`.
6. Rodar build, lint, typecheck, testes e auditorias solicitadas.
7. Gerar screenshots e relatório `reports/design-redesign-after.md`.
