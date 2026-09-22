import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const OUT_DIR = path.resolve(__dirname, '../reports/final-parity');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2'
};

(async () => {
  console.log('Capturing from 4173');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Capture HOME header and footer (using /v2/index.html since that's our mocked V2 home)
  await page.goto('http://localhost:4173/omegaimports-catalogo/v2/index.html', { waitUntil: 'networkidle0' });
  
  const headerElem = await page.$('.site-header');
  fs.mkdirSync(path.join(OUT_DIR, 'header'), { recursive: true });
  await headerElem.screenshot({ path: path.join(OUT_DIR, 'header', 'home-reference.png') });

  const footerElem = await page.$('footer');
  fs.mkdirSync(path.join(OUT_DIR, 'footer'), { recursive: true });
  await footerElem.screenshot({ path: path.join(OUT_DIR, 'footer', 'home-reference.png') });

  // 2. Capture COMO COMPRAR header and footer
  await page.goto('http://localhost:4173/omegaimports-catalogo/como-comprar/', { waitUntil: 'networkidle0' });
  
  const internalHeaderElem = await page.$('.site-header');
  await internalHeaderElem.screenshot({ path: path.join(OUT_DIR, 'header', 'internal-current.png') });

  const internalFooterElem = await page.$('footer');
  await internalFooterElem.screenshot({ path: path.join(OUT_DIR, 'footer', 'internal-current.png') });

  await browser.close();
  console.log('Capture complete!');
})();
