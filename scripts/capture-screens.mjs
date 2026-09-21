import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const screenshotsDir = path.resolve(__dirname, '../reports/screenshots');

fs.mkdirSync(screenshotsDir, { recursive: true });

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

server.listen(4199, async () => {
  console.log('Server running on 4199');
  const pages = [
    { name: 'duvidas-frequentes', url: 'http://localhost:4199/omegaimports-catalogo/duvidas-frequentes/' },
    { name: 'politica-de-privacidade', url: 'http://localhost:4199/omegaimports-catalogo/politica-de-privacidade/' },
    { name: 'termos-de-uso', url: 'http://localhost:4199/omegaimports-catalogo/termos-de-uso/' },
    { name: 'como-comprar', url: 'http://localhost:4199/omegaimports-catalogo/como-comprar/' },
    { name: 'sobre', url: 'http://localhost:4199/omegaimports-catalogo/sobre/' },
    { name: 'contato', url: 'http://localhost:4199/omegaimports-catalogo/contato/' },
    { name: 'categorias', url: 'http://localhost:4199/omegaimports-catalogo/categorias/' },
    { name: 'blog', url: 'http://localhost:4199/omegaimports-catalogo/blog/' },
    { name: 'blog-artigo', url: 'http://localhost:4199/omegaimports-catalogo/blog/como-criar-sistemas-iot-para-locais-sem-wi-fi/' },
  ];

  for (const p of pages) {
    const outImg = path.join(screenshotsDir, `${p.name}.png`);
    console.log(`Capturing ${p.name}...`);
    try {
      await execFileAsync(chromePath, [
        '--headless=new',
        '--disable-gpu',
        '--window-size=1920,2600',
        `--screenshot=${outImg}`,
        p.url,
      ]);
      console.log(`Captured ${p.name}`);
    } catch (err) {
      console.error(`Error capturing ${p.name}:`, err.message);
    }
  }

  server.close();
  console.log('Finished capturing screenshots.');
  process.exit(0);
});
