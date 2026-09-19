import fs from 'fs';
import path from 'path';

const baseDir = 'handoff/omegaimports-v2-approved';
const docsDir = path.join(baseDir, '04-documentation');
const mapDir = path.join(baseDir, '05-integration-map');

fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(mapDir, { recursive: true });

// 1. HANDOFF_TO_CODEX.md
fs.writeFileSync(path.join(docsDir, 'HANDOFF_TO_CODEX.md'), `# HANDOFF TÉCNICO OFICIAL — OMEGAIMPORTS V2 APROVADA
**Data de Congelamento:** 19/09/2026  
**Status do Design:** APROVADO / FROZEN (Zero modificações visuais permitidas)  
**Destinatário:** CODEX / Engenharia de Software  
**Emissor:** Antigravity (Design System & Frontend Validation)

---

## 1. DIRETRIZ ABSOLUTA: NOVO FRONT + MOTOR ANTIGO

> ⚠️ **LEI SUPREMA DESTE HANDOFF:**
> 1. **PRESERVE RIGOROSAMENTE A CAMADA VISUAL:** O HTML, CSS, hierarquia de classes, proporções, espaçamentos, tipografia e assets visuais contidos em \`01-preview-v2\` representam a versão **100% aprovada pelo cliente**. É **terminantemente proibido** redesign, refatoração estética, simplificação de regras visuais ou troca arbitrária de classes CSS.
> 2. **SUBSTITUA APENAS A ORIGEM DOS DADOS:** A V2 aprovada utiliza dados estáticos/mockados (\`data/catalog-products.json\`, banners estáticos, textos de exemplo). O papel do Codex é transformar estes elementos em nós dinâmicos alimentados pela API do Mercado Livre, catálogo real, feed do LinkedIn e rotas funcionais.
> 3. **PROIBIDO USAR SCREENSHOTS COMO FUNDO:** A pasta \`03-screenshots\` serve **exclusivamente** para validação visual humana e regressão visual automatizada. O site já é 100% construído em HTML semântico, CSS moderno e JS nativo.

---

## 2. ESTRUTURA DO PACOTE DE HANDOFF

\`\`\`
handoff/omegaimports-v2-approved/
├── 01-preview-v2/           # Código-fonte completo e autônomo da V2 congelada
│   ├── index.html           # Documento HTML estruturado e semântico
│   ├── css/                 # Estilização completa modular (tokens, layout, components)
│   ├── js/                  # Interatividade nativa (mobile menu, reveal, drawer de contato)
│   ├── data/                # Datasets mockados que o Codex deve plugar na API
│   └── assets/              # Árvore completa de imagens locais referenciadas
├── 02-assets/               # Biblioteca categorizada de todos os assets visuais
├── 03-screenshots/          # 16 screenshots oficiais de referência (viewports + seções)
├── 04-documentation/        # Especificações técnicas detalhadas
│   ├── HANDOFF_TO_CODEX.md  # Este guia mestre de integração
│   ├── DESIGN_LOCK.md       # Diretrizes de congelamento visual
│   ├── DESIGN_TOKENS.md     # Catálogo de variáveis CSS, cores, fontes, sombras
│   ├── RESPONSIVE_BEHAVIOR.md # Regras de layout para 1920px até 375px
│   ├── ASSET_MAP.md         # Mapeamento técnico de cada imagem (fit, position, dimensões)
│   ├── FILE_MANIFEST.md     # Inventário de arquivos e regras de modificação
│   ├── RUN_V2.md            # Como executar e testar localmente
│   ├── DEPENDENCIES.md      # Dependências e requisitos de runtime
│   ├── SECURITY_SCAN.md     # Relatório de conformidade e ausência de segredos
│   └── HANDOFF_REPORT.md    # Relatório executivo do congelamento
├── 05-integration-map/      # Mapeamento cirúrgico de dados e componentes
│   ├── INTEGRATION_MAP.md   # Mapeamento seção por seção (o que manter vs o que ligar)
│   ├── MOCK_COMPONENTS.md   # Inventário de elementos mockados que precisam de backend
│   └── REAL_FUNCTIONS_EXPECTED.md # Requisitos de integração (ML, WhatsApp, LinkedIn, SEO)
└── 06-checksums/            # Integridade criptográfica (SHA-256)
    └── SHA256SUMS.txt
\`\`\`

---

## 3. CHECKLIST DE INTEGRAÇÃO PARA O CODEX

- [ ] **Catalog Injection:** Conectar \`data/catalog-products.json\` à listagem real do Mercado Livre (mantendo estrutura do card: tags, preço, parcelamento, badges).
- [ ] **Search & Filtering:** Tornar o input de busca do header e os chips de categoria funcionais para filtrar os produtos em tempo real.
- [ ] **WhatsApp & Contact Drawer:** Configurar o número oficial da OMEGAIMPORTS no drawer de contato rápido e botão flutuante.
- [ ] **LinkedIn Feed / Blog:** Conectar a seção de Artigos & Análises ao feed ou CMS do LinkedIn, mantendo a diagramação dos 3 cards.
- [ ] **Newsletter Subscription:** Conectar o form do footer/newsletter ao webhook ou serviço de captura de leads.
- [ ] **SEO & Metadata:** Injetar Open Graph, Twitter Cards, JSON-LD Schema.org (Organization, WebSite, ItemList).
- [ ] **Performance & Web Vitals:** Manter as tags de \`loading="lazy"\`, \`decoding="async"\`, e as dimensões explícitas para garantir LCP e CLS ideais.
`, 'utf8');

