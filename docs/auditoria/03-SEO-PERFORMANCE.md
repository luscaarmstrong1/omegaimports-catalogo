# 03 - Auditoria de SEO Técnico, Indexação e Performance

Este documento detalha as verificações e otimizações de **SEO Técnico**, integridade de metadados, arquitetura de indexação de produtos e métricas de **Performance e Core Web Vitals** da OMEGAIMPORTS.

---

## 1. Mapeamento Integral de Rotas e Páginas (85 Arquivos HTML vs 81 URLs Canônicas)

### Por que 85 arquivos HTML geram exatamente 81 URLs no Sitemap?
A auditoria minuciosa do pipeline de build identificou com exatidão a composição:
- **81 URLs Públicas Canônicas e Indexáveis**:
  - `10` Páginas Institucionais e Raiz: Home (`/`), Catálogo (`/produtos/`), Categorias (`/categorias/`), Blog (`/blog/`), Sobre (`/sobre/`), Contato (`/contato/`), Como Comprar (`/como-comprar/`), Política de Privacidade (`/politica-de-privacidade/`), Termos de Uso (`/termos-de-uso/`), Dúvidas Frequentes (`/duvidas-frequentes/`).
  - `28` Páginas de Detalhes de Produtos Públicos (`/produtos/<slug>/`).
  - `8` Páginas de Categorias com Produtos Ativos (`/categorias/<slug>/`).
  - `6` Artigos Editoriais do Blog (`/blog/<slug>/`).
  - *Soma*: 10 + 28 + 8 + 6 = **81 URLs canônicas presentes no `sitemap.xml`**.
- **4 Arquivos HTML Excluídos Corretamente do Sitemap (Não-Canônicos / Noindex)**:
  - `dist/404.html`: Página de erro 404 (obrigatoriamente fora do sitemap; possui tag `noindex`).
  - `dist/aplicacoes/index.html`: Página de redirecionamento legado para `/produtos/` (`noindex: true`).
  - `dist/familias/index.html`: Página de redirecionamento legado para `/produtos/` (`noindex: true`).
  - `dist/guias/index.html`: Página de redirecionamento legado para `/blog/` (`noindex: true`).
- *Total de arquivos HTML*: 81 + 4 = **85 arquivos**.

---

## 2. Estratégia de Indexação em Ambientes Duplicados (GitHub Pages vs Vercel)
A concorrência SEO entre ambiente de produção e ambiente de homologação/preview foi solucionada tecnicamente:

### O Problema do `Disallow: /` no Preview
Quando um ambiente secundário utiliza simplesmente `Disallow: /` no `robots.txt`, motores de busca como o Googlebot são impedidos de fazer o download do documento HTML e, portanto, **não conseguem ler a tag `<meta name="robots" content="noindex">`**. Como resultado, se houver qualquer link apontando para o preview na web, a URL pode ser indexada "sem snippet" nos resultados de pesquisa.

### A Solução Implementada
1. **Robots.txt Rastreável no Preview**: O arquivo `robots.txt` no ambiente de preview permite o acesso (`Allow: /`), convidando os robôs a inspecionarem o cabeçalho da resposta.
2. **Cabeçalho HTTP `X-Robots-Tag`**: O arquivo `vercel.json` injeta `X-Robots-Tag: noindex, nofollow, noarchive` em 100% das requisições servidas pela Vercel.
3. **Meta Tag no HTML**: As páginas no preview contêm `<meta name="robots" content="noindex,nofollow,noarchive">`.
4. **Canonical Oficial Unificado**: Todas as páginas mantêm `<link rel="canonical" href="https://luscaarmstrong1.github.io/omegaimports-catalogo/.../">`.
5. **Resultado**: O Googlebot lê a instrução de desindexação imediatamente e remove/ignora qualquer URL do preview, preservando 100% da autoridade para a produção no GitHub Pages.

---

## 3. SEO de Catálogo e Dados Estruturados de Produtos (Schema.org)
- **Schema `Product` e `Offer`**:
  - Implementado em cada uma das 28 páginas de produtos públicos.
  - O campo `offers.url` aponta de forma honesta e transparente para o anúncio oficial no Mercado Livre (`product.permalink`).
  - O campo `offers.availability` reflete a condição real (`https://schema.org/InStock` ou `https://schema.org/OutOfStock`).
  - Não atribui à OMEGAIMPORTS um sistema interno de checkout ou carrinho que não exista, prevenindo penalizações do Google Merchant / Rich Snippets por divergência de fluxo de compra.
- **BreadcrumbList**: Mapeamento estruturado em JSON-LD indicando a hierarquia: Início > Produtos > Nome do Produto.
- **Títulos e Descrições**:
  - Tags `<title>` e `<meta name="description">` exclusivas por produto, sem travessões ou caracteres truncados.
  - H1 único contendo o nome técnico completo do componente.

---

## 4. Blog e Conteúdo Técnico Editorial
- 6 artigos técnicos publicados com autor oficial, capa em alta definição e estrutura clara de tópicos (H2 e H3).
- Conteúdos direcionados para intenção de busca de engenheiros, técnicos e desenvolvedores de IoT (ESP32, modems 2G/4G, antenas GPS, telemetria industrial, monitoramento de energia com sensores de corrente SCT-013).
- Links contextuais internos direcionando naturalmente para os componentes relacionados do catálogo.

---

## 5. Auditoria de Performance e Core Web Vitals
- **LCP (Largest Contentful Paint)**:
  - Elemento principal de imagem utiliza `<link rel="preload">` e atributo `fetchpriority="high"`.
  - Imagens servidas no formato moderno WebP geradas pelo pipeline Sharp com compressão adequada sem perda de legibilidade de serigrafia de componentes.
- **CLS (Cumulative Layout Shift)**:
  - Todas as tags `<img>` e `<picture>` possuem atributos explícitos `width` e `height`, garantindo reserva antecipada do espaço na renderização.
  - Pontuação de CLS mantida em **0,00** em desktop e mobile.
- **INP e TBT (Interatividade e Bloqueio)**:
  - Ausência de frameworks pesados no client-side (sem runtime de React ou hydration blocks no navegador).
  - Scripts leves assíncronos (`runtime.js`), garantindo execução limpa e interações sem atrasos.
- **Políticas de Cache**:
  - `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` para assets estáticos em `vercel.json`, garantindo navegação veloz sem retenção de arquivos desatualizados.
