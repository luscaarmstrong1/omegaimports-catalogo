# Auditoria v2 - OMEGAIMPORTS

Data: 2026-07-10

## Escopo executado

- Repositório validado: `luscaarmstrong1/omegaimports-catalogo`.
- Permissão confirmada: `ADMIN`.
- Branch de trabalho: `feat/rebuild-marketplace-catalog-v2`.
- Produção analisada: `https://luscaarmstrong1.github.io/omegaimports-catalogo/`.
- Workflow existente analisado: `Deploy GitHub Pages`.

## Diagnóstico do projeto anterior

- A base pública continha 47 produtos importados.
- Todos os 47 produtos estavam sem imagem real validada por anúncio exato.
- Todos os 47 produtos usavam placeholder institucional.
- A Home não exibia produtos destacados porque nenhuma imagem estava verificada.
- A base antiga preservava dados de planilhas e textos históricos, mas ainda continha especificações e descrições que exigiam revisão manual.
- O projeto não possuía workflow separado para sincronização Mercado Livre.
- O projeto não possuía pipeline de imagem real por MLB com manifest auditável.
- O projeto não possuía política de proveniência por campo.

## Achados críticos de dados

- Produtos com placeholder: 47.
- Produtos com `imageStatus` anterior equivalente a revisão pendente: 47.
- Produtos com imagem real ausente: 47.
- Produtos com imagem repetida validada: 0.
- Produtos com imagem pertencente a outro MLB confirmada: 0, mas não verificável sem API/imagem oficial.
- Produtos ativos publicados após v2: 0.
- Produtos ocultados ou pendentes após v2: 47.
- Produtos sem fonte estruturada após v2: 0.
- Produtos com `blockingIssues`: 47.

## Divergências destacadas

- `MLB4417997973`: título indica kit 2x/novo, descrição histórica menciona 5 unidades e condição de origem indica usado.
- `MLB5375622238`: condição usada contradita por texto com indicação de novo.
- `MLB5375698778`: condição usada contradita por texto com indicação de novo.
- `MLB5375724278`: condição usada contradita por texto com indicação de novo.

## Política de fonte de verdade implementada

Prioridade por campo:

1. API oficial Mercado Livre para o anúncio exato.
2. HTML do painel do vendedor, apenas como fallback local e temporário.
3. Anúncio público exato.
4. Documentação oficial do fabricante.
5. Planilha exportada do Mercado Livre.
6. Revisão manual.
7. Base antiga apenas como comparação.

Cada produto agora possui `source.fields` para título, status, condição, quantidade, preço, permalink e imagem, com fonte, identificador, data de coleta, confiança e status de revisão.

## Regra pública aplicada

Produto só pode aparecer como publicado quando:

- possui MLB válido;
- possui permalink válido;
- está ativo;
- não possui bloqueios;
- possui imagem real verificada;
- possui condição e quantidade coerentes;
- possui categoria interna válida;
- possui data de atualização de preço.

Como nenhuma imagem real foi validada por API ou galeria oficial, todos os produtos foram marcados como `pending-review` e ocultos do catálogo público.

## Scripts criados ou atualizados

- `scripts/sync-mercadolivre.mjs`
- `scripts/refresh-mercadolivre-token.mjs`
- `scripts/parse-seller-dashboard.mjs`
- `scripts/import-mercadolivre-export.mjs`
- `scripts/build-product-database.mjs`
- `scripts/audit-images.mjs`
- `scripts/audit-specifications.mjs`
- `scripts/audit-marketplace.mjs`
- `scripts/lighthouse.mjs`

## Relatórios gerados

- `reports/catalog.csv`
- `reports/product-differences.csv`
- `reports/image-duplicates.csv`
- `reports/image-mismatches.csv`
- `reports/specification-issues.csv`
- `reports/hidden-products.csv`
- `reports/contact-sheet-products.html`
- `reports/contact-sheet-products.jpg`
- `reports/marketplace-audit.csv`
- `reports/relatorio-produtos.json`
- `reports/sync-mercadolivre.json`

## Limitações

- API Mercado Livre não foi executada com dados reais porque os secrets `MELI_ACCESS_TOKEN` e `MELI_SELLER_ID` não estavam configurados no ambiente local.
- A sincronização API registrou status `skipped` sem expor credenciais.
- Lighthouse real depende de servidor local e navegador disponível; o script registra relatório de indisponibilidade quando não consegue executar.
- O merge para `main` não deve ocorrer enquanto não houver produtos com imagens verificadas e sem bloqueios críticos.