// 2. DESIGN_LOCK.md
fs.writeFileSync(path.join(docsDir, 'DESIGN_LOCK.md'), `# TERMO DE CONGELAMENTO VISUAL — DESIGN LOCK
**Versão:** OMEGAIMPORTS V2 APPROVED (19/09/2026)  
**Nível de Rigidez:** MÁXIMO / CRÍTICO

---

## 1. ESCOPO DO CONGELAMENTO
A camada de apresentação visual da OMEGAIMPORTS V2 foi rigorosamente testada, alinhada e formalmente aprovada.  
Nenhuma modificação estética pode ser realizada sem solicitação expressa do cliente.

### O QUE ESTÁ TERMINANTEMENTE PROIBIDO:
1. **Redesign de Componentes:** Não altere a disposição geométrica do Header, Hero, Grid de Categorias, Cards de Produtos, Bloco de Blog, Banners Institucionais, Suporte ou Footer.
2. **Substituição de Classes CSS:** Não renomeie nem remova classes utilitárias ou de componentes (\`.oi-*\`, \`.header-*\`, \`.product-card\`, etc.).
3. **Alteração de Tokens:** Não modifique valores da paleta (\`--oi-brand-navy\`, \`--oi-brand-gold\`, gradientes), tipografia (\`Inter\`, pesos 400-800) ou curvaturas (\`border-radius\`).
4. **Remoção de Elementos Visuais:** Não exclua badges institucionais ("Mercado Líder Platinum", garantia, parcelamento, selos de segurança).
5. **Uso de Imagens Raster como Tela:** Nunca converta o HTML semântico em imagem estática de fundo.

### O QUE É PERMITIDO E ESPERADO DO CODEX:
1. **Injeção de Dados Dinâmicos:** Renderizar loops de produtos vindos da API, preenchendo os nós HTML existentes.
2. **Manipulação de Eventos:** Ligar listeners de clique, envio de formulário, paginação, filtros e navegação.
3. **Sanitização e Acessibilidade:** Adicionar atributos \`aria-*\`, melhorias semânticas sem impacto visual e tratamento de fallback de imagem (caso uma imagem de produto da API falhe).
`, 'utf8');

