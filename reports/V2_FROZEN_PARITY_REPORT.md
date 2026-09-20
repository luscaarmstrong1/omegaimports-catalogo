# OMEGAIMPORTS V2 Frozen Parity Report

## Status

**Código pronto para validação no CI. Publicação e merge bloqueados até a matriz visual automatizada ficar verde.**

## Fonte de verdade

- Referência portátil: `tests/fixtures/v2-frozen/`
- Manifesto oficial: `tests/fixtures/v2-frozen/SHA256SUMS.txt`
- Branch: `fix/restore-v2-frozen-visual-1to1`
- Workflow: `.github/workflows/v2-visual-parity.yml`

## Integridade confirmada

- 124 de 124 arquivos conferidos pelo SHA-256 oficial antes e depois da migração.
- 1 de 1 HTML, 6 de 6 folhas de estilo e 106 de 106 ativos aprovados.
- Logo, favicon, hero, banners, suporte, marcas, pagamentos e marketplace incluídos na auditoria obrigatória.
- A auditoria estrutural confirmou os mesmos 787 elementos estáticos.
- Os seis CSS e o template congelado não foram alterados.

## Conteúdo de produção

- 28 produtos públicos e 6 artigos preservados.
- 36 produtos pendentes ou ocultos continuam fora da vitrine pública.
- Links reais de categorias, blog, sobre, busca, WhatsApp, LinkedIn e Mercado Livre continuam funcionais.
- Links sem destino real foram neutralizados sem redirecionamento enganoso.
- Claims de mockup foram substituídos, apenas na camada de produção, por textos verificáveis.
- Newsletter informa que o cadastro estará disponível em breve; favoritos deixam claro o escopo da sessão.

## Validações locais concluídas

- Build estático.
- Checksums da fixture frozen.
- Paridade estrutural frozen: 787 tags.
- Testes de catálogo: 6 aprovados.
- E2E estático, lint, typecheck, links, encoding, SEO, blog, copy, imagens e marketplace.
- `git diff --check`.

## Gate visual obrigatório

O workflow `V2 visual parity` instala o Playwright e o Chromium no Ubuntu, recompila o site e compara referência e produção nas larguras 1920, 1672, 1440, 1024, 768, 430, 390 e 375 px. Para cada viewport, exige:

- SSIM global maior ou igual a 0,99.
- Alturas idênticas.
- Máscara limitada aos cards dinâmicos de produtos e artigos.
- Capturas frozen/produção, overlay, diff e `results.json` publicados como artefato mesmo em falha.

O ambiente local bloqueou a instalação do Chromium com `spawn EPERM`. Por isso, a medição visual definitiva será feita pelo CI e nenhum número de SSIM local foi fabricado.

## Decisão de publicação

O pull request deve permanecer como draft até todos os oito viewports passarem. Depois disso, pode ser marcado como pronto para revisão, sem merge automático.
