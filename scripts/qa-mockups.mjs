import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 8999;
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0].replace("/omegaimports-catalogo", "");
  if (reqPath.endsWith("/")) reqPath += "index.html";
  const filePath = path.join("dist", reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  // 1. Blog Desktop
  const pageBlog = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  await pageBlog.goto(`http://localhost:${PORT}/omegaimports-catalogo/blog/`, { waitUntil: "networkidle" });
  await pageBlog.screenshot({ path: "screenshot-blog-desktop.png", fullPage: false });

  // 2. Article Desktop
  const pageArticle = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await pageArticle.goto(`http://localhost:${PORT}/omegaimports-catalogo/blog/como-criar-sistemas-iot-para-locais-sem-wi-fi/`, { waitUntil: "networkidle" });
  await pageArticle.screenshot({ path: "screenshot-article-desktop.png", fullPage: false });
  await pageArticle.evaluate(() => window.scrollBy(0, 1000));
  await pageArticle.waitForTimeout(200);
  await pageArticle.screenshot({ path: "screenshot-article-scrolled.png", fullPage: false });

  // 3. Article Mobile
  const pageArticleMobile = await browser.newPage({ viewport: { width: 390, height: 1600 } });
  await pageArticleMobile.goto(`http://localhost:${PORT}/omegaimports-catalogo/blog/como-criar-sistemas-iot-para-locais-sem-wi-fi/`, { waitUntil: "networkidle" });
  await pageArticleMobile.screenshot({ path: "screenshot-article-mobile.png", fullPage: false });

  await browser.close();
  server.close();
  console.log("Screenshots captured via HTTP server successfully.");
});