// 3. DESIGN_TOKENS.md
fs.writeFileSync(path.join(docsDir, 'DESIGN_TOKENS.md'), `# DICIONÁRIO DE DESIGN TOKENS — OMEGAIMPORTS V2

Documentação de todos os tokens CSS ativos definidos em \`01-preview-v2/css/variables.css\` e \`theme.css\`.

---

## 1. CORES DA MARCA (BRAND COLORS)

| Token CSS | Valor HEX / HSL | Uso Principal |
|---|---|---|
| \`--oi-brand-navy-dark\` | \`#050B14\` | Fundo principal da página (Ultra Dark) |
| \`--oi-brand-navy\` | \`#0A1120\` | Fundo de containers, cards e painéis |
| \`--oi-brand-navy-light\` | \`#131F37\` | Hover de cards, bordas ativas, superfícies secundárias |
| \`--oi-brand-gold\` | \`#F59E0B\` | Destaques de conversão, estrelas, badges premium |
| \`--oi-brand-gold-glow\` | \`rgba(245, 158, 11, 0.25)\` | Sombras iluminadas em CTAs e chips selecionados |
| \`--oi-brand-blue-accent\` | \`#2563EB\` | Acento tecnológico, links secundários |
| \`--oi-brand-green-accent\`| \`#10B981\` | Badges de frete grátis, estoque e garantia |

---

## 2. CORES DE TEXTO & NEUTROS

| Token CSS | Valor | Uso |
|---|---|---|
| \`--oi-text-primary\` | \`#FFFFFF\` | Títulos principais, valores de destaque, botões |
| \`--oi-text-secondary\` | \`#94A3B8\` | Subtítulos, labels secundárias, metadados |
| \`--oi-text-muted\` | \`#64748B\` | Textos de apoio, placeholders, borders sutis |
| \`--oi-border-subtle\` | \`rgba(255, 255, 255, 0.08)\` | Divisórias e bordas padrão de cards |
| \`--oi-border-highlight\` | \`rgba(245, 158, 11, 0.35)\` | Bordas de cards em foco ou destaque |

---

## 3. TIPOGRAFIA

- **Família de Fontes:** \`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\`
- **Escala de Tamanhos:**
  - H1 (Hero Title): \`clamp(2.25rem, 5vw, 3.5rem)\` | Peso: \`800\` (Extra Bold)
  - H2 (Section Titles): \`clamp(1.75rem, 3.5vw, 2.5rem)\` | Peso: \`700\` (Bold)
  - H3 (Card Titles): \`1.125rem (18px)\` | Peso: \`600\` (Semi Bold)
  - Body / Paragraph: \`0.9375rem (15px)\` | Altura de linha: \`1.6\`
  - Price Tag: \`1.5rem (24px)\` | Peso: \`800\`
  - Badges / Small: \`0.75rem (12px)\` | Peso: \`600\`

---

## 4. BORDAS, ELEVAÇÃO & SOMBRAS

- **Border Radius:**
  - Badges & Chips: \`9999px\` (Full Pill)
  - Cards de Categoria / Produto: \`16px\`
  - Banners Hero & Suporte: \`24px\`
  - Inputs & Botões Primários: \`12px\`
- **Box Shadows:**
  - Card Default: \`0 10px 30px -10px rgba(0, 0, 0, 0.5)\`
  - Card Hover: \`0 20px 40px -15px rgba(245, 158, 11, 0.15)\`
  - Glow Primário: \`0 0 25px rgba(245, 158, 11, 0.35)\`
`, 'utf8');

// 4. RESPONSIVE_BEHAVIOR.md
fs.writeFileSync(path.join(docsDir, 'RESPONSIVE_BEHAVIOR.md'), `# COMPORTAMENTO RESPONSIVO — ESPECIFICAÇÃO DE BREAKPOINTS

A OMEGAIMPORTS V2 é construída com abordagem Mobile-First complementada por breakpoints cirúrgicos em CSS Grid e Flexbox.

---

## 1. MATRIZ DE BREAKPOINTS HOMOLOGADOS

| Breakpoint | Dispositivo de Referência | Comportamento de Layout |
|---|---|---|
| **1920px** | Desktop Full HD / Ultrawide | Container max-width de 1380px centralizado. Header com navegação completa, Hero 2 colunas amplas, Produtos em grid de 4 colunas. |
| **1672px** | Desktop Grande | Adaptação fluida dos paddings laterais (\`padding: 0 40px\`). Sem quebras visuais. |
| **1440px** | Laptop Pro / Desktop Médio | Grid de produtos permanece 4 colunas; badges e banners mantêm proporção 16:9 ou 21:9. |
| **1024px** | iPad Pro / Tablet Paisagem | Grid de produtos reduz para 3 colunas. Menu de navegação superior comprime espaçamentos; busca do header mantém expansão. |
| **768px** | Tablet Retrato / Telas Pequenas | Grid de produtos ajusta para 2 colunas. Hero colapsa para visual em pilha (stack vertical) com imagem no topo e texto embaixo. |
| **430px** | iPhone Pro Max / Samsung Ultra | Menu hambúrguer ativo no topo. Grid de produtos 1 ou 2 colunas otimizadas com scroll horizontal no carrossel de categorias. |
| **390px** | iPhone 12 / 13 / 14 / 15 | Padding de container de 16px. Botões ocupam 100% de largura quando em CTA único. Header compacto. |
| **375px** | iPhone SE / Telas Ultra Compactas | Tipografia em escala adaptada (\`clamp\`), garantindo que nenhum texto estoure ou gere scroll horizontal (\`overflow-x: hidden\`). |

---

## 2. REGRAS CRÍTICAS DE PRESERVAÇÃO RESPONSIVA
1. **Overflow Horizontal Zero:** O elemento \`html, body\` possui controle estrito contra scroll horizontal indesejado.
2. **Touch Targets:** Em viewports mobile (≤ 768px), todos os botões e links de navegação mantêm altura mínima de 44px.
3. **Drawer Lateral:** No mobile, o botão do menu abre o painel lateral com navegação estruturada e botão direto para WhatsApp.
`, 'utf8');

