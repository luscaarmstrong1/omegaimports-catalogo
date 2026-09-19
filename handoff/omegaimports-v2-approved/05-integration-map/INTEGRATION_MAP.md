# MAPA CIRÚRGICO DE INTEGRAÇÃO — SEÇÃO POR SEÇÃO

Este documento estabelece com precisão cirúrgica a separação entre o que deve permanecer visualmente congelado e o que deve ser conectado à lógica de negócios e APIs pelo Codex.

---

## 1. HEADER & BARRA DE NAVEGAÇÃO
- **Elemento Visual Congelado:**
  - Layout flex com Logo Oficial Horizontal à esquerda.
  - Barra de busca central com ícone e badge de atalho.
  - Links de navegação: *Início, Catálogo, Mercado Livre, Sobre Nós, Contato*.
  - Ações à direita: Botão Atendimento WhatsApp e Botão Catálogo Completo.
- **O que o Codex deve conectar:**
  - Ligar o input `#site-search` à função de filtro da vitrine de produtos.
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
  - CTA *"Explorar Catálogo"* dá smooth scroll para a vitrine `#catalogo`.
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
    - Imagem do produto em container neutro com `object-fit: contain`.
    - Título do produto com limite de 2 linhas (`-webkit-line-clamp: 2`).
    - Avaliação com estrelas douradas e total de vendas.
    - Preço original riscado e Preço à vista em destaque dourado.
    - Condição de parcelamento (*"12x sem juros"*).
    - Botão CTA *"Comprar no Mercado Livre"* com ícone oficial.
- **O que o Codex deve conectar:**
  - Substituir o array estático pelo loop dinâmico alimentado pelo `items.json` ou endpoint de produtos reais do Mercado Livre.
  - Mapear `permalink` do anúncio real no botão de compra.

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
