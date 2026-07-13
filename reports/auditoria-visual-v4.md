# Auditoria visual v4 - OMEGAIMPORTS

Data: 2026-07-13

## Escopo aplicado

- Frontend publico do catalogo estatico OMEGAIMPORTS.
- Sem alteracao em OAuth, Client Secret, Seller ID, tokens, banco, backend ou integracao privada.
- Fonte publica reconstruida a partir de `src/data/products-source.meli.json`.

## Resultado local

- Produtos analisados: 64.
- Produtos publicados: 41.
- Produtos pendentes/ocultos: 23.
- Imagens publicas verificadas: 41 produtos com `avif`, `webp` e `jpg`.
- Home: 8 produtos em destaque preenchidos automaticamente.
- Hero: 3 produtos reais, sem imagem abstrata ou placeholder.
- Categorias na Home: somente categorias com contagem publica maior que zero.

## Correcoes implementadas

- `dist/products` agora e copiado no inicio do build, depois de limpar `dist`.
- URLs centralizadas por `pageUrl(path)` e `assetUrl(path)`.
- Cards e detalhe usam `<picture>` com AVIF, WebP e JPG fallback.
- Filtro interno de imagem/status removido do catalogo publico.
- Filtro publico de preco adicionado.
- Mensagens de auditoria publica removidas da Home.
- Badge "Imagem verificada" removido dos cards.
- Taxonomia ajustada por familia, MLB e palavras-chave tecnicas.
- Contact sheet publica gerada em HTML e JPG.
- Auditorias `audit:public-images`, `audit:dist-images` e `audit:production-images` adicionadas.

## Relatorios gerados

- `reports/public-image-audit.csv`
- `reports/public-image-contact-sheet.html`
- `reports/public-image-contact-sheet.jpg`
- `reports/dist-image-audit.csv`
- `reports/broken-production-images.csv` sera atualizado apos o deploy de producao.

## Evidencias visuais locais

- `reports/screenshots/home-desktop.png`
- `reports/screenshots/catalog-desktop.png`
- `reports/screenshots/product-desktop.png`
- `reports/screenshots/home-mobile.png`
- `reports/screenshots/catalog-mobile.png`

Validacao pelo navegador integrado:

| Tela | Imagens visiveis quebradas | Overflow detectado |
| --- | ---: | ---: |
| Home desktop | 0 | 0 |
| Catalogo desktop | 0 | 0 |
| Produto desktop | 0 | 0 |
| Home mobile | 0 | 0 |
| Catalogo mobile | 0 | 0 |

## Validacoes executadas

- `pnpm run products:build`
- `pnpm run audit:products`
- `pnpm run audit:images`
- `pnpm run audit:public-images`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run build`
- `pnpm run audit:dist-images`
- `pnpm run test:e2e`

Observacao: a auditoria de produtos manteve apenas avisos conhecidos de condicao/quantidade vindos dos dados do marketplace, sem criticos.