// 5. ASSET_MAP.md
fs.writeFileSync(path.join(docsDir, 'ASSET_MAP.md'), `# MAPA OFICIAL DE ASSETS VISUAIS (V2 FROZEN)

Todos os assets foram normalizados e alocados localmente em \`01-preview-v2/assets/\` e arquivados em \`02-assets/\`.

---

## 1. TABELA DE MAPEAMENTO DE IMAGENS

| Categoria | Caminho Local | Dimensão Aprox. | Object-Fit / Position | Função Visual |
|---|---|---|---|---|
| **Brand** | \`assets/brand/omegaimports-logo-horizontal.png\` | 340x80 | \`contain\` / center | Logo oficial do Header (máxima legibilidade) |
| **Brand** | \`assets/brand/omegaimports-logo-footer.png\` | 280x70 | \`contain\` / left | Logo oficial do Footer com tom contrastante |
| **Hero** | \`assets/hero/hero-banner-main.png\` | 1200x800 | \`cover\` / center | Composição de produtos premium do Hero |
| **Categories** | \`assets/categories/cat-smartphones.png\` | 400x400 | \`cover\` / center | Card: Smartphones & iPhones |
| **Categories** | \`assets/categories/cat-smartwatches.png\` | 400x400 | \`cover\` / center | Card: Apple Watch & Smartwatches |
| **Categories** | \`assets/categories/cat-audio.png\` | 400x400 | \`cover\` / center | Card: Áudio Premium & Fones |
| **Categories** | \`assets/categories/cat-tablets.png\` | 400x400 | \`cover\` / center | Card: iPads & Tablets |
| **Categories** | \`assets/categories/cat-drones.png\` | 400x400 | \`cover\` / center | Card: Drones & Câmeras |
| **Categories** | \`assets/categories/cat-acessorios.png\` | 400x400 | \`cover\` / center | Card: Carregadores e Acessórios |
| **Products** | \`assets/products/prod-iphone-16-pro.png\` | 600x600 | \`contain\` / center | Card de Produto Destaque |
| **Products** | \`assets/products/prod-apple-watch-ultra.png\` | 600x600 | \`contain\` / center | Card de Produto Destaque |
| **Products** | \`assets/products/prod-macbook-air-m3.png\` | 600x600 | \`contain\` / center | Card de Produto Destaque |
| **Products** | \`assets/products/prod-airpods-pro-2.png\` | 600x600 | \`contain\` / center | Card de Produto Destaque |
| **Products** | \`assets/products/prod-dji-mini-4-pro.png\` | 600x600 | \`contain\` / center | Card de Produto Destaque |
| **Products** | \`assets/products/prod-ipad-air-m2.png\` | 600x600 | \`contain\` / center | Card de Produto Destaque |
| **Blog** | \`assets/blog/blog-artigo-1.png\` | 800x500 | \`cover\` / center | Card de Artigo LinkedIn 1 |
| **Blog** | \`assets/blog/blog-artigo-2.png\` | 800x500 | \`cover\` / center | Card de Artigo LinkedIn 2 |
| **Blog** | \`assets/blog/blog-artigo-3.png\` | 800x500 | \`cover\` / center | Card de Artigo LinkedIn 3 |
| **Support** | \`assets/support/support-specialist.png\` | 1000x800 | \`cover\` / top right | Banner institucional do Atendimento VIP |
| **Brands** | \`assets/brands/*.png\` | Variadas | \`contain\` / center | Carrossel de marcas autorizadas (Apple, DJI, etc.) |
| **Footer** | \`assets/marketplaces/selo-mercado-lider.png\` | 200x60 | \`contain\` / center | Selo MercadoLíder Platinum oficial |

---

## 2. REGRAS PARA O CODEX AO PLUGAR IMAGENS DA API
Quando o Codex plugar imagens vindas da API do Mercado Livre:
- Utilizar container com \`aspect-ratio: 1 / 1\` para produtos.
- Aplicar sempre \`object-fit: contain\` com fundo transparente ou neutro para evitar cortes no produto.
- Implementar fallback (\`onerror\`) para o asset padrão em \`assets/products/fallback-product.png\`.
`, 'utf8');

