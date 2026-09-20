# Mapa de Rotas e Páginas — OMEGAIMPORTS

## 1. Estrutura Canônica de URLs

| Rota | Tipo | Arquivo Gerado | Título Oficial | Propósito Principal |
|---|---|---|---|---|
| `/` | Principal | `dist/index.html` | Componentes eletrônicos, IoT e automação | Vitrine curada, busca rápida, categorias e produtos em destaque |
| `/produtos/` | Catálogo | `dist/produtos/index.html` | Produtos | Catálogo completo com busca e filtros por categoria, família, condição e preço |
| `/produtos/<slug>/` | Detalhe | `dist/produtos/<slug>/index.html` | `<Título do Produto>` | Especificações completas, fotos reais, link para Mercado Livre e WhatsApp |
| `/categorias/` | Taxonomia | `dist/categorias/index.html` | Categorias de Componentes | Organização visual e técnica dos segmentos do catálogo |
| `/categorias/<slug>/` | Segmento | `dist/categorias/<slug>/index.html` | `<Nome da Categoria>` | Produtos filtrados por categoria com descrição técnica |
| `/blog/` | Editorial | `dist/blog/index.html` | Blog OMEGAIMPORTS | Artigos técnicos, guias e estudos de caso de IoT e telemetria |
| `/blog/<slug>/` | Artigo | `dist/blog/<slug>/index.html` | `<Título do Artigo>` | Leitura aprofundada com sumário, fontes LinkedIn e produtos relacionados |
| `/duvidas-frequentes/` | Suporte | `dist/duvidas-frequentes/index.html` | Dúvidas frequentes | Accordion interativo com 6 perguntas essenciais sobre compra e frete |
| `/politica-de-privacidade/` | Legal | `dist/politica-de-privacidade/index.html` | Política de privacidade | Esclarecimentos de privacidade, cookies, LGPD e dados |
| `/termos-de-uso/` | Legal | `dist/termos-de-uso/index.html` | Termos de uso | Regras da vitrine, limites e vínculo com o Mercado Livre |
| `/como-comprar/` | Guia | `dist/como-comprar/index.html` | Como comprar | Passo a passo em 4 etapas para compra segura no Mercado Livre |
| `/sobre/` | Institucional | `dist/sobre/index.html` | Sobre a OMEGAIMPORTS | História, credibilidade técnica, números e fluxo de oportunidade |
| `/contato/` | Atendimento | `dist/contato/index.html` | Contato | Canais oficiais (WhatsApp, Mercado Livre, LinkedIn) |

---

## 2. Redirecionamentos de Legado Mantidos

As seguintes rotas antigas possuem páginas com meta-refresh e link canônico para preservar SEO e links antigos:
- `/familias/` → Redireciona para `/produtos/`
- `/aplicacoes/` → Redireciona para `/produtos/`
- `/guias/` → Redireciona para `/blog/`
