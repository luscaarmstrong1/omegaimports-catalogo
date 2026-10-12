# 05 - Pendências Externas e Instruções Operacionais

Este documento lista as configurações e integrações que demandam acessos administrativos, credenciais de terceiros ou ações manuais por parte do proprietário da OMEGAIMPORTS.

---

## 1. Google Search Console
- **Status**: PENDENTE DE ACESSO / CONFIGURAÇÃO EXTERNA
- **Descrição**: O site já gera o arquivo `sitemap.xml` estruturado com as 84 URLs oficiais. É necessário enviar o sitemap no painel do Google Search Console.
- **Instruções para o Operador**:
  1. Acesse [Google Search Console](https://search.google.com/search-console).
  2. Adicione a propriedade: `https://luscaarmstrong1.github.io/omegaimports-catalogo/` (ou domínio próprio caso configurado).
  3. No menu lateral, acesse **Sitemaps**.
  4. Insira a URL: `https://luscaarmstrong1.github.io/omegaimports-catalogo/sitemap.xml` e clique em **Enviar**.
  5. Monitore a cobertura de indexação.

---

## 2. Google Analytics 4 (GA4) / Microsoft Clarity
- **Status**: PENDENTE DE DECISÃO DO PROPRIETÁRIO
- **Descrição**: O pipeline de build está preparado para injetar o script de métricas sem comprometer a performance caso o proprietário forneça o identificador de mensuração.
- **Instruções para o Operador**:
  1. Crie uma propriedade GA4 em [analytics.google.com](https://analytics.google.com).
  2. Copie o Measurement ID (formato `G-XXXXXXXXXX`).
  3. Defina a variável de ambiente em tempo de build: `PUBLIC_GA_ID="G-XXXXXXXXXX"`.
  4. Caso deseje mapas de calor com Microsoft Clarity, defina: `PUBLIC_CLARITY_ID="XXXXXXXXXX"`.

---

## 3. Bing Webmaster Tools
- **Status**: PENDENTE DE ACESSO / CONFIGURAÇÃO EXTERNA
- **Descrição**: Cadastro da propriedade no mecanismo de busca da Microsoft (Bing).
- **Instruções para o Operador**:
  1. Acesse [Bing Webmaster Tools](https://www.bing.com/webmasters).
  2. Importe a propriedade verificada diretamente do Google Search Console (processo em um clique).
  3. Confirme o envio do `sitemap.xml`.

---

## 4. Domínio Customizado Próprio (Opcional)
- **Status**: PENDENTE DE DECISÃO COMERCIAL
- **Descrição**: Atualmente a produção oficial é hospedada em `https://luscaarmstrong1.github.io/omegaimports-catalogo/`. Caso a OMEGAIMPORTS registre um domínio próprio (ex: `omegaimports.com.br`):
- **Instruções para o Operador**:
  1. Contratar o domínio no Registro.br.
  2. Configurar os apontamentos DNS (CNAME para `luscaarmstrong1.github.io` ou registros A recomendados pelo GitHub Pages).
  3. Adicionar o arquivo `CNAME` na raiz do repositório contendo o domínio.
  4. Atualizar a constante `officialBaseUrl` em `scripts/shared.mjs` para o novo domínio canônico.

---

## 5. Token da API do Mercado Livre para Sincronização Automática
- **Status**: PENDENTE DE CREDENCIAL
- **Descrição**: O workflow `.github/workflows/sync-mercadolivre.yml` permite sincronizar automaticamente o catálogo com a loja do Mercado Livre via cron job.
- **Instruções para o Operador**:
  1. Gerar as credenciais no portal de desenvolvedores do Mercado Livre (App ID, Secret Key).
  2. No repositório GitHub, acessar **Settings > Secrets and variables > Actions**.
  3. Cadastrar as secrets `MELI_SYNC_API_KEY` e `MELI_SYNC_SERVICE_URL`.
