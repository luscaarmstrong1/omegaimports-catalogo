# OMEGAIMPORTS - catálogo oficial

Site vitrine da OMEGAIMPORTS para apresentar produtos de eletrônica, automação, energia e projetos técnicos. A compra não acontece neste site: cada CTA direciona para o Mercado Livre.

## Estrutura

- `src/data/products.ts`: fonte única do catálogo.
- `src/data/store.ts`: dados configuráveis da loja e canais opcionais.
- `src/lib/catalog.ts`: busca, categorias, formatação e validações.
- `app/`: rotas públicas, páginas de produto, categorias, conteúdo técnico e páginas institucionais.
- `scripts/`: validação, importação, relatórios e sitemap de manutenção.
- `public/products/`: imagens usadas pelos cards e páginas.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm products:validate
pnpm products:import caminho/arquivo.csv
pnpm products:report
pnpm products:sitemap
```

Os scripts também ficam disponíveis via `npm run ...` em ambientes com `npm` instalado.

## Atualização de produtos

1. Atualize `src/data/products.ts` ou gere uma prévia com `pnpm products:import arquivo.csv`.
2. Confirme `mlbId`, `name`, `condition`, `quantityInKit`, `category`, imagens e link do Mercado Livre.
3. Rode `pnpm products:validate`.
4. Rode `pnpm products:report` e revise `products-report.json`.
5. Rode `pnpm build` antes de publicar.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` quando quiser habilitar integrações opcionais.

- `NEXT_PUBLIC_SITE_URL`: domínio final do site.
- `NEXT_PUBLIC_GA_ID`: Google Analytics 4.
- `NEXT_PUBLIC_CLARITY_ID`: Microsoft Clarity.

Não coloque chaves privadas no frontend.

## Checklist de deploy

- Catálogo validado.
- Sem produtos fictícios.
- Links revisados.
- Imagens sem quebra.
- Busca e filtros testados.
- Rotas principais revisadas em mobile e desktop.
- `pnpm test`, `pnpm typecheck`, `pnpm lint` e `pnpm build` concluídos.
- Relatórios finais gerados em `outputs/`.

## Manutenção mensal

- Revisar anúncios ativos no Mercado Livre.
- Atualizar preços e condições quando houver nova exportação.
- Conferir produtos sem ficha técnica detalhada.
- Substituir imagens genéricas por imagens individuais quando disponíveis.
- Revisar cliques e buscas sem resultado quando analytics estiver ativo.