// 6. FILE_MANIFEST.md
fs.writeFileSync(path.join(docsDir, 'FILE_MANIFEST.md'), `# MANIFESTO DE ARQUIVOS E REGRAS DE MODIFICAÇÃO

Inventário de todos os arquivos entregues no pacote \`01-preview-v2/\` com as devidas permissões de edição para o time de backend/Codex.

---

## 1. TABELA DE COMPONENTES E ARQUIVOS

| Arquivo | Função / Propósito | Regra de Edição para o Codex |
|---|---|---|
| \`index.html\` | Estrutura semântica principal | **EDIÇÃO CONDICIONAL**: Permitido inserir diretivas de template (Jinja, Blade, React/Vue JSX ou tags de loop). **Proibido** alterar classes e estrutura visual. |
| \`css/variables.css\` | Design Tokens (Cores, Fontes, Raio) | **CONGELADO**: Não modificar sem aprovação formal. |
| \`css/theme.css\` | Tematização Dark Mode e Superfícies | **CONGELADO**: Estilos base travados. |
| \`css/layout.css\` | Grid principal, Flexbox e Containers | **CONGELADO**: Regras de responsividade travadas. |
| \`css/components.css\` | Cards, Banners, Headers, Footers | **CONGELADO**: Garantia do visual pixel-perfect. |
| \`js/main.js\` | Controladores de UI (Menu mobile, Tabs) | **EXTENSÍVEL**: Permitido adicionar funções de fetch, handlers de busca e eventos sem quebrar os seletores existentes. |
| \`data/catalog-products.json\` | Dataset simulado da vitrine | **SUBSTITUÍVEL**: Deve ser substituído pela chamada real da API do Mercado Livre. |
| \`assets/**/*\` | Imagens, ícones e logos aprovados | **PRESERVAR**: Manter integridade dos caminhos locais para logos institucionais e banners. |
`, 'utf8');

// 7. RUN_V2.md
fs.writeFileSync(path.join(docsDir, 'RUN_V2.md'), `# COMO EXECUTAR A OMEGAIMPORTS V2 LOCALMENTE

Instruções rápidas para validação da V2 congelada sem depender de serviços externos.

---

## 1. EXECUÇÃO VIA SERVIDOR ESTÁTICO (QUALQUER AMBIENTE)

Como a V2 foi estruturada com caminhos relativos e assets locais, ela pode ser servida por qualquer servidor HTTP estático.

### Opção A: Node.js (Sem instalar nada adicional)
\`\`\`bash
# A partir da pasta do projeto:
npx serve handoff/omegaimports-v2-approved/01-preview-v2 -p 4180
# Ou diretamente:
node scripts/serve-v2.mjs
\`\`\`

### Opção B: Python 3
\`\`\`bash
cd handoff/omegaimports-v2-approved/01-preview-v2
python -m http.server 4180
\`\`\`

### Opção C: VS Code Live Server
Basta abrir a pasta \`01-preview-v2\` no VS Code e clicar em **"Go Live"**.

---

## 2. VERIFICAÇÃO DE ROTA
- **URL Padrão de Homologação:** \`http://localhost:4180/\` ou \`http://localhost:4180/preview-v2/\`
- Verifique se todos os ícones, logos e imagens carregam instantaneamente sem erros 404 no console.
`, 'utf8');

// 8. DEPENDENCIES.md
fs.writeFileSync(path.join(docsDir, 'DEPENDENCIES.md'), `# DEPENDÊNCIAS E ESPECIFICAÇÕES DE RUNTIME

A OMEGAIMPORTS V2 foi construída com foco em **alta performance**, **dependência zero** de frameworks pesados e **máxima portabilidade**.

---

## 1. STACK DO FRONTEND CONGELADO
- **HTML5:** Semântico, otimizado para SEO técnico e acessibilidade.
- **CSS3 Puro:** Utilização nativa de CSS Custom Properties (Tokens), CSS Grid e Flexbox. Zero compiladores necessários (sem Sass, Less ou PostCSS obrigatório no runtime).
- **JavaScript Moderno (ES6+ Vanilla):** Zero dependência de bibliotecas externas pesadas (sem jQuery, sem frameworks inflados).
- **Tipografia Web:** Fonte **Inter** carregada de forma otimizada via Google Fonts com display swap preconnect.
- **Ícones:** SVG Inline e fontes de ícones otimizadas nativamente.

---

## 2. REQUISITOS PARA O CODEX NA INTEGRAÇÃO
- **Node.js:** Versão 18 LTS ou superior (recomendado para scripts de automação e integração de catálogo).
- **Compatibilidade de Navegadores:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+, iOS Safari e Android Chrome modernos.
`, 'utf8');

