# MANIFESTO DE ARQUIVOS E REGRAS DE MODIFICAÇÃO

Inventário de todos os arquivos entregues no pacote `01-preview-v2/` com as devidas permissões de edição para o time de backend/Codex.

---

## 1. TABELA DE COMPONENTES E ARQUIVOS

| Arquivo | Função / Propósito | Regra de Edição para o Codex |
|---|---|---|
| `index.html` | Estrutura semântica principal | **EDIÇÃO CONDICIONAL**: Permitido inserir diretivas de template (Jinja, Blade, React/Vue JSX ou tags de loop). **Proibido** alterar classes e estrutura visual. |
| `css/variables.css` | Design Tokens (Cores, Fontes, Raio) | **CONGELADO**: Não modificar sem aprovação formal. |
| `css/theme.css` | Tematização Dark Mode e Superfícies | **CONGELADO**: Estilos base travados. |
| `css/layout.css` | Grid principal, Flexbox e Containers | **CONGELADO**: Regras de responsividade travadas. |
| `css/components.css` | Cards, Banners, Headers, Footers | **CONGELADO**: Garantia do visual pixel-perfect. |
| `js/main.js` | Controladores de UI (Menu mobile, Tabs) | **EXTENSÍVEL**: Permitido adicionar funções de fetch, handlers de busca e eventos sem quebrar os seletores existentes. |
| `data/catalog-products.json` | Dataset simulado da vitrine | **SUBSTITUÍVEL**: Deve ser substituído pela chamada real da API do Mercado Livre. |
| `assets/**/*` | Imagens, ícones e logos aprovados | **PRESERVAR**: Manter integridade dos caminhos locais para logos institucionais e banners. |
