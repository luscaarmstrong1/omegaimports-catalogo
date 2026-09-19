# COMO EXECUTAR A OMEGAIMPORTS V2 LOCALMENTE

Instruções rápidas para validação da V2 congelada sem depender de serviços externos.

---

## 1. EXECUÇÃO VIA SERVIDOR ESTÁTICO (QUALQUER AMBIENTE)

Como a V2 foi estruturada com caminhos relativos e assets locais, ela pode ser servida por qualquer servidor HTTP estático.

### Opção A: Node.js (Sem instalar nada adicional)
```bash
# A partir da pasta do projeto:
npx serve handoff/omegaimports-v2-approved/01-preview-v2 -p 4180
# Ou diretamente:
node scripts/serve-v2.mjs
```

### Opção B: Python 3
```bash
cd handoff/omegaimports-v2-approved/01-preview-v2
python -m http.server 4180
```

### Opção C: VS Code Live Server
Basta abrir a pasta `01-preview-v2` no VS Code e clicar em **"Go Live"**.

---

## 2. VERIFICAÇÃO DE ROTA
- **URL Padrão de Homologação:** `http://localhost:4180/` ou `http://localhost:4180/preview-v2/`
- Verifique se todos os ícones, logos e imagens carregam instantaneamente sem erros 404 no console.