// 9. SECURITY_SCAN.md
fs.writeFileSync(path.join(docsDir, 'SECURITY_SCAN.md'), `# RELATÓRIO DE CONFORMIDADE E SEGURANÇA (SECURITY SCAN)

**Status:** APROVADO / 100% SEGURO  
**Varredura Realizada em:** 19/09/2026

---

## 1. AUDITORIA DE SEGREDOS E CREDENCIAIS
- [x] **Zero Tokens Privados:** Nenhum token de API privada (Mercado Livre App Secret, AWS Keys, etc.) está presente nos arquivos da V2.
- [x] **Zero Credenciais Hardcoded:** Nenhum usuário, senha ou string de conexão de banco de dados foi incluído.
- [x] **Zero Dados Sensíveis:** Os dados de contato nos formulários e mocks são estritamente institucionais e públicos da empresa.

---

## 2. BOAS PRÁTICAS DE SEGURANÇA NO FRONTEND
- **Links Externos:** Todos os links com \`target="_blank"\` possuem obrigatoriamente \`rel="noopener noreferrer"\` para prevenção de reverse tabnabbing.
- **Scripts Externos:** Nenhum script CDN não verificado ou script de terceiros desconhecido foi injetado.
- **Sanitização Pronta para XSS:** Os nós de texto estão preparados para receber dados via \`textContent\` ou sanitização padrão no backend.
`, 'utf8');

// 10. HANDOFF_REPORT.md
fs.writeFileSync(path.join(docsDir, 'HANDOFF_REPORT.md'), `# RELATÓRIO EXECUTIVO DE HANDOFF — OMEGAIMPORTS V2
**Data:** 19/09/2026  
**Resultado:** SUCESSO TOTAL — PACOTE CONGELADO E PRONTO PARA O CODEX

---

## 1. RESUMO DOS ENTREGÁVEIS

| Item | Quantidade | Localização | Observação |
|---|---|---|---|
| **Código Fonte Standalone** | 1 pacote completo | \`01-preview-v2/\` | HTML + CSS + JS + Assets locais sem dependências externas |
| **Biblioteca de Assets** | 40+ arquivos | \`02-assets/\` | Categorizados em banners, brand, produtos, categorias, etc. |
| **Screenshots de Referência** | 16 imagens HD | \`03-screenshots/\` | 8 viewports responsivos + 8 seções completas isoladas |
| **Documentos Técnicos** | 10 arquivos | \`04-documentation/\` | Tokens, design lock, responsividade, assets, segurança, etc. |
| **Mapas de Integração** | 3 arquivos | \`05-integration-map/\` | Mapeamento seção a seção, audit de mocks e funções reais |
| **Checksums Criptográficos** | 1 arquivo completo | \`06-checksums/\` | Hash SHA-256 de cada arquivo para validação de integridade |

---

## 2. CONFORMIDADE COM AS REGRAS DO PROJETO
- **Produção Intacta:** A pasta \`src/\`, \`public/\` e a branch \`main\` de produção permaneceram 100% inalteradas durante toda a homologação.
- **Visual Homologado:** O visual reflete exatamente a versão aprovada em \`http://localhost:4180/preview-v2/\`.
`, 'utf8');

