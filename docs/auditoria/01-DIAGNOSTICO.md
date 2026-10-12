# 01 - Diagnóstico Arquitetural e Operacional

## 1. Identificação Geral do Projeto
- **Nome do Projeto**: OMEGAIMPORTS (Catálogo Especializado de Componentes Eletrônicos, IoT e Automação)
- **Empresa**: OMEGAIMPORTS
- **Repositório Git**: `https://github.com/luscaarmstrong1/omegaimports-catalogo.git`
- **Branch de Trabalho**: `fix/unify-v2-site-shell-and-functionality` (rastreada com `github/fix/unify-v2-site-shell-and-functionality` e espelhada em `main`)
- **Arquitetura da Aplicação**: Static Site Generator (SSG) de alto desempenho baseado em Node.js (ES Modules), HTML5 semântico, CSS3 modular (tokens, componentes, layout responsivo) e bases de dados tipadas em JSON sob `src/data/`.
- **Linguagens e Runtime**: Node.js (v22/v24), JavaScript (ESM moderno), HTML5, CSS3.
- **Gerenciador de Pacotes e Lockfile**: `pnpm` (`pnpm-lock.yaml`).

---

## 2. Infraestrutura, Hospedagem e Ambientes de Deploy
A OMEGAIMPORTS opera sob uma arquitetura de duplo ambiente rigorosamente segregada:

1. **Produção Oficial (Indexável)**:
   - **Ambiente**: GitHub Pages
   - **URL Oficial**: `https://luscaarmstrong1.github.io/omegaimports-catalogo/`
   - **Pipeline de Deploy**: GitHub Actions (`.github/workflows/deploy-pages.yml`) disparado em push na branch `main`.
   - **Robots / Sitemap**: `robots.txt` permitindo indexação (`Allow: /`) e `sitemap.xml` contendo todas as 84 URLs públicas e canônicas.
   - **Canonical Tag**: Todas as páginas apontam exclusivamente para o domínio canônico oficial da produção.

2. **Homologação / Preview (Não indexável)**:
   - **Ambiente**: Vercel (`vercel.json`)
   - **URL de Preview**: `https://omegaimports.vercel.app`
   - **Robots / Meta Robots**: Cabeçalhos e meta tags estritas `noindex, nofollow, noarchive` ativadas via detecção de ambiente em `scripts/shared.mjs` e `scripts/deployment.mjs`.
   - **Objetivo**: Validação visual, testes em dispositivos móveis e homologação antes da consolidação em produção sem competir no ranking de buscadores.

---

## 3. Integrações e Serviços Externos
- **Catálogo e Checkout Comercial**: Mercado Livre
  - Loja Oficial OMEGAIMPORTS no Mercado Livre (CustId `194516027`).
  - Todo o processo de checkout, carrinho, faturamento e pagamento é delegado integralmente aos links oficiais autenticados do Mercado Livre, eliminando riscos de custódia de dados de pagamento (PCI-DSS) e credenciais de usuários.
- **Atendimento e Vendas Diretas**: WhatsApp Business
  - Link seguro `https://wa.me/5535999528858` com codificação URI de mensagem predefinida.
- **Canais Sociais e Institucionais**:
  - Instagram oficial: `https://www.instagram.com/omegaimports.oficial/`
  - LinkedIn oficial: `https://www.linkedin.com/company/omegaimports/`
- **Sistemas de Autenticação / Banco de Dados**:
  - Inexistentes no frontend/servidor estático (site headless orientado a catálogo e conteúdo editorial).

---

## 4. Estrutura de Diretórios
- `src/`: Dados do catálogo (`products.json`, `blog-posts.json`, taxonomias, calendário editorial).
- `public/`: Assets estáticos da marca, imagens otimizadas de produtos (`/products/`), capas do blog e ícones SVG.
- `templates/`: Templates HTML (`v2-home-frozen.html`, estruturas de páginas internas e componentes).
- `scripts/`: Pipeline de build (`build-site.mjs`, `generate-blog-covers.mjs`), scripts de auditoria automatizada e utilitários.
- `tests/`: Suites de testes unitários e de integração (`catalog.test.mjs`, `vercel-preview.test.mjs`).
- `dist/`: Diretório de saída estática gerado pelo build (85 páginas HTML, assets, manifests, feeds e sitemaps).
- `reports/`: Relatórios de auditorias, métricas visuais e logs de validação.
- `.github/workflows/`: Pipelines de CI/CD para GitHub Pages e sincronização com Mercado Livre.

---

## 5. Matriz de Riscos e Diagnóstico Preliminar
1. **Supply Chain (DevDependencies)**:
   - *Severidade*: P1 (Alto)
   - *Diagnóstico*: Pacote `sharp` encontrava-se na versão `^0.35.3`, vulnerável aos alertas de segurança GHSA-g89c-p67h-r497 e GHSA-wq5f-xc86-pv6w (libheif e librsvg).
   - *Resolução*: Atualização para `sharp@0.35.5` validada com sucesso; vulnerabilidades zeradas.
2. **Cabeçalhos de Segurança HTTP na Vercel**:
   - *Severidade*: P2 (Médio)
   - *Diagnóstico*: `vercel.json` não possuía cabeçalhos HTTP de segurança declarados.
   - *Resolução*: Inserção de `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` e políticas de cache imutável para assets estáticos.
3. **Exposição de Dados e Segredos**:
   - *Severidade*: P0 (Crítico) - Avaliado
   - *Diagnóstico*: 0 segredos, tokens ou senhas expostos no código. Arquivo `.env.example` sanitizado.
