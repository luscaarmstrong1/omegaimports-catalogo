import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const frozenRoot = resolve("tests/fixtures/v2-frozen");
const output = resolve("reports/v2-parity");
const widths = [1920, 1672, 1440, 1024, 768, 430, 390, 375];
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };

function server(root, port, stripBase = false) {
  const instance = createServer((req, res) => {
    let pathname = new URL(req.url || "/", "http://localhost").pathname;
    if (stripBase) pathname = pathname.replace(/^\/omegaimports-catalogo/, "") || "/";
    let file = join(root, decodeURIComponent(pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) file = join(root, "index.html");
    res.setHeader("content-type", types[extname(file)] || "application/octet-stream");
    res.end(readFileSync(file));
  });
  return new Promise((resolveReady) => instance.listen(port, "127.0.0.1", () => resolveReady(instance)));
}

function ssim(a, b) {
  const n = Math.min(a.length, b.length) / 4;
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    mx += .2126 * a[p] + .7152 * a[p + 1] + .0722 * a[p + 2];
    my += .2126 * b[p] + .7152 * b[p + 1] + .0722 * b[p + 2];
  }
  mx /= n; my /= n;
  let vx = 0, vy = 0, cov = 0;
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const x = .2126 * a[p] + .7152 * a[p + 1] + .0722 * a[p + 2] - mx;
    const y = .2126 * b[p] + .7152 * b[p + 1] + .0722 * b[p + 2] - my;
    vx += x * x; vy += y * y; cov += x * y;
  }
  vx /= n - 1; vy /= n - 1; cov /= n - 1;
  const c1 = 6.5025, c2 = 58.5225;
  return ((2 * mx * my + c1) * (2 * cov + c2)) / ((mx * mx + my * my + c1) * (vx + vy + c2));
}

mkdirSync(output, { recursive: true });
const frozenServer = await server(frozenRoot, 4311);
const productionServer = await server("dist", 4312, true);
let browser;
const results = [];
const maskCss = `.products-carousel { height: 0 !important; min-height: 0 !important; } .products-carousel > *, .blog-newsletter-grid > article { display: none !important; } .reveal { opacity: 1 !important; transform: none !important; } * { animation: none !important; transition: none !important; caret-color: transparent !important; }`;

try {
  const systemChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  browser = await chromium.launch({ headless: true, ...(existsSync(systemChrome) ? { executablePath: systemChrome } : {}) });
  for (const width of widths) {
    const shots = {};
    for (const [kind, url] of [["frozen", "http://127.0.0.1:4311/"], ["production", "http://127.0.0.1:4312/omegaimports-catalogo/"]]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.body.classList.add("home-v2"));
      await page.addStyleTag({ content: maskCss });
      await page.evaluate(() => window.scrollTo(0, 0));
      shots[kind] = join(output, `${width}-${kind}.png`);
      await page.screenshot({ path: shots[kind], fullPage: true });
      await page.close();
    }
    const fMeta = await sharp(shots.frozen).metadata();
    const pMeta = await sharp(shots.production).metadata();
    const height = Math.min(fMeta.height, pMeta.height);
    const left = await sharp(shots.frozen).extract({ left: 0, top: 0, width, height }).ensureAlpha().raw().toBuffer();
    const right = await sharp(shots.production).extract({ left: 0, top: 0, width, height }).ensureAlpha().raw().toBuffer();
    const score = ssim(left, right);
    const overlay = Buffer.from(right);
    for (let i = 3; i < overlay.length; i += 4) overlay[i] = 128;
    await sharp(shots.frozen).extract({ left: 0, top: 0, width, height }).composite([{ input: overlay, raw: { width, height, channels: 4 }, blend: "over" }]).png().toFile(join(output, `${width}-overlay.png`));
    await sharp({ create: { width, height, channels: 4, background: "black" } }).composite([{ input: await sharp(left, { raw: { width, height, channels: 4 } }).composite([{ input: right, raw: { width, height, channels: 4 }, blend: "difference" }]).png().toBuffer() }]).png().toFile(join(output, `${width}-diff.png`));
    results.push({ width, frozenHeight: fMeta.height, productionHeight: pMeta.height, ssim: Number(score.toFixed(6)), passed: score >= .99 && fMeta.height === pMeta.height });
    writeFileSync(join(output, "results.json"), JSON.stringify(results, null, 2), "utf8");
  }
} catch (error) {
  writeFileSync(join(output, "error.txt"), `${error.stack || error}\n`, "utf8");
  throw error;
} finally {
  await browser?.close();
  frozenServer.close();
  productionServer.close();
}
writeFileSync(join(output, "results.json"), JSON.stringify(results, null, 2), "utf8");
console.log(results.map((item) => `${item.width}px: SSIM ${item.ssim} (height ${item.frozenHeight}/${item.productionHeight})`).join("\n"));
if (results.some((item) => !item.passed)) process.exitCode = 1;
