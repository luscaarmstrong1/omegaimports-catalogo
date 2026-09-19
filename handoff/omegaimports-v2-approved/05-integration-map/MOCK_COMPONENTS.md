# INVENTÁRIO DE ELEMENTOS MOCKADOS & DEPENDÊNCIAS DE BACKEND

Auditoria completa de todos os elementos simulados na V2 que requerem ligação a fontes de dados reais pelo Codex.

---

## 1. COMPONENTES COM DADOS SIMULADOS

| Seção | Componente Mockado | Comportamento Atual na V2 | Comportamento Esperado na Produção |
|---|---|---|---|
| **Produtos** | Array `catalog-products.json` | 8 produtos fixos em arquivo estático | Listagem dinâmica gerada a partir do catálogo real / API do Mercado Livre |
| **Preços** | Valores `R$ 8.499,00` etc. | Strings fixas formatadas no JSON | Preços e condições de parcelamento atualizados em tempo real |
| **Estoque/Badges** | Tags *"Frete Grátis"*, *"Últimas Unidades"* | Atributos estáticos no HTML/JSON | Indicador de disponibilidade real sincronizado com a conta do Mercado Livre |
| **Blog / Artigos** | 3 Artigos Editoriais | Imagens e textos institucionais estáticos | Posts dinâmicos ou links permanentes dos artigos oficiais no LinkedIn |
| **Newsletter** | Form `#newsletter-form` | Dispara alerta visual de sucesso local (`alert` ou toast simulado) | Envio via POST para webhook de captação (Mailchimp, RD Station ou banco de dados) |
| **Busca do Header** | Input de texto `#site-search` | Filtro simples em memória sobre os 8 itens | Busca completa com debounce filtrando o catálogo integral |
| **Drawer de Contato**| Modal flutuante | Formulário estático com botão de WhatsApp | Redirecionamento direto com parâmetros UTM e mensagem pré-definida |