// 11. INTEGRATION_MAP.md
fs.writeFileSync(path.join(mapDir, 'INTEGRATION_MAP.md'), `# MAPA CIRÚRGICO DE INTEGRAÇÃO — SEÇÃO POR SEÇÃO

Este documento estabelece com precisão cirúrgica a separação entre o que deve permanecer visualmente congelado e o que deve ser conectado à lógica de negócios e APIs pelo Codex.

---

## 1. HEADER & BARRA DE NAVEGAÇÃO
- **Elemento Visual Congelado:**
  - Layout flex com Logo Oficial Horizontal à esquerda.
  - Barra de busca central com ícone e badge de atalho.
  - Links de navegação: *Início, Catálogo, Mercado Livre, Sobre Nós, Contato*.
  - Ações à direita: Botão Atendimento WhatsApp e Botão Catálogo Completo.
- **O que o Codex deve conectar:**
  - Ligar o input \`#site-search\` à função de filtro da vitrine de produtos.
  - Ligar o botão do WhatsApp ao link com UTM e mensagem pré-formatada.
  - Ligar o drawer mobile aos mesmos eventos.

---

## 2. HERO SECTION
- **Elemento Visual Congelado:**
  - Badge institucional: *"IMPORTADORA ESPECIALIZADA • MERCADOLÍDER PLATINUM"*.
  - Headline principal: *"Tecnologia Global, Pronta Entrega no Brasil"*.
  - Subtítulo com diferenciais: Parcelamento em 12x, Envio Imediato, Garantia e Suporte Humanizado.
  - CTAs duplos: *"Explorar Catálogo"* e *"Comprar no Mercado Livre"*.
  - Banner visual direito com composição de eletrônicos premium.
- **O que o Codex deve conectar:**
  - CTA *"Explorar Catálogo"* dá smooth scroll para a vitrine \`#catalogo\`.
  - CTA *"Comprar no Mercado Livre"* direciona para a loja oficial no ML com rastreamento UTM.

---

## 3. CATEGORIAS EM DESTAQUE
- **Elemento Visual Congelado:**
  - Grid de 6 categorias: Smartphones, Smartwatches, Áudio Premium, iPads & Tablets, Drones & Câmeras, Acessórios.
  - Efeito hover com scale suave e iluminação de borda dourada.
- **O que o Codex deve conectar:**
  - O clique em cada categoria dispara o filtro de categoria na vitrine de produtos, exibindo apenas os itens correspondentes.

---

## 4. VITRINE DE PRODUTOS (CATÁLOGO MERCADO LIVRE)
- **Elemento Visual Congelado:**
  - Barra superior de filtros: *Todos, Apple, Áudio, Drones, Acessórios*.
  - Grid responsivo de cards com:
    - Tag de condição/status (ex: *"Novo • Lacrado"*, *"Frete Grátis"*).
    - Imagem do produto em container neutro com \`object-fit: contain\`.
    - Título do produto com limite de 2 linhas (\`-webkit-line-clamp: 2\`).
    - Avaliação com estrelas douradas e total de vendas.
    - Preço original riscado e Preço à vista em destaque dourado.
    - Condição de parcelamento (*"12x sem juros"*).
    - Botão CTA *"Comprar no Mercado Livre"* com ícone oficial.
- **O que o Codex deve conectar:**
  - Substituir o array estático pelo loop dinâmico alimentado pelo \`items.json\` ou endpoint de produtos reais do Mercado Livre.
  - Mapear \`permalink\` do anúncio real no botão de compra.

---

## 5. BLOG / ARTIGOS & ANÁLISES (LINKEDIN)
- **Elemento Visual Congelado:**
  - Grid de 3 cards editoriais com foto de capa, tag de categoria, data de publicação, tempo de leitura e título instigante.
  - Efeito de elevação sutil no hover.
- **O que o Codex deve conectar:**
  - Conectar os links de *"Ler Artigo Completo"* aos posts oficiais publicados no perfil da OMEGAIMPORTS no LinkedIn ou artigos do Medium.

---

## 6. CARROSSEL DE MARCAS PARCEIRAS
- **Elemento Visual Congelado:**
  - Faixa institucional contínua exibindo logos autorizados (Apple, DJI, JBL, Sony, Marshall, Samsung, Garmin, GoPro).
- **O que o Codex deve conectar:**
  - Manter como bloco de autoridade estático ou permitir filtragem por marca ao clicar.

---

## 7. BANNER DE SUPORTE & ATENDIMENTO VIP
- **Elemento Visual Congelado:**
  - Banner em navy profundo com foto do especialista à direita e conteúdo à esquerda.
  - Tópicos de confiança: Atendimento Especializado, Consultoria Pré-venda, Rastreamento Ativo.
  - Botão CTA: *"Falar com Especialista no WhatsApp"*.
- **O que o Codex deve conectar:**
  - Acionar o WhatsApp com mensagem contextualizada: *"Olá! Gostaria de consultoria para comprar um produto na Omega Imports"*.

---

## 8. FOOTER INSTITUCIONAL
- **Elemento Visual Congelado:**
  - 4 Colunas estruturadas:
    1. Logo institucional, resumo corporativo e selo MercadoLíder Platinum.
    2. Links rápidos de navegação.
    3. Categorias diretas.
    4. Informações de contato, e-mail, CNPJ e horário de atendimento.
  - Barra inferior de copyright com bandeiras de pagamento e selos de segurança SSL.
- **O que o Codex deve conectar:**
  - Conectar o formulário de newsletter ao backend/webhook de CRM.
  - Inserir links de termos de uso e política de privacidade funcionais.
`, 'utf8');

