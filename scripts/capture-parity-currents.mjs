import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const parityBase = path.resolve(__dirname, '../reports/visual-parity');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath.startsWith('/omegaimports-catalogo/')) {
    reqPath = reqPath.replace('/omegaimports-catalogo/', '/');
  }
  let filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const routes = [
  { folder: 'faq', url: 'http://localhost:4201/omegaimports-catalogo/duvidas-frequentes/' },
  { folder: 'privacy', url: 'http://localhost:4201/omegaimports-catalogo/politica-de-privacidade/' },
  { folder: 'terms', url: 'http://localhost:4201/omegaimports-catalogo/termos-de-uso/' },
  { folder: 'how-to-buy', url: 'http://localhost:4201/omegaimports-catalogo/como-comprar/' },
  { folder: 'about', url: 'http://localhost:4201/omegaimports-catalogo/sobre/' },
  { folder: 'contact', url: 'http://localhost:4201/omegaimports-catalogo/contato/' },
  { folder: 'categories', url: 'http://localhost:4201/omegaimports-catalogo/categorias/' },
  { folder: 'blog', url: 'http://localhost:4201/omegaimports-catalogo/blog/' },
  { folder: 'blog-article', url: 'http://localhost:4201/omegaimports-catalogo/blog/como-criar-sistemas-iot-para-locais-sem-wi-fi/' },
];

server.listen(4201, async () => {
  console.log('Servidor de captura ativo em http://localhost:4201');

  for (const r of routes) {
    const outDir = path.join(parityBase, r.folder);
    fs.mkdirSync(outDir, { recursive: true });
    const currentImg = path.join(outDir, 'current.png');
    console.log(`[+] Capturando página renderizada: ${r.folder}...`);

    try {
      await execFileAsync(chromePath, [
        '--headless=new',
        '--disable-gpu',
        '--window-size=1920,2400',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        `--screenshot=${currentImg}`,
        r.url,
      ]);
      console.log(`[OK] Salvo: ${currentImg}`);
    } catch (err) {
      console.error(`[ERRO] Falha ao capturar ${r.folder}:`, err.message);
    }
  }

  server.close();
  console.log('Captura concluída.');
  process.exit(0);
});
