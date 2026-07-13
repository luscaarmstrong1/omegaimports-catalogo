# Auditoria final v5

Data: 2026-07-13

## Resultado executivo

A v5 transforma o site em uma vitrine técnica premium com o conceito Omega Circuit Lab, Blog editorial e arquitetura de informação mais enxuta. A integração Mercado Livre, backend privado, OAuth, Seller ID, banco e secrets não foram alterados.

## Números

- Produtos analisados: 64.
- Produtos publicados: 41.
- Produtos pendentes/ocultos: 23.
- Artigos do Blog: 12.
- Categorias públicas com produto: 8.

## Categorias publicadas

- Componentes Eletrônicos: 6.
- Instrumentos de Bancada: 4.
- Sensores e Medição: 5.
- Fontes e Alimentação: 9.
- Conectores e Instalação: 5.
- GPS e Localização: 5.
- Automação e Comando: 5.
- IoT, GSM e Comunicação: 2.

## Validações locais

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run audit:products`
- `pnpm run audit:images`
- `pnpm run audit:encoding`
- `pnpm run audit:links`
- `pnpm run audit:specifications`
- `pnpm run audit:marketplace`
- `pnpm run audit:dist-images`
- `pnpm run audit:copy`
- `pnpm run audit:seo`
- `pnpm run test:e2e`

## Lighthouse

O Lighthouse local não executou porque Chrome/Lighthouse não estava disponível no ambiente. O registro foi salvo em `reports/lighthouse/home-not-run.json`.

## Observações

A auditoria de produtos mantém 8 avisos conhecidos de divergência vindos do marketplace, sem críticos. Produtos com bloqueios continuam fora da publicação.
