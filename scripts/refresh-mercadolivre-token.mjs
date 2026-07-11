const required = ["MELI_CLIENT_ID", "MELI_CLIENT_SECRET", "MELI_REFRESH_TOKEN"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.log(`Refresh de token Mercado Livre ignorado: secrets ausentes (${missing.join(", ")}).`);
  process.exit(0);
}

const response = await fetch("https://api.mercadolibre.com/oauth/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    refresh_token: process.env.MELI_REFRESH_TOKEN,
  }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Falha ao renovar token Mercado Livre: HTTP ${response.status} ${body.slice(0, 240)}`);
}

const data = await response.json();
console.log(JSON.stringify({ status: "ok", token_type: data.token_type, expires_in: data.expires_in, scope: data.scope || null }, null, 2));
