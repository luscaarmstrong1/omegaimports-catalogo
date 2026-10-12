# 04 - Execução e Automação de Testes

Este documento registra todas as rotinas de verificação, testes automatizados, checagens de integridade estrutural e validações de destinos reais executadas na OMEGAIMPORTS.

---

## 1. Comandos Executados e Resultados Obtidos

| Suite / Teste | Comando | Escopo | Resultado |
|---|---|---|---|
| **Lint Estático** | `npm run lint` | Validação de sintaxe e padrões de código nos scripts | Aprovado (0 erros) |
| **Typecheck de Dados** | `npm run typecheck` | Verificação de integridade dos esquemas JSON em `src/data/` | Aprovado (0 erros) |
| **Testes Unitários de Catálogo** | `node --test tests/catalog.test.mjs` | Mapeamento de IDs MLB, URLs HTTPS, seller IDs e taxonomia | Aprovado (6/6 testes) |
| **Testes de Preview & Deploy** | `node --test tests/vercel-preview.test.mjs` | Comportamento de rotas, canonicals e noindex no preview | Aprovado (3/3 testes) |
| **Teste E2E Estático** | `npm run test:e2e` | Presença de páginas críticas, robots.txt e sitemap | Aprovado |
| **Auditoria Geral de Dist** | `npm run audit:dist` | Imagens públicas, cópia sem palavras proibidas e SEO | Aprovado (0 erros) |
| **Auditoria Editorial do Blog** | `npm run audit:blog` | Calendário editorial, mínimo de seções, contagem de palavras e capas | Aprovado (6 artigos) |
| **Checksums da Baseline Congelada** | `npm run audit:v2-checksums` | Verificação criptográfica SHA-256 dos 133 arquivos da baseline | Aprovado (133/133) |
| **Auditoria de Navegação Interna** | `node scripts/audit-links.mjs` | Varredura de todos os links e âncoras internas | Aprovado (0 links mortos) |
| **Auditoria de Produtos** | `node scripts/audit-products.mjs` | Validação técnica de ofertas e integridade | Aprovado (64 itens) |
| **Auditoria de Ownership do Vendedor** | `node scripts/audit-owned-items.mjs` | Filtro de anúncios pertencentes à OMEGAIMPORTS (seller 194516027) | Aprovado (28 públicos) |
| **Auditoria de Catalog Listings** | `node scripts/audit-catalog-listings.mjs` | Exclusão de anúncios genéricos de catálogo Meli | Aprovado (0 catálogo) |
| **Auditoria de Imagens** | `node scripts/audit-images.mjs` | Integridade e presença de imagens em webp/jpg | Aprovado |
| **Auditoria de Encoding** | `node scripts/audit-encoding.mjs` | Verificação contra corrupção de caracteres (mojibake) | Aprovado (0 falhas) |
| **Auditoria de Especificações** | `node scripts/audit-specifications.mjs` | Verificação técnica dos atributos de produtos | Aprovado |
| **Auditoria de Marketplace** | `node scripts/audit-marketplace.mjs` | Conformidade de URLs e itens do Mercado Livre | Aprovado |
| **Auditoria de Supply Chain** | `npx pnpm audit` | Varredura de vulnerabilidades de dependências no lockfile | Aprovado (0 vulnerabilidades) |

---

## 2. Validação Real de Destinos no Mercado Livre (Testes de Rede)
Diferenciando testes sintáticos de testes de conectividade real com a plataforma:
- **Página Oficial da Loja**: `https://www.mercadolivre.com.br/pagina/omegaimports` -> **HTTP 203 OK** (Página oficial ativa e acessível).
- **Listagem de Anúncios do Vendedor**: `https://lista.mercadolivre.com.br/_CustId_194516027` -> **HTTP 200 OK** (Listagem do vendedor CustId 194516027 ativa).
- **Páginas de Produtos Individuais**:
  - `MLB-5268487034` (Fonte Hikari HF-3205S): **HTTP 200 OK**
  - `MLB-3963883507` (Módulo Relé 1 Canal 5V): **HTTP 200 OK**
- **Conclusão**: O identificador de vendedor `194516027` é válido, autêntico e corresponde fielmente à conta oficial da OMEGAIMPORTS no Mercado Livre.

---

## 3. Revalidação da Baseline Congelada Desktop (SHA-256)
- **Manifesto de Checksums**: `tests/fixtures/v2-frozen/SHA256SUMS.txt`
- **Resultados**:
  - `index.html`: Checksum SHA-256 aprovado.
  - Folhas de estilo CSS (6 arquivos: `tokens.css`, `reset.css`, `components.css`, `sections.css`, `responsive.css`, `animations.css`): Checksums aprovados.
  - Ativos de marca e mídias (115 arquivos): Checksums aprovados.
  - **Total**: 133 de 133 arquivos rigorosamente idênticos à baseline congelada da Home desktop.
