import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".xml": "application/xml", ".txt": "text/plain" };
createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  let path = url.pathname.replace(/^\/omegaimports-catalogo/, "") || "/";
  let file = join("dist", path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) file = "dist/404.html";
  res.setHeader("content-type", types[extname(file)] || "application/octet-stream");
  res.end(readFileSync(file));
}).listen(4173, () => console.log("Preview: http://localhost:4173/omegaimports-catalogo/"));
