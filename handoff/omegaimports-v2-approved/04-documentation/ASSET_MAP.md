# MAPA OFICIAL DE ASSETS VISUAIS (V2 FROZEN)

Todos os assets foram normalizados e alocados localmente em `01-preview-v2/assets/` e arquivados em `02-assets/`.

---

## 1. TABELA DE MAPEAMENTO DE IMAGENS

| Categoria | Caminho Local | Dimensão Aprox. | Object-Fit / Position | Função Visual |
|---|---|---|---|---|
| **Brand** | `assets/brand/omegaimports-logo-horizontal.png` | 340x80 | `contain` / center | Logo oficial do Header (máxima legibilidade) |
| **Brand** | `assets/brand/omegaimports-logo-footer.png` | 280x70 | `contain` / left | Logo oficial do Footer com tom contrastante |
| **Hero** | `assets/hero/hero-banner-main.png` | 1200x800 | `cover` / center | Composição de produtos premium do Hero |
| **Categories** | `assets/categories/cat-smartphones.png` | 400x400 | `cover` / center | Card: Smartphones & iPhones |
| **Categories** | `assets/categories/cat-smartwatches.png` | 400x400 | `cover` / center | Card: Apple Watch & Smartwatches |
| **Categories** | `assets/categories/cat-audio.png` | 400x400 | `cover` / center | Card: Áudio Premium & Fones |
| **Categories** | `assets/categories/cat-tablets.png` | 400x400 | `cover` / center | Card: iPads & Tablets |
| **Categories** | `assets/categories/cat-drones.png` | 400x400 | `cover` / center | Card: Drones & Câmeras |
| **Categories** | `assets/categories/cat-acessorios.png` | 400x400 | `cover` / center | Card: Carregadores e Acessórios |
| **Products** | `assets/products/prod-iphone-16-pro.png` | 600x600 | `contain` / center | Card de Produto Destaque |
| **Products** | `assets/products/prod-apple-watch-ultra.png` | 600x600 | `contain` / center | Card de Produto Destaque |
| **Products** | `assets/products/prod-macbook-air-m3.png` | 600x600 | `contain` / center | Card de Produto Destaque |
| **Products** | `assets/products/prod-airpods-pro-2.png` | 600x600 | `contain` / center | Card de Produto Destaque |
| **Products** | `assets/products/prod-dji-mini-4-pro.png` | 600x600 | `contain` / center | Card de Produto Destaque |
| **Products** | `assets/products/prod-ipad-air-m2.png` | 600x600 | `contain` / center | Card de Produto Destaque |
| **Blog** | `assets/blog/blog-artigo-1.png` | 800x500 | `cover` / center | Card de Artigo LinkedIn 1 |
| **Blog** | `assets/blog/blog-artigo-2.png` | 800x500 | `cover` / center | Card de Artigo LinkedIn 2 |
| **Blog** | `assets/blog/blog-artigo-3.png` | 800x500 | `cover` / center | Card de Artigo LinkedIn 3 |
| **Support** | `assets/support/support-specialist.png` | 1000x800 | `cover` / top right | Banner institucional do Atendimento VIP |
| **Brands** | `assets/brands/*.png` | Variadas | `contain` / center | Carrossel de marcas autorizadas (Apple, DJI, etc.) |
| **Footer** | `assets/marketplaces/selo-mercado-lider.png` | 200x60 | `contain` / center | Selo MercadoLíder Platinum oficial |

---

## 2. REGRAS PARA O CODEX AO PLUGAR IMAGENS DA API
Quando o Codex plugar imagens vindas da API do Mercado Livre:
- Utilizar container com `aspect-ratio: 1 / 1` para produtos.
- Aplicar sempre `object-fit: contain` com fundo transparente ou neutro para evitar cortes no produto.
- Implementar fallback (`onerror`) para o asset padrão em `assets/products/fallback-product.png`.
