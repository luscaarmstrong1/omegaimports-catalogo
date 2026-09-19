# HANDOFF TÉCNICO OFICIAL — OMEGAIMPORTS V2 APROVADA
**Data de Congelamento:** 19/09/2026  
**Status do Design:** APROVADO / FROZEN (Zero modificações visuais permitidas)  
**Destinatário:** CODEX / Engenharia de Software  
**Emissor:** Antigravity (Design System & Frontend Validation)

---

## 1. DIRETRIZ ABSOLUTA: NOVO FRONT + MOTOR ANTIGO

> ⚠️ **LEI SUPREMA DESTE HANDOFF:**
> 1. **PRESERVE RIGOROSAMENTE A CAMADA VISUAL:** O HTML, CSS, hierarquia de classes, proporções, espaçamentos, tipografia e assets visuais contidos em `01-preview-v2` representam a versão **100% aprovada pelo cliente**. É **terminantemente proibido** redesign, refatoração estética, simplificação de regras visuais ou troca arbitrária de classes CSS.
> 2. **SUBSTITUA APENAS A ORIGEM DOS DADOS:** A V2 aprovada utiliza dados estáticos/mockados (`data/catalog-products.json`, banners estáticos, textos de exemplo). O papel do Codex é transformar estes elementos em nós dinâmicos alimentados pela API do Mercado Livre, catálogo real, feed do LinkedIn e rotas funcionais.
> 3. **PROIBIDO USAR SCREENSHOTS COMO FUNDO:** A pasta `03-screenshots` serve **exclusivamente** para validação visual humana e regressão visual automatizada. O site já é 100% construído em HTML semântico, CSS moderno e JS nativo.

---

## 2. ESTRUTURA DO PACOTE DE HANDOFF

```
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
```

---

## 3. CHECKLIST DE INTEGRAÇÃO PARA O CODEX

- [ ] **Catalog Injection:** Conectar `data/catalog-products.json` à listagem real do Mercado Livre (mantendo estrutura do card: tags, preço, parcelamento, badges).
- [ ] **Search & Filtering:** Tornar o input de busca do header e os chips de categoria funcionais para filtrar os produtos em tempo real.
- [ ] **WhatsApp & Contact Drawer:** Configurar o número oficial da OMEGAIMPORTS no drawer de contato rápido e botão flutuante.
- [ ] **LinkedIn Feed / Blog:** Conectar a seção de Artigos & Análises ao feed ou CMS do LinkedIn, mantendo a diagramação dos 3 cards.
- [ ] **Newsletter Subscription:** Conectar o form do footer/newsletter ao webhook ou serviço de captura de leads.
- [ ] **SEO & Metadata:** Injetar Open Graph, Twitter Cards, JSON-LD Schema.org (Organization, WebSite, ItemList).
- [ ] **Performance & Web Vitals:** Manter as tags de `loading="lazy"`, `decoding="async"`, e as dimensões explícitas para garantir LCP e CLS ideais.
