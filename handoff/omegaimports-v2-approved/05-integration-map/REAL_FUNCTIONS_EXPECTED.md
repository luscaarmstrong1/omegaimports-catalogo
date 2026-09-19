# REQUISITOS DE INTEGRAÇÃO FUNCIONAL — CODEX ENGINE

Diretrizes detalhadas das funcionalidades e regras de negócio esperadas para a versão conectada da OMEGAIMPORTS.

---

## 1. INTEGRAÇÃO COM MERCADO LIVRE (CORE)
1. **Sincronização de Catálogo:**
   - O site oficial funciona como vitrine qualificada de alta conversão que encaminha o comprador final diretamente para o checkout protegido do Mercado Livre.
   - Cada botão de compra nos cards de produtos deve apontar para o `permalink` oficial do anúncio no Mercado Livre correspondente.
2. **Preço e Desconto:**
   - Exibir preço riscado e preço com desconto à vista quando aplicável.
   - Exibir a quantidade máxima de parcelas sem juros permitida pelo anúncio.

---

## 2. ATENDIMENTO CONVERSACIONAL (WHATSAPP VIP)
- **Número Central:** Deve ser configurado via variável de ambiente ou arquivo de configuração global (`config.js`).
- **Mensagens Contextuais:**
  - Clique no Header: *"Olá! Vim pelo site da Omega Imports e gostaria de tirar uma dúvida."*
  - Clique em Suporte: *"Olá! Gostaria de consultoria técnica sobre os produtos disponíveis."*
  - Clique em Produto Específico: *"Olá! Gostaria de informações sobre a pronta entrega do [NOME DO PRODUTO]."*

---

## 3. OTIMIZAÇÃO DE SEO TÉCNICO & INDEXAÇÃO
- **Meta Tags:** O Codex deve preencher dinamicamente na renderização:
  - `<title>Omega Imports | Tecnologia Premium e Pronta Entrega no Brasil</title>`
  - `<meta name="description" content="Especialistas em importação de eletrônicos de alta performance, Apple, DJI e fones premium. MercadoLíder Platinum com garantia e envio imediato.">`
- **Schema.org (JSON-LD):**
  - Inserir schema `Organization` com nome, logo, redes sociais e suporte.
  - Inserir schema `ItemList` contendo os produtos listados para rich snippets no Google.

---

## 4. GOVERNANÇA DE CÓDIGO
- **Zero Incompatibilidade:** O código injetado pelo Codex não deve depender de frameworks que exijam transpilação pesada a menos que a arquitetura do repositório já possua pipeline Vite/Webpack configurada.
- Se for mantido como Vanilla JS, modularizar as funções em arquivos limpos em `js/services/`.
