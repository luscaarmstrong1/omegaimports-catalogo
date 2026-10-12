# 04 - Execução e Automação de Testes

Este documento registra todas as rotinas de verificação, testes automatizados, checagens de integridade e auditorias executadas na OMEGAIMPORTS.

---

## 1. Comandos Executados e Resultados Obtidos

| Suite / Teste | Comando | Escopo | Resultado |
|---|---|---|---|
| **Lint Estático** | `npm run lint` | Validação de sintaxe e padrões de código nos scripts | Aprovado (0 erros) |
| **Typecheck** | `npm run typecheck` | Verificação de integridade dos dados JSON | Aprovado (0 erros) |
| **Testes Unitários & Catálogo** | `node --test tests/catalog.test.mjs` | Mapeamento de IDs MLB, URLs HTTPS, seller IDs e taxonomia | Aprovado (6/6 testes) |
| **Testes de Preview & Deploy** | `node --test tests/vercel-preview.test.mjs` | Comportamento de rotas, canonicals e noindex no preview | Aprovado (3/3 testes) |
| **Teste E2E Estático** | `npm run test:e2e` | Presença de páginas críticas, robots.txt e sitemap | Aprovado |
| **Auditoria de Dist (Geral)** | `npm run audit:dist` | Imagens públicas, cópia sem palavras proibidas e SEO | Aprovado (0 erros) |
| **Auditoria do Blog** | `npm run audit:blog` | Calendário editorial, mínimo de seções, contagem de palavras e capas | Aprovado (6 artigos) |
| **Checksums da V2 Congelada** | `npm run audit:v2-checksums` | Verificação criptográfica SHA256 dos 133 arquivos da baseline | Aprovado (133/133) |
| **Auditoria de Links** | `node scripts/audit-links.mjs` | Navegação completa por todos os links internos | Aprovado (0 links mortos) |
| **Auditoria de Produtos** | `node scripts/audit-products.mjs` | Integridade das ofertas e dados dos produtos | Aprovado (64 itens) |
| **Auditoria de Ownership** | `node scripts/audit-owned-items.mjs` | Filtro de anúncios pertencentes à OMEGAIMPORTS | Aprovado (28 públicos) |
| **Auditoria de Catalog Listings** | `node scripts/audit-catalog-listings.mjs` | Exclusão de anúncios genéricos de catálogo Meli | Aprovado (0 catálogo) |
| **Auditoria de Imagens** | `node scripts/audit-images.mjs` | Integridade e presença de imagens em webp/jpg | Aprovado |
| **Auditoria de Encoding** | `node scripts/audit-encoding.mjs` | Verificação contra corrupção de caracteres (mojibake) | Aprovado (0 falhas) |
| **Auditoria de Especificações** | `node scripts/audit-specifications.mjs` | Verificação técnica dos atributos de produtos | Aprovado |
| **Auditoria de Marketplace** | `node scripts/audit-marketplace.mjs` | Conformidade de URLs e itens do Mercado Livre | Aprovado |
| **Auditoria de Supply Chain** | `npx pnpm audit` | Varredura de vulnerabilidades de dependências no lockfile | Aprovado (0 vulnerabilidades) |

---

## 2. Detalhamento dos Testes do Catálogo (`tests/catalog.test.mjs`)
1. `keeps all imported Mercado Livre products with MLB IDs`: Confirma que todos os 64 produtos possuem formato válido `^MLB\d+$`.
2. `uses internal taxonomy with stable ASCII slugs`: Garante que toda categoria interna pertence ao vocabulário permitido.
3. `marketplace URLs are HTTPS and include the item code`: Valida links seguros e corretos para a loja oficial do Mercado Livre.
4. `public products require verified images and no blocking issues`: Confirma que apenas produtos com fotos validadas e sem impeditivos são publicados.
5. `public products are owned non-catalog seller listings`: Garante que apenas anúncios próprios do vendedor (`194516027`) são exibidos.
6. `product audit has no critical issues`: Confirma 0 impeditivos críticos de catálogo.

---

## 3. Detalhamento dos Testes de Preview (`tests/vercel-preview.test.mjs`)
1. `keeps the GitHub Pages base and canonical URLs by default`: Confirma base `/omegaimports-catalogo` e canonical oficial para ambiente padrão.
2. `uses root-relative navigation and strict noindex in Vercel Preview`: Confirma `noindex, nofollow, noarchive` em ambiente Vercel.
3. `allows an explicit base override without changing official canonicals`: Valida flexibilidade de sobrescrita de caminho sem degradar canonicals oficiais.

---

## 4. Testes com Limitações de Ambiente Local
- **Lighthouse Local**: Executado via `scripts/lighthouse.mjs`. Registrou adequadamente em `reports/lighthouse/home-not-run.json` a ausência de runtime Chromium headless no terminal local, mantendo a suite de CI limpa e documentando a condição sem falha artificial.
