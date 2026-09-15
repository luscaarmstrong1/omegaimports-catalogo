# Segurança

O site é estático e não processa checkout, login, pagamento ou dados sensíveis.

Medidas aplicadas:

- Links externos passam por validação de protocolo HTTPS e domínio Mercado Livre.
- CTAs externos usam `rel="noopener noreferrer sponsored"`.
- O catálogo é estruturado como dados, sem HTML arbitrário vindo dos produtos.
- Chaves de analytics ficam em variáveis de ambiente públicas e opcionais.
- Nenhuma credencial privada deve ser versionada.
- O importador opcional de planilhas Mercado Livre usa leitura local de XLSX por zip/XML e não avalia fórmulas ou macros.

## Cabeçalhos HTTP

O deploy público atual usa GitHub Pages, que não permite configurar cabeçalhos HTTP customizados por arquivo do repositório. Por isso, controles como `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` devem ser aplicados em uma camada compatível, como Cloudflare, proxy ou hospedagem que aceite headers por rota. Não há metatag equivalente segura para substituir esses cabeçalhos.

Para reportar problemas de segurança, use o canal institucional definido em `src/data/store.ts` quando ele estiver configurado.
