# OMEGAIMPORTS Catálogo

Site estático oficial da OMEGAIMPORTS para GitHub Pages:

https://luscaarmstrong1.github.io/omegaimports-catalogo/

O site não possui checkout próprio. A compra, pagamento, frete e entrega são finalizados no Mercado Livre.

## Arquitetura

- Build estático em `dist/`.
- Dados públicos em `src/data/products.json`.
- Snapshot legado para comparação em `src/data/products-source.legacy.json`.
- Assets de marca em `public/brand/`.
- Assets decorativos em `public/brand/visuals/`.
- Auditorias em `reports/`.
- Deploy via GitHub Actions em `.github/workflows/deploy-pages.yml`.
- Sincronização Mercado Livre em `.github/workflows/sync-mercadolivre.yml`.

## Regra de publicação

Um produto só aparece publicamente quando:

- possui MLB válido;
- possui permalink válido;
- está ativo;
- não possui bloqueios críticos;
- possui imagem real verificada do anúncio exato;
- possui condição e quantidade coerentes;
- possui categoria interna válida;
- possui preço com data de atualização.

Produtos sem validação ficam como `pending-review` e são ocultados do catálogo público.

## Variáveis

Copie `.env.example` e configure apenas em ambiente seguro:

- `PUBLIC_WHATSAPP_NUMBER`
- `PUBLIC_GA_ID`
- `PUBLIC_CLARITY_ID`
- `MELI_CLIENT_ID`
- `MELI_CLIENT_SECRET`
- `MELI_ACCESS_TOKEN`
- `MELI_REFRESH_TOKEN`
- `MELI_SELLER_ID`

Tokens Mercado Livre nunca devem ir para JavaScript entregue ao navegador.

## Comandos

```bash
pnpm install
pnpm run products:build
pnpm run build
pnpm run test
pnpm run audit:products
pnpm run audit:images
pnpm run audit:encoding
pnpm run audit:links
pnpm run audit:specifications
pnpm run audit:marketplace
pnpm run test:e2e
pnpm run lighthouse
```

Sincronização:

```bash
pnpm run sync:meli -- --source=api
pnpm run sync:meli -- --source=dashboard
pnpm run sync:meli -- --source=xlsx
pnpm run sync:meli -- --source=offline
```

Quando os secrets Mercado Livre não estão configurados, o modo API registra `skipped` em `reports/sync-mercadolivre.json` e mantém a última base validada.

## Relatórios principais

- `reports/auditoria-v2.md`
- `reports/catalog.csv`
- `reports/product-differences.csv`
- `reports/hidden-products.csv`
- `reports/image-duplicates.csv`
- `reports/image-mismatches.csv`
- `reports/specification-issues.csv`
- `reports/contact-sheet-products.html`
- `reports/contact-sheet-products.jpg`
- `reports/marketplace-audit.csv`
- `reports/screenshots/`

## Observação de segurança

HTMLs exportados do painel, cookies, CSRF tokens, HARs e arquivos de sessão são fontes locais temporárias e não devem ser commitados.
