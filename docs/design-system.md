# OMEGAIMPORTS Design System

## 1. Visão Geral e Princípios
O Design System da OMEGAIMPORTS estabelece uma linguagem visual técnica, limpa, moderna e orientada à conversão para produtos eletrônicos, IoT, sensores e automação. O objetivo é fornecer clareza máxima para engenheiros, técnicos, makers e integradores, mantendo consistência absoluta entre a Home e todas as páginas internas.

### Princípios Chave:
1. **Clareza Técnica & Respiro:** Superfícies claras e neutras (`--surface-page`, `--surface-card`) para áreas de leitura e conteúdo, intercaladas com blocos escuros de alta tecnologia para heroes e chamadas de ação.
2. **Hero Tecnológico Compartilhado:** Fundo azul-marinho profundo (`--navy-950` / `--navy-900`) com malha de circuito sutil, iluminação radial azul e amarela e render 3D em alta resolução.
3. **Consistência de Cabeçalho e Rodapé:** O cabeçalho (`site-header`) e o rodapé (`footer`) são componentes globais compartilhados, imutáveis entre todas as páginas do site.
4. **Sem Checkouts Falsos:** O site funciona como vitrine técnica conectada aos anúncios oficiais no Mercado Livre e suporte via WhatsApp oficial.

---

## 2. Tokens de Cor (Design Tokens)

| Token | Hex / Valor | Uso |
|---|---|---|
| `--navy-950` | `#030914` | Fundo principal de heroes escuros, topbar e rodapé |
| `--navy-900` | `#071426` | Fundo secundário do cabeçalho e faixas de contraste |
| `--navy-850` | `#0a1a2e` | Bordas e fundos de cartões escuros |
| `--blue-600` | `#0878d1` | Cor primária para links, ícones de destaque e números de passos |
| `--blue-500` | `#1595e8` | Gradientes e estados de foco/hover |
| `--cyan-400` | `#42d7f5` | Acentos luminosos, badges tecnológicos e detalhes de circuitos |
| `--cyan-100` | `#e7fafe` | Fundo sutil de badges e pílulas informativas |
| `--marketplace-yellow` | `#ffe600` | Botões e acentos de destaque para o Mercado Livre |
| `--whatsapp` | `#25d366` | Ações e links de contato direto via WhatsApp oficial |
| `--surface-page` | `#f4f7fb` | Fundo de leitura das páginas internas |
| `--surface-card` | `#ffffff` | Fundo dos cards de conteúdo, acordeões e passos |
| `--text-950` | `#07111f` | Títulos e textos de alta ênfase |
| `--text-700` | `#344054` | Corpo de texto, respostas de FAQ e parágrafos |
| `--text-500` | `#667085` | Subtítulos, metadados e legendas |
| `--border` | `#dce5ee` | Bordas neutras de cartões e inputs |

---

## 3. Tipografia

- **Títulos e Destaques:** `'Manrope', sans-serif`, peso 700 e 800.
- **Corpo de Texto e Controles:** `'Inter', sans-serif`, pesos 400, 500, 600, 700 e 800.
- **Escala de Tamanhos:**
  - Hero Title: `clamp(2.4rem, 5vw, 3.8rem)` com `-0.02em` letter-spacing.
  - Section Title (H2): `clamp(1.85rem, 3.5vw, 2.75rem)` com `-0.01em` letter-spacing.
  - Card Title (H3): `18px` a `20px`, peso 800.
  - Body Text: `15px` a `16.5px`, altura de linha `1.6` a `1.65`.

---

## 4. Componentes Compartilhados

### 4.1. Hero Tecnológico (`.internal-hero`)
- Estrutura com breadcrumb navegável, eyebrow em caixa alta ciano, título com destaque amarelo/azul, descrição técnica, linha de confiança e render 3D lateral de hardware.
- No mobile, adapta-se responsivamente escondendo o render lateral e mantendo o foco nos textos e controles.

### 4.2. Accordion de FAQ (`.faq-accordion-list`, `.faq-item`)
- Implementado com tags semânticas `<details>` e `<summary>`.
- Ícone temático à esquerda em caixa arredondada (`.faq-icon-box`).
- Chevron animado à direita indicando expansão e recolhimento.
- Suporta microdados estruturados `FAQPage` via JSON-LD para indexação rica no Google.

### 4.3. Grade de Cards Informativos (`.info-card-grid`, `.info-card`)
- Cards com cantos arredondados (`20px`), elevação sutil e hover tridimensional.
- Cabeçalho com ícone contrastante escuro e badge numérico ou temático.

### 4.4. Passos Horizontais (`.steps-row`, `.step-card`)
- Grade de 4 colunas no desktop, 2 colunas no tablet e 1 coluna no mobile.
- Badge circular com número da etapa no topo esquerdo e ícone circular em destaque.

### 4.5. Cartões de Confiança (`.trust-cards-row`, `.trust-card`)
- Exibição de garantias de compra, segurança Mercado Pago, logística rápida e suporte técnico.

### 4.6. Banner de Suporte VIP (`.internal-support-banner`)
- Faixa dark estilizada presente no fechamento de todas as páginas institucionais.
- Ação dupla: botão direto para WhatsApp oficial e botão secundário para a loja oficial do Mercado Livre.
- Imagem de especialista técnico devidamente integrada à composição.
