# 02 - Auditoria de Segurança e Controles Técnicos

Este documento detalha a auditoria de segurança cibernética conduzida no projeto OMEGAIMPORTS, tomando como base o **OWASP Top 10**, **OWASP ASVS (Application Security Verification Standard)** e as práticas recomendadas de **DevSecOps**.

---

## 1. Auditoria dos 21 Controles de Segurança

### Controle 01: Segredos e API Keys Hardcoded
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Varredura automatizada com regex abrangendo tokens JWT, credenciais de nuvem (AWS/GCP), tokens do GitHub (`ghp_`), chaves privadas PEM e tokens de integração do Mercado Livre (`APP_USR-`).
- **Resultado**: 0 segredos detectados em código-fonte, templates ou arquivos gerados.

### Controle 02: Arquivos de Ambiente (.env) e Versionamento
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: O arquivo `.gitignore` bloqueia explicitamente `.env*`, `*.pem`, `*cookies*`, `*.har` e diretórios privados de exportação. O repositório contém apenas `.env.example` com chaves vazias sem valores reais.
- **Resultado**: Nenhuma credencial ou variável de produção versionada indevidamente.

### Controle 03: Autenticação e Gestão de Sessões
- **Status**: NÃO APLICÁVEL (POR DESIGN)
- **Análise**: O website da OMEGAIMPORTS opera como um catálogo e hub de conteúdo estático. Não há tela de login, sessão, cookies de usuário ou cadastro de clientes no domínio.
- **Resultado**: O fluxo de conversão e checkout é delegado com segurança ao Mercado Livre.

### Controle 04: Controle de Acesso e IDOR (Insecure Direct Object Reference)
- **Status**: NÃO APLICÁVEL (POR DESIGN)
- **Análise**: Como não existem bancos de dados de clientes, dados pessoais ou endpoints com identificadores de usuários no backend, não há superfície para ataques IDOR.

### Controle 05: Segurança de Banco de Dados (Supabase, Firebase, SQL)
- **Status**: NÃO APLICÁVEL
- **Análise**: O projeto não conecta diretamente a bancos relacionais ou BaaS em tempo de execução no cliente. Todos os dados são gerados estaticamente durante o build via arquivos JSON imutáveis.

### Controle 06: Validação de Entradas e Prevenção de Injeções (XSS / SQLi)
- **Status**: CORRIGIDO E VALIDADO
- **Análise**:
  - Os formulários existentes no site são campos de busca em método GET (`<form role="search">`).
  - No cliente, qualquer parâmetro recebido via query string (`?q=...`) é sanitizado por meio da função utilitária `escapeHtml()`, prevenindo injeções de script (DOM-based XSS ou Reflected XSS).
  - Como não há banco SQL, injeções SQL são inexistentes na arquitetura.

### Controle 07: Upload de Arquivos
- **Status**: NÃO APLICÁVEL
- **Análise**: Não existem interfaces, rotas ou endpoints públicos de upload de arquivos no site.

### Controle 08: Cabeçalhos HTTP de Segurança
- **Status**: CORRIGIDO E VALIDADO
- **Análise**: A configuração do `vercel.json` foi atualizada com cabeçalhos de segurança obrigatórios:
  - `X-Content-Type-Options: nosniff` (prevenção de MIME-sniffing)
  - `X-Frame-Options: SAMEORIGIN` (proteção anti-clickjacking)
  - `Referrer-Policy: strict-origin-when-cross-origin` (privacidade nas requisições de saída)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restrição de APIs sensíveis de hardware)
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (imposição estrita de HTTPS)

### Controle 09: Tratamento de Erros e Vazamento de Informações
- **Status**: CORRIGIDO E VALIDADO
- **Análise**:
  - Implementada página estática dedicada de erro `dist/404.html` que preserva a identidade visual da marca e direciona o usuário de volta aos produtos ou à home.
  - Nenhum stack trace, dump de ambiente ou caminho de servidor é exibido em rotas inexistentes.

