# DICIONÁRIO DE DESIGN TOKENS — OMEGAIMPORTS V2

Documentação de todos os tokens CSS ativos definidos em `01-preview-v2/css/variables.css` e `theme.css`.

---

## 1. CORES DA MARCA (BRAND COLORS)

| Token CSS | Valor HEX / HSL | Uso Principal |
|---|---|---|
| `--oi-brand-navy-dark` | `#050B14` | Fundo principal da página (Ultra Dark) |
| `--oi-brand-navy` | `#0A1120` | Fundo de containers, cards e painéis |
| `--oi-brand-navy-light` | `#131F37` | Hover de cards, bordas ativas, superfícies secundárias |
| `--oi-brand-gold` | `#F59E0B` | Destaques de conversão, estrelas, badges premium |
| `--oi-brand-gold-glow` | `rgba(245, 158, 11, 0.25)` | Sombras iluminadas em CTAs e chips selecionados |
| `--oi-brand-blue-accent` | `#2563EB` | Acento tecnológico, links secundários |
| `--oi-brand-green-accent`| `#10B981` | Badges de frete grátis, estoque e garantia |

---

## 2. CORES DE TEXTO & NEUTROS

| Token CSS | Valor | Uso |
|---|---|---|
| `--oi-text-primary` | `#FFFFFF` | Títulos principais, valores de destaque, botões |
| `--oi-text-secondary` | `#94A3B8` | Subtítulos, labels secundárias, metadados |
| `--oi-text-muted` | `#64748B` | Textos de apoio, placeholders, borders sutis |
| `--oi-border-subtle` | `rgba(255, 255, 255, 0.08)` | Divisórias e bordas padrão de cards |
| `--oi-border-highlight` | `rgba(245, 158, 11, 0.35)` | Bordas de cards em foco ou destaque |

---

## 3. TIPOGRAFIA

- **Família de Fontes:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Escala de Tamanhos:**
  - H1 (Hero Title): `clamp(2.25rem, 5vw, 3.5rem)` | Peso: `800` (Extra Bold)
  - H2 (Section Titles): `clamp(1.75rem, 3.5vw, 2.5rem)` | Peso: `700` (Bold)
  - H3 (Card Titles): `1.125rem (18px)` | Peso: `600` (Semi Bold)
  - Body / Paragraph: `0.9375rem (15px)` | Altura de linha: `1.6`
  - Price Tag: `1.5rem (24px)` | Peso: `800`
  - Badges / Small: `0.75rem (12px)` | Peso: `600`

---

## 4. BORDAS, ELEVAÇÃO & SOMBRAS

- **Border Radius:**
  - Badges & Chips: `9999px` (Full Pill)
  - Cards de Categoria / Produto: `16px`
  - Banners Hero & Suporte: `24px`
  - Inputs & Botões Primários: `12px`
- **Box Shadows:**
  - Card Default: `0 10px 30px -10px rgba(0, 0, 0, 0.5)`
  - Card Hover: `0 20px 40px -15px rgba(245, 158, 11, 0.15)`
  - Glow Primário: `0 0 25px rgba(245, 158, 11, 0.35)`
