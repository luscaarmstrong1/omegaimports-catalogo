# OMEGAIMPORTS V2 Frozen Parity Report

## Status

**Código pronto para revisão. Publicação bloqueada até a conclusão da matriz visual automatizada.**

## Fonte de verdade

- Referência: `omegaimports-v2-approved/01-preview-v2`
- Template versionado: `templates/v2-home-frozen.html`
- Branch: `fix/restore-v2-frozen-visual-1to1`

## Paridade confirmada

- O template versionado possui o mesmo SHA-256 do `index.html` frozen: `35e866bee6b0cf3367d48372afc34c380c71aa3fac0f2ed7be5225c0ccb5a321`.
- `tokens.css`, `reset.css`, `components.css`, `sections.css`, `responsive.css` e `animations.css` possuem SHA-256 idêntico aos arquivos frozen.
- A auditoria estrutural confirmou os mesmos 787 elementos estáticos, mascarando somente os cards dinâmicos de produtos e artigos.
- O HTML final preserva a hierarquia do frozen e injeta os dados reais em regiões controladas.
- A inspeção local disponível confirmou header, logo, hero, faixa de confiança, categorias, produtos, artigos, suporte e footer no visual aprovado.

## Conteúdo real preservado

- 28 produtos públicos do catálogo.
- 6 artigos publicados.
- 36 produtos pendentes ou ocultos permanecem fora da vitrine pública.
- Links de categorias, blog, sobre, busca, WhatsApp, LinkedIn e Mercado Livre foram mantidos funcionais.
- Cards de categoria recebem semântica de link e navegação por teclado em tempo de execução, sem alterar a estrutura frozen.

## Validações concluídas

- `pnpm run build`
- `pnpm run audit:v2-dom`
- `pnpm run test:e2e`
- `pnpm run audit:dist`
- `pnpm test` - 6 testes aprovados
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run audit:links`
- `pnpm run audit:encoding`
- `git diff --check`

## Gate visual pendente

O comando `pnpm run audit:v2-visual` está preparado para comparar frozen e produção nas larguras 1920, 1672, 1440, 1024, 768, 430, 390 e 375 px. Ele gera capturas, overlay, diff e SSIM global com mínimo de 0,99, mascarando somente produtos e artigos dinâmicos.

No ambiente atual, o Chromium não pôde ser iniciado por restrição de execução (`spawn EPERM`). A tentativa de abrir a referência local no navegador controlado também foi negada pela permissão do ambiente. Por isso, não foram fabricados números de SSIM e a promoção para produção deve permanecer bloqueada até essa matriz ser executada com acesso ao navegador.

## Decisão de publicação

O branch pode ser enviado e revisado em pull request. O pull request **não deve ser mesclado nem publicado** enquanto o gate visual automatizado não estiver verde em todas as larguras.
