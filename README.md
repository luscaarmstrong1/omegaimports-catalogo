# OMEGAIMPORTS Catálogo

Site oficial estático da OMEGAIMPORTS, operação de e-commerce fundada em dezembro de 2024 e especializada em componentes eletroeletrônicos, IoT, telemetria, energia e automação.

Produção prevista:

https://luscaarmstrong1.github.io/omegaimports-catalogo/

## Stack

- HTML estático gerado por scripts Node.
- TypeScript strict para tipos de dados.
- CSS moderno com tokens dark premium.
- JavaScript mínimo para busca, filtros, menu mobile e eventos.
- GitHub Pages com GitHub Actions.

## Comandos

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run audit:products
npm run audit:encoding
npm run audit:links
npm run build
npm run test:e2e
```

## Estrutura

- `src/data/products.json`: fonte central dos produtos.
- `src/data/products.ts`: versão tipada dos produtos.
- `src/data/store.ts`: configuração institucional, categorias e guias.
- `src/types/product.ts`: contrato do produto.
- `public/brand/`: logos, favicon e Open Graph.
- `public/assets/`: CSS, JS e placeholder.
- `scripts/`: build, auditorias e relatórios.
- `reports/`: auditoria inicial, CSV e galeria de auditoria.
- `dist/`: saída de build para GitHub Pages.

## Atualizar produtos

1. Atualize `src/data/products.json` e reflita a alteração em `src/data/products.ts`.
2. Garanta que cada produto tenha `mlbId`, `slug`, `title`, `categorySlug`, `marketplaceUrl`, `imageStatus`, `lastVerifiedAt`.
3. Adicione imagens verificadas em `public/products/MLB0000000000/`.
4. Troque `imageStatus` para `verified` somente quando imagem, título, condição, quantidade e URL forem do mesmo MLB.
5. Execute `npm run audit:products`.
6. Revise `reports/galeria-auditoria.html`.
7. Execute `npm run build`.

## Validar um MLB ID

- O `mlbId` deve seguir `MLB0000000000`.
- A URL do Mercado Livre deve conter o número do MLB.
- A imagem só pode ser marcada como verificada quando vier do anúncio exato.

## Destacar produto

Defina `featured: true` apenas se:

- `status` não for `hidden`;
- `imageStatus` for `verified`;
- condição, quantidade, preço e URL tiverem sido revisados.

## Preços

Preços vêm da exportação fornecida e precisam de `priceLastVerifiedAt`. Se a data ficar vencida, substitua no dado público por consulta no anúncio.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` executa:

1. checkout;
2. setup Node;
3. `npm ci`;
4. lint;
5. typecheck;
6. auditorias;
7. testes;
8. build;
9. upload de `dist`;
10. deploy GitHub Pages.

## Identidade

Use apenas os arquivos em `public/brand/`. Não use o caractere Omega digitado como substituto de logo. Não publique assets com checkerboard visível.

## Manutenção mensal

- Revisar anúncios ativos no Mercado Livre.
- Atualizar exportação de produtos.
- Validar imagens por MLB.
- Corrigir pendências do CSV de auditoria.
- Rodar build e workflow.
