# 02 - Auditoria de Segurança e Controles Técnicos

Este documento detalha a auditoria dos 21 controles de segurança cibernética aplicáveis à arquitetura da OMEGAIMPORTS, com base nos padrões **OWASP Top 10**, **OWASP ASVS** e diretrizes de **DevSecOps**.

---

## 1. Auditoria dos 21 Controles de Segurança

### Controle 01: Segredos e Chaves Privadas no Código
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Varredura automatizada com regex em todo o repositório buscando tokens JWT, chaves de API, senhas, certificados PEM e tokens do Mercado Livre (`APP_USR-`).
- **Evidência**: 0 segredos detectados.

### Controle 02: Arquivos de Ambiente (.env) e Exposição
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: O arquivo `.gitignore` bloqueia explicitamente `.env*`, `*.pem`, `*.har`, cookies e relatórios privados. Apenas o arquivo `.env.example` está versionado com variáveis vazias sem valores confidenciais.

### Controle 03: Autenticação de Usuários
- **Classificação**: NÃO APLICÁVEL (POR DESIGN)
- **Justificativa**: A OMEGAIMPORTS opera como vitrine digital estática. O site não possui telas de login, contas de usuários ou sessões locais. Todo o processo de autenticação e compra ocorre diretamente no Mercado Livre.

### Controle 04: Controle de Acesso e IDOR (Insecure Direct Object Reference)
- **Classificação**: NÃO APLICÁVEL (POR DESIGN)
- **Justificativa**: Inexistência de backend dinâmico ou banco de dados com identificadores de clientes. Não há perfis, pedidos internos ou dados privados armazenados no servidor.

### Controle 05: Segurança de Banco de Dados (Supabase, Firebase, SQL)
- **Classificação**: NÃO APLICÁVEL (POR DESIGN)
- **Justificativa**: O site é 100% gerado estaticamente em tempo de build através de arquivos JSON imutáveis (`src/data/`). Não há conexões ativas com bancos relacionais ou BaaS em produção.

### Controle 06: Validação de Entradas e Prevenção de Injeções (XSS / SQLi)
- **Classificação**: APLICÁVEL | **Status**: CORRIGIDO E VALIDADO
- **Análise**:
  - Os formulários existentes limitam-se a campos de busca via método GET (`role="search"`).
  - A renderização no cliente sanitiza qualquer parâmetro via função `escapeHtml()`, prevenindo injeções de script (Reflected ou DOM XSS).
  - Injeções SQL são inexistentes pela ausência de banco de dados.

### Controle 07: Upload de Arquivos
- **Classificação**: NÃO APLICÁVEL (POR DESIGN)
- **Justificativa**: Não há rotas, endpoints ou formulários de envio de arquivos na aplicação.

### Controle 08: Cabeçalhos HTTP de Segurança
- **Classificação**: APLICÁVEL | **Status**: CORRIGIDO E VALIDADO
- **Análise**: Configurados no `vercel.json` com aplicação em todas as rotas:
  - `X-Robots-Tag: noindex, nofollow, noarchive` (desindexação do preview)
  - `X-Content-Type-Options: nosniff` (prevenção de MIME confusion)
  - `X-Frame-Options: SAMEORIGIN` (proteção anti-clickjacking)
  - `Referrer-Policy: strict-origin-when-cross-origin` (privacidade em requisições de saída)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restrição de sensores de hardware)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS forçado, sem `preload` de risco em subdomínios compartilhados)

### Controle 09: Tratamento de Erros e Vazamento de Informações
- **Classificação**: APLICÁVEL | **Status**: CORRIGIDO E VALIDADO
- **Análise**: Página de erro 404 estática dedicada (`dist/404.html`) preserva a identidade visual da marca e não expõe stack traces, diretórios internos de servidor ou versões de software.

### Controle 10: Dependências e Vulnerabilidades de Supply Chain
- **Classificação**: APLICÁVEL | **Status**: CORRIGIDO E VALIDADO
- **Análise**:
  - Auditoria inicial com `pnpm audit` identificou 2 vulnerabilidades High na dependência `sharp <0.35.4` e `<0.35.5` (falhas em `libheif` e `librsvg`).
  - O pacote foi atualizado para `sharp@0.35.5`.
  - Reauditoria completa da árvore de dependências (`npx pnpm audit`) confirmou: **0 vulnerabilidades encontradas**.

