import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".xml": "application/xml",
  ".txt": "text/plain"
};

const port = process.env.PORT || 4180;

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  let pathname = url.pathname.replace(/^\/preview-v2\/?/, "/").replace(/^\/omegaimports-catalogo\/preview-v2\/?/, "/") || "/";
  if (pathname === "/") pathname = "/index.html";

  let file = join("preview-v2", pathname);
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  }

  if (!existsSync(file)) {
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("404 Not Found in preview-v2");
    return;
  }

  const mime = types[extname(file).toLowerCase()] || "application/octet-stream";
  res.setHeader("content-type", mime);
  res.setHeader("access-control-allow-origin", "*");
  res.end(readFileSync(file));
}).listen(port, () => {
  console.log(`OMEGAIMPORTS V2 Preview ativa:`);
  console.log(`- http://localhost:${port}/`);
  console.log(`- http://localhost:${port}/preview-v2/`);
});
