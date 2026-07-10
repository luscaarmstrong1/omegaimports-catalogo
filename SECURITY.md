# Segurança

O site é estático e não processa checkout, login, pagamento ou dados sensíveis.

Medidas aplicadas:

- Links externos passam por validação de protocolo HTTPS e domínio Mercado Livre.
- CTAs externos usam `rel="noopener noreferrer sponsored"`.
- O catálogo é estruturado como dados, sem HTML arbitrário vindo dos produtos.
- Chaves de analytics ficam em variáveis de ambiente públicas e opcionais.
- Nenhuma credencial privada deve ser versionada.

Para reportar problemas de segurança, use o canal institucional definido em `src/data/store.ts` quando ele estiver configurado.
