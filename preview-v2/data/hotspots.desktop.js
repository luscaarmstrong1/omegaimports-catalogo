/**
 * OMEGAIMPORTS V3 MASTER — HOTSPOTS COORDINATES (DESKTOP)
 * Coordenadas percentuais precisas calculadas a partir das dimensões nativas
 * de cada imagem Master de seção.
 */

export const desktopHotspots = {
  // MASTER 01: Header, Hero, Trust Strip (2141 x 734)
  hero: [
    // Header Links
    { name: 'nav-produtos', type: 'link', href: '#produtos', left: 24.5, top: 4.2, width: 5.5, height: 4.8, label: 'Produtos' },
    { name: 'nav-categorias', type: 'link', href: '#categorias', left: 30.5, top: 4.2, width: 6.5, height: 4.8, label: 'Categorias' },
    { name: 'nav-marcas', type: 'link', href: '#marcas', left: 37.5, top: 4.2, width: 5.0, height: 4.8, label: 'Marcas' },
    { name: 'nav-blog', type: 'link', href: '#blog', left: 43.0, top: 4.2, width: 4.2, height: 4.8, label: 'Blog' },
    { name: 'nav-sobre', type: 'link', href: '#sobre', left: 47.8, top: 4.2, width: 4.5, height: 4.8, label: 'Sobre' },
    { name: 'nav-como-comprar', type: 'link', href: '#como-comprar', left: 52.8, top: 4.2, width: 7.8, height: 4.8, label: 'Como comprar' },
    
    // Header Actions
    { name: 'header-search', type: 'search', left: 61.5, top: 3.5, width: 23.5, height: 5.8, label: 'Buscar produtos' },
    { name: 'header-account', type: 'action', action: 'account', left: 86.0, top: 3.5, width: 8.0, height: 5.8, label: 'Minha conta' },
    { name: 'header-cart', type: 'action', action: 'cart', left: 94.5, top: 3.5, width: 4.5, height: 5.8, label: 'Carrinho de compras' },
    
    // Hero Search & CTAs
    { name: 'hero-search', type: 'search', left: 5.5, top: 52.0, width: 30.5, height: 7.5, label: 'Busque por produtos no catálogo' },
    { name: 'hero-cta-catalog', type: 'link', href: '#produtos', left: 5.5, top: 62.5, width: 14.5, height: 7.2, label: 'Explorar catálogo' },
    { name: 'hero-cta-whatsapp', type: 'whatsapp', href: 'https://wa.me/5535999528858', left: 20.8, top: 62.5, width: 15.2, height: 7.2, label: 'Falar com especialista no WhatsApp' },
    
    // Trust Strip Links/Info (horizontal click areas)
    { name: 'trust-frete', type: 'info', left: 5.0, top: 88.0, width: 15.0, height: 11.0, label: 'Entrega para todo o Brasil com rastreamento' },
    { name: 'trust-seguranca', type: 'info', left: 20.5, top: 88.0, width: 15.0, height: 11.0, label: 'Compra segura e dados protegidos' },
    { name: 'trust-pagamento', type: 'info', left: 36.0, top: 88.0, width: 15.0, height: 11.0, label: 'Até 12x no cartão ou PIX com desconto' },
    { name: 'trust-suporte', type: 'link', href: 'https://wa.me/5535999528858', left: 51.5, top: 88.0, width: 15.0, height: 11.0, label: 'Suporte técnico com especialistas' },
    { name: 'trust-clientes', type: 'info', left: 67.0, top: 88.0, width: 15.0, height: 11.0, label: 'Mais de 15 mil clientes e projetos' },
    { name: 'trust-garantia', type: 'info', left: 82.5, top: 88.0, width: 15.0, height: 11.0, label: 'Qualidade garantida ou seu dinheiro de volta' }
  ],

  // MASTER 02: Categorias & Banners (1912 x 822)
  categories: [
    { name: 'cat-all', type: 'link', href: '#produtos', left: 80.5, top: 4.8, width: 14.5, height: 5.5, label: 'Ver todas as categorias' },
    
    // 8 Categorias Cards (4x2)
    { name: 'cat-card-1', type: 'category', left: 5.0, top: 13.5, width: 21.5, height: 13.5, label: 'Módulos IoT' },
    { name: 'cat-card-2', type: 'category', left: 27.5, top: 13.5, width: 21.5, height: 13.5, label: 'Sensores' },
    { name: 'cat-card-3', type: 'category', left: 50.0, top: 13.5, width: 21.5, height: 13.5, label: 'Fontes e Alimentação' },
    { name: 'cat-card-4', type: 'category', left: 72.5, top: 13.5, width: 22.5, height: 13.5, label: 'Relés e Acionamento' },
    
    { name: 'cat-card-5', type: 'category', left: 5.0, top: 29.5, width: 21.5, height: 13.5, label: 'Módulos de Comunicação' },
    { name: 'cat-card-6', type: 'category', left: 27.5, top: 29.5, width: 21.5, height: 13.5, label: 'Displays e Interfaces' },
    { name: 'cat-card-7', type: 'category', left: 50.0, top: 29.5, width: 21.5, height: 13.5, label: 'Componentes Passivos' },
    { name: 'cat-card-8', type: 'category', left: 72.5, top: 29.5, width: 22.5, height: 13.5, label: 'Cabos e Conectores' },
    
    // Banners
    { name: 'banner-kits-cta', type: 'link', href: '#produtos', left: 5.0, top: 51.0, width: 43.5, height: 42.0, label: 'Banner Kits de Prototipagem' },
    { name: 'banner-robot-cta', type: 'link', href: '#produtos', left: 51.5, top: 51.0, width: 43.5, height: 42.0, label: 'Banner Prototipagem Sem Limites' }
  ],

  // MASTER 03: Produtos & Ajuda/FAQ (1969 x 799)
  products: [
    { name: 'prod-all', type: 'link', href: '#produtos', left: 82.0, top: 4.5, width: 13.5, height: 5.0, label: 'Ver todos os produtos' },
    
    // 6 Produtos Cards
    { name: 'prod-card-1', type: 'product', prodId: 1, left: 5.0, top: 13.0, width: 14.2, height: 53.0, label: 'Kit ESP32 SIM800L' },
    { name: 'prod-card-2', type: 'product', prodId: 2, left: 20.2, top: 13.0, width: 14.2, height: 53.0, label: 'Sensor SCT-013' },
    { name: 'prod-card-3', type: 'product', prodId: 3, left: 35.5, top: 13.0, width: 14.2, height: 53.0, label: 'Hi-Link HLK-PM01' },
    { name: 'prod-card-4', type: 'product', prodId: 4, left: 50.8, top: 13.0, width: 14.2, height: 53.0, label: 'Display OLED 0.96' },
    { name: 'prod-card-5', type: 'product', prodId: 5, left: 66.0, top: 13.0, width: 14.2, height: 53.0, label: 'Módulo GPS NEO-6M' },
    { name: 'prod-card-6', type: 'product', prodId: 6, left: 81.2, top: 13.0, width: 14.2, height: 53.0, label: 'Relé SSR-25DA' },

    // Add to Cart buttons inside cards
    { name: 'prod-cart-1', type: 'add-cart', prodId: 1, left: 15.0, top: 59.0, width: 3.5, height: 5.5, label: 'Adicionar Kit ESP32 ao carrinho' },
    { name: 'prod-cart-2', type: 'add-cart', prodId: 2, left: 30.2, top: 59.0, width: 3.5, height: 5.5, label: 'Adicionar Sensor SCT ao carrinho' },
    { name: 'prod-cart-3', type: 'add-cart', prodId: 3, left: 45.5, top: 59.0, width: 3.5, height: 5.5, label: 'Adicionar Hi-Link ao carrinho' },
    { name: 'prod-cart-4', type: 'add-cart', prodId: 4, left: 60.8, top: 59.0, width: 3.5, height: 5.5, label: 'Adicionar OLED ao carrinho' },
    { name: 'prod-cart-5', type: 'add-cart', prodId: 5, left: 76.0, top: 59.0, width: 3.5, height: 5.5, label: 'Adicionar GPS ao carrinho' },
    { name: 'prod-cart-6', type: 'add-cart', prodId: 6, left: 91.2, top: 59.0, width: 3.5, height: 5.5, label: 'Adicionar Relé ao carrinho' },

    // Help Blocks
    { name: 'help-specialist', type: 'whatsapp', href: 'https://wa.me/5535999528858', left: 5.0, top: 73.0, width: 43.5, height: 21.0, label: 'Falar com especialista sobre projeto específico' },
    { name: 'help-faq', type: 'link', href: '#faq', left: 51.5, top: 73.0, width: 43.5, height: 21.0, label: 'Acessar FAQ Dúvidas frequentes' }
  ],

  // MASTER 04: Blog, Newsletter & Marcas (2170 x 522 - recortado não destrutivo)
  content: [
    { name: 'blog-all', type: 'link', href: '#blog', left: 83.5, top: 6.0, width: 12.0, height: 6.5, label: 'Ver todos os artigos' },
    
    // 4 Artigos
    { name: 'blog-article-1', type: 'article', left: 5.0, top: 16.5, width: 17.5, height: 56.0, label: 'Artigo ESP32 Iniciantes' },
    { name: 'blog-article-2', type: 'article', left: 23.5, top: 16.5, width: 17.5, height: 56.0, label: 'Artigo Sensores de Corrente' },
    { name: 'blog-article-3', type: 'article', left: 42.0, top: 16.5, width: 17.5, height: 56.0, label: 'Artigo Fontes Hi-Link' },
    { name: 'blog-article-4', type: 'article', left: 60.5, top: 16.5, width: 17.5, height: 56.0, label: 'Artigo Módulo GPS NEO-6M' },
    
    // Newsletter Box
    { name: 'newsletter-box', type: 'newsletter', left: 79.0, top: 16.5, width: 16.5, height: 56.0, label: 'Receber novidades e ofertas por e-mail' },

    // Marcas Row
    { name: 'brands-all', type: 'link', href: '#marcas', left: 83.5, top: 78.5, width: 12.0, height: 6.0, label: 'Ver todas as marcas' },
    { name: 'brands-row', type: 'info', left: 5.0, top: 85.0, width: 90.0, height: 13.0, label: 'Fabricantes parceiros oficiais' }
  ],

  // MASTER 05: Suporte Técnico, Trust Strip 2 & Rodapé (1823 x 863)
  footer: [
    // Suporte CTAs
    { name: 'support-whatsapp', type: 'whatsapp', href: 'https://wa.me/5535999528858', left: 5.0, top: 22.5, width: 13.5, height: 6.5, label: 'Falar no WhatsApp com suporte' },
    { name: 'support-catalog', type: 'link', href: '#produtos', left: 19.5, top: 22.5, width: 13.5, height: 6.5, label: 'Explorar catálogo de componentes' },

    // Trust Strip 2
    { name: 'trust2-frete', type: 'info', left: 5.0, top: 43.5, width: 15.0, height: 8.5, label: 'Entrega para todo o Brasil' },
    { name: 'trust2-seguranca', type: 'info', left: 20.5, top: 43.5, width: 15.0, height: 8.5, label: 'Compra segura' },
    { name: 'trust2-pagamento', type: 'info', left: 36.0, top: 43.5, width: 15.0, height: 8.5, label: 'Até 12x no cartão' },
    { name: 'trust2-suporte', type: 'link', href: 'https://wa.me/5535999528858', left: 51.5, top: 43.5, width: 15.0, height: 8.5, label: 'Suporte técnico' },
    { name: 'trust2-clientes', type: 'info', left: 67.0, top: 43.5, width: 15.0, height: 8.5, label: 'Mais de 15 mil clientes' },
    { name: 'trust2-garantia', type: 'info', left: 82.5, top: 43.5, width: 15.0, height: 8.5, label: 'Qualidade garantida' },

    // Footer Social & Links
    { name: 'footer-instagram', type: 'social', href: '#', left: 5.0, top: 68.0, width: 2.2, height: 4.5, label: 'Instagram OMEGAIMPORTS' },
    { name: 'footer-youtube', type: 'social', href: '#', left: 7.8, top: 68.0, width: 2.2, height: 4.5, label: 'YouTube OMEGAIMPORTS' },
    { name: 'footer-linkedin', type: 'social', href: 'https://www.linkedin.com/company/omegaimports/', left: 10.6, top: 68.0, width: 2.2, height: 4.5, label: 'LinkedIn OMEGAIMPORTS' },
    { name: 'footer-facebook', type: 'social', href: '#', left: 13.4, top: 68.0, width: 2.2, height: 4.5, label: 'Facebook OMEGAIMPORTS' },

    // Footer Marketplace & Security
    { name: 'footer-mercadolivre', type: 'link', href: 'https://lista.mercadolivre.com.br/_CustId_260341774', left: 47.0, top: 88.0, width: 16.0, height: 6.0, label: 'Loja Oficial Mercado Livre' },
    { name: 'footer-privacy', type: 'link', href: '#', left: 70.0, top: 95.5, width: 7.5, height: 3.5, label: 'Privacidade' },
    { name: 'footer-terms', type: 'link', href: '#', left: 78.5, top: 95.5, width: 9.0, height: 3.5, label: 'Termos de uso' }
  ]
};
