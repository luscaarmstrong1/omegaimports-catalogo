# OMEGAIMPORTS - Home Curated Showcase V9

## Resumo

Aplicacao detalhada da V9 na Home do catalogo OMEGAIMPORTS, substituindo a primeira dobra anterior por uma experiencia editorial premium: hero escuro central, busca funcional, chips rapidos de categoria e showcase curada com produtos reais do catalogo.

## Antes

- Hero V8 com produto principal isolado.
- Grade antiga de categorias aparecendo logo apos a primeira dobra.
- Menos foco visual em curadoria e familias de produtos reais.

## Depois

- Hero central escuro com headline curta, busca e chips funcionais para `/produtos/`.
- Showcase acima da dobra com 6 produtos reais, imagens locais verificadas e familias tecnicas distintas.
- Interacoes com tracking dedicado: `showcase_product_click` e `showcase_category_click`.
- Header passa a marcar estado scrolled apenas apos 24px.
- Revelacao visual ajustada com `scale(.985)`, stagger por CSS custom property e fallback para movimento reduzido.

## Produtos curados

| Posicao | MLB | Categoria | Produto |
|---:|---|---|---|
| 1 | MLB5288925380 | IoT, GSM e comunicacao | 3x Kit ESP32 SIM800L Modulo Sem Fio GPRS T-Call + Antena |
| 2 | MLB4669503045 | Sensores e medicao | Sensor de Corrente AC Nao Invasivo SCT-013 100 A 50 mA |
| 3 | MLB3948192369 | Fontes e alimentacao | Kit 10 Mini fonte Chaveada Hi-Link HLK-PM01 - 5 V 3 W |
| 4 | MLB3963960643 | GPS e localizacao | 10x Modulo GPS Ublox GY-GPS6MV2 para Arduino, Drone e ESP |
| 5 | MLB4669565379 | Automacao e comando | 3x Filtro Supressor de Ruidos Eicos K-8 para Contatores 220 V |
| 6 | MLB5268487034 | Instrumentos de bancada | Fonte de Alimentacao DC Hikari HF-3205S 32 V/5 A para bancadas |

## Referencias de direcao visual

- Apple/Shop: simplicidade, foco em produto, tipografia grande e respiro.
- Dyson: fundo escuro, fotografia de produto como protagonista e pouca ornamentacao.
- Teenage Engineering: composicao editorial e cards de produto com personalidade.
- Linear/ToDesktop: disciplina de grid, estados sutis e motion controlado.

As referencias foram usadas como principios de direcao, sem copiar assets, marca, layout proprietario ou codigo.

## Responsividade

Screenshots finais geradas em:

- `reports/screenshots/home-curated-showcase-v9/home-1440x900.png`
- `reports/screenshots/home-curated-showcase-v9/home-1920x1080.png`
- `reports/screenshots/home-curated-showcase-v9/home-820x1180.png`
- `reports/screenshots/home-curated-showcase-v9/home-430x932.png`
- `reports/screenshots/home-curated-showcase-v9/home-390x844.png`
- `reports/screenshots/home-curated-showcase-v9/home-360x800.png`
- `reports/screenshots/home-curated-showcase-v9/produtos-1440x900.png`
- `reports/screenshots/home-curated-showcase-v9/produtos-390x844.png`

## Validacao

Passou:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`
- `npm run audit:products`
- `npm run audit:owned-items`
- `npm run audit:catalog-listings`
- `npm run audit:images`
- `npm run audit:public-images`
- `npm run audit:copy`
- `npm run audit:encoding`
- `npm run audit:links`
- `npm run audit:seo`
- `npm run audit:blog`
- `npm run audit:specifications`

Observacoes:

- `audit:products` concluiu com 7 avisos ja existentes de condicao/quantidade, 0 criticos.
- `audit:specifications` concluiu com 16 achados informativos.
- `npm run lighthouse` nao executou neste ambiente; o script gerou `reports/lighthouse/home-not-run.json`.

## Arquivos alterados

- `scripts/build-site.mjs`
- `scripts/test-e2e.mjs`
- `public/assets/site.css`
- `public/assets/site.js`
- `reports/home-curated-showcase-v9.md`
- `reports/screenshots/home-curated-showcase-v9/*`

