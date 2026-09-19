# COMPORTAMENTO RESPONSIVO — ESPECIFICAÇÃO DE BREAKPOINTS

A OMEGAIMPORTS V2 é construída com abordagem Mobile-First complementada por breakpoints cirúrgicos em CSS Grid e Flexbox.

---

## 1. MATRIZ DE BREAKPOINTS HOMOLOGADOS

| Breakpoint | Dispositivo de Referência | Comportamento de Layout |
|---|---|---|
| **1920px** | Desktop Full HD / Ultrawide | Container max-width de 1380px centralizado. Header com navegação completa, Hero 2 colunas amplas, Produtos em grid de 4 colunas. |
| **1672px** | Desktop Grande | Adaptação fluida dos paddings laterais (`padding: 0 40px`). Sem quebras visuais. |
| **1440px** | Laptop Pro / Desktop Médio | Grid de produtos permanece 4 colunas; badges e banners mantêm proporção 16:9 ou 21:9. |
| **1024px** | iPad Pro / Tablet Paisagem | Grid de produtos reduz para 3 colunas. Menu de navegação superior comprime espaçamentos; busca do header mantém expansão. |
| **768px** | Tablet Retrato / Telas Pequenas | Grid de produtos ajusta para 2 colunas. Hero colapsa para visual em pilha (stack vertical) com imagem no topo e texto embaixo. |
| **430px** | iPhone Pro Max / Samsung Ultra | Menu hambúrguer ativo no topo. Grid de produtos 1 ou 2 colunas otimizadas com scroll horizontal no carrossel de categorias. |
| **390px** | iPhone 12 / 13 / 14 / 15 | Padding de container de 16px. Botões ocupam 100% de largura quando em CTA único. Header compacto. |
| **375px** | iPhone SE / Telas Ultra Compactas | Tipografia em escala adaptada (`clamp`), garantindo que nenhum texto estoure ou gere scroll horizontal (`overflow-x: hidden`). |

---

## 2. REGRAS CRÍTICAS DE PRESERVAÇÃO RESPONSIVA
1. **Overflow Horizontal Zero:** O elemento `html, body` possui controle estrito contra scroll horizontal indesejado.
2. **Touch Targets:** Em viewports mobile (≤ 768px), todos os botões e links de navegação mantêm altura mínima de 44px.
3. **Drawer Lateral:** No mobile, o botão do menu abre o painel lateral com navegação estruturada e botão direto para WhatsApp.
