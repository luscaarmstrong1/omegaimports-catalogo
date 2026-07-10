# Auditoria inicial - OMEGAIMPORTS

Data: 2026-07-10

## Estrutura atual

- Tecnologia atual: Vinext/Next/React/TypeScript com build Cloudflare Worker, criado a partir de starter Sites.
- Rotas encontradas: `/`, `/produtos`, `/produtos/[slug]`, `/categorias`, `/categorias/[slug]`, `/ofertas`, `/novidades`, `/mais-vendidos`, `/sobre`, `/como-comprar`, `/duvidas-frequentes`, `/conteudos`, `/conteudos/[slug]`, `/contato`, `/politica-de-privacidade`, `/termos-de-uso`, `/sitemap.xml`, `/robots.txt`.
- Dados: `src/data/products.ts`, `src/data/store.ts`.
- Assets: imagens de produto em `public/products/`, OG em `public/og.png`, favicon genérico em `public/favicon.svg`.

## Problemas críticos identificados

1. Encoding corrompido em parte da base: `Automa??o`, `eletr?nicos`, `instala??o`, `alimenta??o`, `localiza??o`, `medi??o`.
2. URL fictícia/local: `omegaimports.catalogo.local` em configuração e scripts.
3. Cabeçalho usa caractere genérico `Ω` como marca em vez da logo real.
4. Imagens de produtos foram reaproveitadas entre vários anúncios sem `imageStatus` e sem associação auditável por MLB.
5. Alt text de produtos começa com texto genérico `Imagem de`, contrariando a exigência de descrição específica.
6. Não há `reports/auditoria-produtos.csv` nem `reports/galeria-auditoria.html`.
7. Scripts exigidos `audit:products`, `audit:encoding`, `audit:links`, `test:e2e` ainda não existem.
8. Taxonomia interna mistura categorias com acentos corrompidos e slugs derivados de labels.
9. Home mostra muitos produtos e seções redundantes para a nova direção objetiva.
10. Produto MLB4417997973 possui divergência explícita: título informa novo, condição exportada indica usado, e a descrição histórica cita quantidade incompatível.
11. Metadados ainda não estão preparados para GitHub Pages com base `/omegaimports-catalogo/`.
12. O site atual foi publicado em Sites, mas o novo requisito pede GitHub Pages.

## Fontes inspecionadas

- `Anuncios-2026_07_10-13_28.xlsx`
- `Fichas_tecnicas-2026_06_30-14_54.xlsx`
- `OMEGAIMPORTS _ Página do vendedor.html`
- `OMEGAIMPORTS _ Componentes para eletrônica, automação e energia _ OMEGAIMPORTS.html`
- assets de imagem existentes em Downloads e em `public/products/`

## Direção de reconstrução

- Corrigir encoding na fonte de dados.
- Separar label e slug de categoria.
- Adicionar `imageStatus`, `lastVerifiedAt`, `priceLastVerifiedAt` e `linkStatus`.
- Marcar imagens como `needs-review` salvo quando houver prova de associação exata com MLB.
- Exibir destaque da Home somente com `imageStatus = verified`; enquanto não houver imagem verificada, usar cards técnicos sem produto real destacado.
- Remover o símbolo genérico `Ω` do cabeçalho e usar asset de marca processado.
- Adicionar auditorias bloqueantes para encoding, links e produtos.
- Preparar build estático para GitHub Pages e workflow de deploy.