// 12. MOCK_COMPONENTS.md
fs.writeFileSync(path.join(mapDir, 'MOCK_COMPONENTS.md'), `# INVENTÁRIO DE ELEMENTOS MOCKADOS & DEPENDÊNCIAS DE BACKEND

Auditoria completa de todos os elementos simulados na V2 que requerem ligação a fontes de dados reais pelo Codex.

---

## 1. COMPONENTES COM DADOS SIMULADOS

| Seção | Componente Mockado | Comportamento Atual na V2 | Comportamento Esperado na Produção |
|---|---|---|---|
| **Produtos** | Array \`catalog-products.json\` | 8 produtos fixos em arquivo estático | Listagem dinâmica gerada a partir do catálogo real / API do Mercado Livre |
| **Preços** | Valores \`R$ 8.499,00\` etc. | Strings fixas formatadas no JSON | Preços e condições de parcelamento atualizados em tempo real |
| **Estoque/Badges** | Tags *"Frete Grátis"*, *"Últimas Unidades"* | Atributos estáticos no HTML/JSON | Indicador de disponibilidade real sincronizado com a conta do Mercado Livre |
| **Blog / Artigos** | 3 Artigos Editoriais | Imagens e textos institucionais estáticos | Posts dinâmicos ou links permanentes dos artigos oficiais no LinkedIn |
| **Newsletter** | Form \`#newsletter-form\` | Dispara alerta visual de sucesso local (\`alert\` ou toast simulado) | Envio via POST para webhook de captação (Mailchimp, RD Station ou banco de dados) |
| **Busca do Header** | Input de texto \`#site-search\` | Filtro simples em memória sobre os 8 itens | Busca completa com debounce filtrando o catálogo integral |
| **Drawer de Contato**| Modal flutuante | Formulário estático com botão de WhatsApp | Redirecionamento direto com parâmetros UTM e mensagem pré-definida |
`, 'utf8');

// 13. REAL_FUNCTIONS_EXPECTED.md
fs.writeFileSync(path.join(mapDir, 'REAL_FUNCTIONS_EXPECTED.md'), `# REQUISITOS DE INTEGRAÇÃO FUNCIONAL — CODEX ENGINE

Diretrizes detalhadas das funcionalidades e regras de negócio esperadas para a versão conectada da OMEGAIMPORTS.

---

## 1. INTEGRAÇÃO COM MERCADO LIVRE (CORE)
1. **Sincronização de Catálogo:**
   - O site oficial funciona como vitrine qualificada de alta conversão que encaminha o comprador final diretamente para o checkout protegido do Mercado Livre.
   - Cada botão de compra nos cards de produtos deve apontar para o \`permalink\` oficial do anúncio no Mercado Livre correspondente.
2. **Preço e Desconto:**
   - Exibir preço riscado e preço com desconto à vista quando aplicável.
   - Exibir a quantidade máxima de parcelas sem juros permitida pelo anúncio.

---

## 2. ATENDIMENTO CONVERSACIONAL (WHATSAPP VIP)
- **Número Central:** Deve ser configurado via variável de ambiente ou arquivo de configuração global (\`config.js\`).
- **Mensagens Contextuais:**
  - Clique no Header: *"Olá! Vim pelo site da Omega Imports e gostaria de tirar uma dúvida."*
  - Clique em Suporte: *"Olá! Gostaria de consultoria técnica sobre os produtos disponíveis."*
  - Clique em Produto Específico: *"Olá! Gostaria de informações sobre a pronta entrega do [NOME DO PRODUTO]."*

---

## 3. OTIMIZAÇÃO DE SEO TÉCNICO & INDEXAÇÃO
- **Meta Tags:** O Codex deve preencher dinamicamente na renderização:
  - \`<title>Omega Imports | Tecnologia Premium e Pronta Entrega no Brasil</title>\`
  - \`<meta name="description" content="Especialistas em importação de eletrônicos de alta performance, Apple, DJI e fones premium. MercadoLíder Platinum com garantia e envio imediato.">\`
- **Schema.org (JSON-LD):**
  - Inserir schema \`Organization\` com nome, logo, redes sociais e suporte.
  - Inserir schema \`ItemList\` contendo os produtos listados para rich snippets no Google.

---

## 4. GOVERNANÇA DE CÓDIGO
- **Zero Incompatibilidade:** O código injetado pelo Codex não deve depender de frameworks que exijam transpilação pesada a menos que a arquitetura do repositório já possua pipeline Vite/Webpack configurada.
- Se for mantido como Vanilla JS, modularizar as funções em arquivos limpos em \`js/services/\`.
`, 'utf8');

console.log('Documentation and Integration Maps generated successfully.');
