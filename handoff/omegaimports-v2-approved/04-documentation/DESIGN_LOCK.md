# TERMO DE CONGELAMENTO VISUAL — DESIGN LOCK
**Versão:** OMEGAIMPORTS V2 APPROVED (19/09/2026)  
**Nível de Rigidez:** MÁXIMO / CRÍTICO

---

## 1. ESCOPO DO CONGELAMENTO
A camada de apresentação visual da OMEGAIMPORTS V2 foi rigorosamente testada, alinhada e formalmente aprovada.  
Nenhuma modificação estética pode ser realizada sem solicitação expressa do cliente.

### O QUE ESTÁ TERMINANTEMENTE PROIBIDO:
1. **Redesign de Componentes:** Não altere a disposição geométrica do Header, Hero, Grid de Categorias, Cards de Produtos, Bloco de Blog, Banners Institucionais, Suporte ou Footer.
2. **Substituição de Classes CSS:** Não renomeie nem remova classes utilitárias ou de componentes (`.oi-*`, `.header-*`, `.product-card`, etc.).
3. **Alteração de Tokens:** Não modifique valores da paleta (`--oi-brand-navy`, `--oi-brand-gold`, gradientes), tipografia (`Inter`, pesos 400-800) ou curvaturas (`border-radius`).
4. **Remoção de Elementos Visuais:** Não exclua badges institucionais ("Mercado Líder Platinum", garantia, parcelamento, selos de segurança).
5. **Uso de Imagens Raster como Tela:** Nunca converta o HTML semântico em imagem estática de fundo.

### O QUE É PERMITIDO E ESPERADO DO CODEX:
1. **Injeção de Dados Dinâmicos:** Renderizar loops de produtos vindos da API, preenchendo os nós HTML existentes.
2. **Manipulação de Eventos:** Ligar listeners de clique, envio de formulário, paginação, filtros e navegação.
3. **Sanitização e Acessibilidade:** Adicionar atributos `aria-*`, melhorias semânticas sem impacto visual e tratamento de fallback de imagem (caso uma imagem de produto da API falhe).
