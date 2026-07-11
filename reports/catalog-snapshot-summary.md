# Snapshot Mercado Livre - resumo

Data: 2026-07-11

## Fonte

O repositório público agora consome o snapshot sanitizado do serviço privado por:

- `MELI_SYNC_SERVICE_URL`
- `MELI_SYNC_API_KEY`

## Execução local

Sem secrets configurados, `scripts/fetch-meli-snapshot.mjs` encerra com segurança e mantém a última base validada.

Resultado local:

- Snapshot API baixado: não.
- Motivo: `MELI_SYNC_SERVICE_URL` ou `MELI_SYNC_API_KEY` ausente.
- Base pública preservada: sim.
- Tokens expostos: não.

## Próximo passo

Após deploy do backend, configurar no repositório público:

- `MELI_SYNC_SERVICE_URL=https://<deploy-real>/`
- `MELI_SYNC_API_KEY=<valor-gerado-fora-do-repo>`
