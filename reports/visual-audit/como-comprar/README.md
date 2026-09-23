# Como Comprar - auditoria visual

Data: 2026-09-23
Branch: `fix/restore-v2-frozen-visual-1to1`
Viewport de referência: 935 x 1683 px

## Baseline congelado

- `templates/v2-home-frozen.html`: `35e866bee6b0cf3367d48372afc34c380c71aa3fac0f2ed7be5225c0ccb5a321`
- `tests/fixtures/v2-frozen/SHA256SUMS.txt`: `baf5cdc114be85431cbffd06feabfc6ff528f3bbc8952b0876eab4a13fff229a`
- `dist/index.html` antes e depois: `5fea08d16c8ff6582ca8ec7c80145a06041c9317e8c53a62a59153121ae5e38a`

## Geometria verificada no navegador

O corpo de Como Comprar possui 1.398 px, distribuídos conforme o mockup:

- Hero: 391 px
- Passo a passo: 405 px
- Benefícios: 344 px
- CTA: 258 px

Todas as imagens carregaram com dimensões naturais válidas. Não houve erro ou aviso no console. O `header` e o `footer` renderizados são idênticos aos da Home congelada.

## Gates concluídos

- Build estático
- Lint
- Typecheck
- Auditoria de UTF-8/mojibake
- Paridade de checksums V2: 124/124
- Paridade estrutural da Home: 787 tags
- Inspeção visual em 935 px no navegador da aplicação

## Gate numérico pendente

Os scripts `scripts/capture-how-to-buy.mjs` e `scripts/metrics-how-to-buy.py` geram `reference`, `current`, `overlay`, `diff`, SSIM e MAE sem alterar a referência. A execução automatizada local permanece pendente porque o Playwright não possui o Chromium instalado neste ambiente e o sandbox bloqueia a inicialização do Chrome do sistema.

Como o SSIM/MAE ainda não pôde ser medido, esta auditoria não autoriza avançar para Termos de uso. A página Como Comprar foi implementada e inspecionada, mas o gate numérico continua explicitamente aberto.
