# Guia de Handoff Técnico para o Codex

Este documento orienta o desenvolvedor ou agente Codex sobre como manter, estender e conectar os dados dinâmicos do catálogo OMEGAIMPORTS preservando a integridade do Design System aprovado.

## 1. Regras Fundamentais de Arquitetura

1. **A Home é a Fonte Global de Verdade:**
   - O cabeçalho (`site-header`), rodapé (`footer`), estilos globais e paleta de cores não devem ser sobrescritos por estilos inline nas páginas internas.
   - Sempre utilize as classes e variáveis definidas em `public/assets/site.css` e `public/assets/internal-pages.css`.

2. **Geração Estática via Node.js:**
   - O site é compilado pelo script `scripts/build-site.mjs`.
   - Para rodar a compilação execute:
     ```bash
     node scripts/build-site.mjs
     ```
   - O build processa o catálogo em `src/data/products.json` e os artigos em `src/data/blog-posts.json`.

3. **Auditorias Automatizadas:**
   - Antes de qualquer deploy ou commit, execute:
     ```bash
     node scripts/audit-links.mjs
     node scripts/audit-seo.mjs
     node scripts/audit-copy.mjs
     node scripts/test-e2e.mjs
     node tests/catalog.test.mjs
     ```
   - Todos os scripts devem finalizar com código `0`.

---

## 2. Conexão de Dados Dinâmicos pelo Codex

### Produtos e Preços (Mercado Livre)
- O catálogo de produtos é atualizado a partir dos anúncios oficiais do Mercado Livre via scripts em `scripts/sync-mercadolivre.mjs`.
- Sempre que novos produtos forem importados, garanta que:
  - O campo `imageStatus` seja `"verified"`.
  - As imagens locais otimizadas existam em `public/products/<slug>/`.
  - O link de compra aponte para `permalink` oficial HTTPS do Mercado Livre.

### Blog e Artigos
- Artigos editoriais residem em `src/data/blog-posts.json`.
- Ao cadastrar novos artigos, vincule produtos relacionados através da propriedade `relatedProductSlugs`.

---

## 3. Estrutura de Ativos em `public/brand/visuals/`

- `hero-esp32-circuit.png`: Utilizado em `/categorias/` e hero da vitrine.
- `hero-telemetry-outdoor.png`: Utilizado em `/blog/`.
- `hero-esp32-vertical.png`: Utilizado em `/duvidas-frequentes/`.
- `hero-privacy-shield.png`: Utilizado em `/politica-de-privacidade/`.
- `hero-chip-gold.png`: Utilizado em `/termos-de-uso/`.
- `banner-laptop-mercadolivre.png`: Utilizado em `/como-comprar/`.
- `support-specialist.png`: Utilizado no hero de `/sobre/` e no banner global de suporte VIP (`internalSupportBanner`).