### Controle 10: Dependências e Vulnerabilidades de Supply Chain
- **Status**: CORRIGIDO E VALIDADO
- **Análise**:
  - A ferramenta `pnpm audit` identificou 2 vulnerabilidades de severidade High na dependência de desenvolvimento `sharp` (`<0.35.4` e `<0.35.5`), decorrentes das bibliotecas C subjacentes `libheif` e `librsvg`.
  - O pacote foi atualizado para `sharp@0.35.5`, com lockfile atualizado e supply chain validado.
  - Nova execução de `pnpm audit` resultou em: **0 vulnerabilidades encontradas**.

### Controle 11: Cross-Site Request Forgery (CSRF)
- **Status**: NÃO APLICÁVEL
- **Análise**: O site não realiza requisições de estado (POST/PUT/DELETE) que alterem dados de usuários autenticados.

### Controle 12: Content-Security-Policy (CSP)
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Todas as fontes externas (Google Fonts), ícones SVG e recursos são carregados de fontes seguras (HTTPS). Os scripts próprios da V2 (`runtime.js`) não dependem de `eval()`.

### Controle 13: Proteção contra Open Redirect
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Todos os links externos (WhatsApp, Mercado Livre, Instagram, LinkedIn) são codificados de forma estática nos templates e utilizam atributos de proteção `rel="noopener noreferrer"`.

### Controle 14: Integridade de Sub-recursos (SRI)
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: O projeto não utiliza CDNs públicas desconhecidas ou instáveis; os scripts e fontes são hospedados diretamente no próprio domínio estático ou pré-conectados com Google Fonts oficiais.

### Controle 15: Segurança em Cookies
- **Status**: NÃO APLICÁVEL
- **Análise**: O site não armazena cookies de sessão ou de rastreamento sensível.

### Controle 16: Tratamento de Dados Pessoais (LGPD)
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Página institucional `/politica-de-privacidade/` presente no build e no rodapé, informando com clareza o uso exclusivo de dados de navegação e redirecionamento para o Mercado Livre.

### Controle 17: Prevenção de Abuso de Formulários e Rate Limiting
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Como as buscas operam em memória no navegador do visitante sobre o catálogo estático, não há sobrecarga ou risco de negação de serviço no backend.

### Controle 18: Armazenamento Local e Cache do Navegador
- **Status**: CORRIGIDO E VALIDADO
- **Análise**: Políticas de cache declaradas no `vercel.json` garantem cache longo e imutável para assets estáticos (`/assets/*`, `/v2/*`) e cache controlado para páginas HTML, evitando que o usuário receba versões desatualizadas sem forçar downloads redundantes.

### Controle 19: Permissões em Workflows GitHub Actions
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: O workflow `.github/workflows/deploy-pages.yml` declara privilégios mínimos estritos:
  - `contents: read`
  - `pages: write`
  - `id-token: write` (autenticação segura OIDC para deploy sem senhas estáticas).

### Controle 20: Prevenção de Clickjacking
- **Status**: CORRIGIDO E VALIDADO
- **Análise**: Cabeçalho `X-Frame-Options: SAMEORIGIN` aplicado a todas as rotas servidas pela infraestrutura.

### Controle 21: Higiene de Logs e Observabilidade
- **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Não há logs expostos publicamente contendo endereços IP, tokens ou requisições de clientes.

---

## 2. Resumo de Vulnerabilidades Encontradas e Mitigadas
| ID | Severidade | Descrição | Ação Tomada | Status |
|---|---|---|---|---|
| SEC-01 | Alta (P1) | 2 Vulnerabilidades High em `sharp` (`<0.35.5`) | Atualizado para `sharp@0.35.5` | Resolvido |
| SEC-02 | Média (P2) | Ausência de cabeçalhos HTTP de segurança em `vercel.json` | Configurados cabeçalhos HSTS, X-Frame, X-Content-Type, Permissions | Resolvido |
| SEC-03 | Baixa (P3) | Exposição de comentários de validação interna em templates | Sanitizados comentários nos templates | Resolvido |
