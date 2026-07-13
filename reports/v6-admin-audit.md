# Auditoria admin v6

- Backend privado recebeu rota /admin/catalogo via rewrite Vercel.
- Admin não entra na navegação pública e envia noindex/nofollow.
- Login por e-mail permitido e senha scrypt em variável de ambiente.
- Sessão por cookie HttpOnly/Secure/SameSite=Lax, CSRF e rate limit simples.
- Snapshot enriquecido com sellerId, catalogListing, catalogProductId, returnedBySellerItemsSearch e eligibleForPublicCatalog.
- Nenhum token, client secret, refresh token ou senha foi versionado.
