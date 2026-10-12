# 01 - Diagnóstico Arquitetural e Operacional

## 1. Identificação Geral do Projeto
- **Nome do Projeto**: OMEGAIMPORTS (Catálogo Especializado de Componentes Eletrônicos, IoT e Automação)
- **Empresa**: OMEGAIMPORTS
- **Modelo de Negócio**: Vitrine digital estática de alta velocidade que direciona compradores diretamente para os anúncios e checkout oficial no Mercado Livre. Não possui carrinho próprio, sistema de pagamento interno ou banco de dados relacional exposto.
- **Repositório Git**: `https://github.com/luscaarmstrong1/omegaimports-catalogo.git`
- **Branch de Trabalho**: `fix/unify-v2-site-shell-and-functionality` (rastreada com `github/fix/unify-v2-site-shell-and-functionality` e sincronizada com `main`)
- **Arquitetura da Aplicação**: Static Site Generator (SSG) de alta performance em Node.js (ES Modules), HTML5 semântico, CSS3 modular (design tokens, seções, responsividade) e dados estruturados em JSON sob `src/data/`.
- **Runtime e Ferramentas**: Node.js (v22/v24), JavaScript moderno (ESM), pnpm (v12 / lockfile v9).
- **Pipeline de Imagens**: Sharp (`0.35.5`) processando imagens WebP responsivas e capas editoriais.

---

## 2. Infraestrutura e Ambientes de Deploy
A OMEGAIMPORTS utiliza uma arquitetura de dois ambientes rigorosamente segregados para evitar concorrência em buscadores:

1. **Produção Oficial (Canônica e Indexável)**:
   - **Ambiente**: GitHub Pages
   - **URL Oficial**: `https://luscaarmstrong1.github.io/omegaimports-catalogo/`
   - **Pipeline de CI/CD**: GitHub Actions (`.github/workflows/deploy-pages.yml`) disparado em push na branch `main`.
   - **Robots / Sitemap**: `robots.txt` com `Allow: /` e apontamento para `sitemap.xml`.
   - **Sitemap**: Contém exatamente 81 URLs canônicas indexáveis (exclui 404 e redirecionamentos legados).
   - **Canonicals**: 100% das páginas apontam exclusivamente para este domínio como canônico.

2. **Homologação / Preview (Rastreável com Desindexação Estrita)**:
   - **Ambiente**: Vercel (`vercel.json`)
   - **URL de Preview**: `https://omegaimports.vercel.app`
   - **Controle de Desindexação Coerente**:
     - Para evitar o erro comum onde `Disallow: /` no `robots.txt` impede os robôs de lerem a diretiva `noindex` (fazendo com que a URL ainda seja listada sem snippet), o ambiente de preview permite rastreamento no `robots.txt` mas injeta os cabeçalhos HTTP `X-Robots-Tag: noindex, nofollow, noarchive` em todas as rotas e `<meta name="robots" content="noindex,nofollow,noarchive">` no HTML.
     - Desta forma, motores de busca como o Googlebot acessam a página, identificam o `noindex` explícito e o link canonical apontando para o GitHub Pages, garantindo que o preview nunca indexe nem compita com a produção.

---

## 3. Mapeamento de Rotas e Páginas (85 Arquivos HTML)
- **Páginas Principais (10)**: Home (`/`), Catálogo (`/produtos/`), Categorias (`/categorias/`), Blog (`/blog/`), Sobre Nós (`/sobre/`), Como Comprar (`/como-comprar/`), Contato (`/contato/`), Termos de Uso (`/termos-de-uso/`), Política de Privacidade (`/politica-de-privacidade/`), Dúvidas Frequentes (`/duvidas-frequentes/`).
- **Páginas de Produtos Públicos (28)**: Subpastas individuais em `/produtos/<slug>/` com dados técnicos, fotos otimizadas e links oficiais do Mercado Livre.
- **Categorias Ativas (8)**: `/categorias/<slug>/` (Automação, Componentes, Conectores, Fontes, GPS, Instrumentos, IoT, Sensores).
- **Artigos do Blog (6)**: `/blog/<slug>/` com conteúdos aprofundados sobre ESP32, telemetria, conectividade celular e IoT.
- **Páginas Especiais (4 - Excluídas do Sitemap)**:
  - `/404.html`: Página de erro padronizada (`noindex: true`).
  - `/aplicacoes/index.html`: Redirecionamento legado para `/produtos/` (`noindex: true`).
  - `/familias/index.html`: Redirecionamento legado para `/produtos/` (`noindex: true`).
  - `/guias/index.html`: Redirecionamento legado para `/blog/` (`noindex: true`).
- **Total de Arquivos HTML**: 85.
- **Total de URLs Canônicas no Sitemap**: 81 (85 menos as 4 páginas `noindex`/redirect/404).

---

## 4. Integração com Mercado Livre
- **Identificador de Vendedor (CustId)**: `194516027` (Loja Oficial OMEGAIMPORTS).
- **Validação de Destino em Tempo Real**:
  - `https://www.mercadolivre.com.br/pagina/omegaimports` (HTTP 203 - Loja Oficial Ativa)
  - `https://lista.mercadolivre.com.br/_CustId_194516027` (HTTP 200 - Anúncios do Vendedor Ativos)
  - Permalinks de produtos individuais validados com código MLB e protocolo HTTPS seguro.

---

## 5. Proteção de Baseline Desktop e Checksums
- Aprovada validação criptográfica de **133 arquivos da baseline** congelada via SHA-256 (`tests/fixtures/v2-frozen/SHA256SUMS.txt`), garantindo que nenhuma alteração não autorizada seja introduzida na geometria da Home desktop aprovada.
