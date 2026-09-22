import fs from 'fs';
import path from 'path';

const dir = 'reference-mockups';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mockup Catalog</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f17; color: #f8fafc; margin: 0; padding: 24px; }
    h1 { font-size: 24px; margin-bottom: 24px; color: #38bdf8; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; }
    .card { background: #161e2e; border: 1px solid #283548; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; }
    .img-wrap { background: #000; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 240px; }
    img { width: 100%; height: auto; display: block; object-fit: contain; }
    .info { margin-top: 14px; }
    .title { font-size: 13px; font-weight: 600; color: #f1f5f9; word-break: break-all; margin-bottom: 6px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #0284c7; color: #fff; margin-bottom: 6px; }
    .dim { font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Catálogo de Mockups Oficiais — OMEGAIMPORTS (24 arquivos)</h1>
  <div class="grid">
`;

files.forEach((f, idx) => {
  const buf = fs.readFileSync(path.join(dir, f));
  let w = 0, h = 0;
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
    w = buf.readUInt32BE(16);
    h = buf.readUInt32BE(20);
  }
  const type = (h > w) ? 'PÁGINA VERTICAL COMPLETA (MOCKUP)' : (w > 2000) ? 'BANNER ULTRA-WIDE (ASSET)' : 'HERO / COMPOSIÇÃO HORIZONTAL';
  const badgeColor = (h > w) ? '#10b981' : (w > 2000) ? '#f59e0b' : '#6366f1';

  html += `    <div class="card">
      <div class="img-wrap">
        <a href="${f}" target="_blank"><img src="${f}" alt="${f}" loading="lazy"></a>
      </div>
      <div class="info">
        <span class="badge" style="background: ${badgeColor}">${type}</span>
        <div class="title">#${idx + 1}: ${f}</div>
        <div class="dim">Resolução: <strong>${w} × ${h}</strong> (Aspecto: ${(w/h).toFixed(2)}) | Tamanho: ${(buf.length / 1024).toFixed(1)} KB</div>
      </div>
    </div>
`;
});

html += `  </div>
</body>
</html>`;

fs.writeFileSync('reference-mockups/catalog.html', html, 'utf8');
console.log('Catálogo gerado em reference-mockups/catalog.html');