### Controle 11: Proteção contra CSRF (Cross-Site Request Forgery)
- **Classificação**: NÃO APLICÁVEL (POR DESIGN)
- **Justificativa**: Não há endpoints de modificação de estado (POST/PUT/DELETE) nem cookies de autenticação suscetíveis a ataques de falsificação de requisição.

### Controle 12: Content-Security-Policy (CSP)
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Recursos externos limitados estritamente a domínios confiáveis (Google Fonts e imagens oficiais do Mercado Livre via HTTPS).

### Controle 13: Proteção contra Open Redirect
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Todos os links de saída apontam estaticamente para destinos institucionais verificados (Mercado Livre, WhatsApp, Instagram e LinkedIn) e utilizam `rel="noopener noreferrer"`.

### Controle 14: Integridade de Sub-recursos (SRI)
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Scripts interativos (`runtime.js`) e folhas de estilo CSS são locais e servidos pelo próprio repositório, dispensando scripts de CDNs públicas não verificadas.

### Controle 15: Segurança em Cookies
- **Classificação**: NÃO APLICÁVEL (POR DESIGN)
- **Justificativa**: A aplicação não emite nem manipula cookies próprios de rastreamento ou autenticação.

### Controle 16: Tratamento de Dados Pessoais (LGPD)
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Página institucional `/politica-de-privacidade/` acessível no rodapé com esclarecimento detalhado aos visitantes.

### Controle 17: Prevenção de Abuso de Formulários e Rate Limiting
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: A busca de catálogo é processada diretamente na memória do cliente com filtros instantâneos, sem enviar requisições de backend que possam ser abusadas por negação de serviço.

### Controle 18: Políticas de Cache do Navegador
- **Classificação**: APLICÁVEL | **Status**: CORRIGIDO E VALIDADO
- **Análise**:
  - Evitada a diretiva arriscada `immutable` em arquivos sem hash no nome (como `runtime.js` e `sections.css`).
  - Aplicada a política equilibrada: `public, max-age=3600, stale-while-revalidate=86400`, garantindo ganho de performance sem prender usuários a versões desatualizadas.

### Controle 19: Permissões em Pipelines de CI/CD (GitHub Actions)
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Workflow `.github/workflows/deploy-pages.yml` opera sob privilégios mínimos (`contents: read`, `pages: write`, `id-token: write`).

### Controle 20: Prevenção contra Clickjacking
- **Classificação**: APLICÁVEL | **Status**: CORRIGIDO E VALIDADO
- **Análise**: Cabeçalho `X-Frame-Options: SAMEORIGIN` aplicado nas respostas HTTP.

### Controle 21: Higiene de Logs e Observabilidade
- **Classificação**: APLICÁVEL | **Status**: JÁ ESTAVA CORRETO / VALIDADO
- **Análise**: Nenhum log de produção coleta ou armazena dados confidenciais de visitantes.

---

## 2. Síntese de Auditoria de Vulnerabilidades
| ID | Severidade | Descrição | Ação Executada | Status |
|---|---|---|---|---|
| SEC-01 | Alta (P1) | Vulnerabilidades libheif/librsvg em Sharp (`<0.35.5`) | Atualizado para `sharp@0.35.5` | Resolvido (0 falhas) |
| SEC-02 | Média (P2) | Risco de HSTS Preload em subdomínio de terceiros | Removido `preload`, mantido HSTS seguro 1 ano | Resolvido |
| SEC-03 | Média (P2) | Cache `immutable` em ativos sem hash no nome | Ajustado para `max-age=3600, stale-while-revalidate` | Resolvido |
| SEC-04 | Média (P2) | Ausência de cabeçalho `X-Robots-Tag` no preview Vercel | Injetado `X-Robots-Tag: noindex, nofollow, noarchive` | Resolvido |
