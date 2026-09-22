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
  
  // Suporte a rotas com ou sem prefixo /omegaimports-catalogo
  let cleanPath = url.pathname.replace(/^\/omegaimports-catalogo/, "");
  if (!cleanPath || cleanPath === "") cleanPath = "/";

  // Se pedir rota da preview-v2, serve de preview-v2/
  if (cleanPath.startsWith("/preview-v2")) {
    let p = cleanPath.replace(/^\/preview-v2\/?/, "") || "index.html";
    let file = join("preview-v2", p);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (existsSync(file)) {
      const mime = types[extname(file).toLowerCase()] || "application/octet-stream";
      res.setHeader("content-type", mime);
      res.setHeader("access-control-allow-origin", "*");
      res.end(readFileSync(file));
      return;
    }
  }

  // Tentar servir de dist/
  let file = join("dist", cleanPath);
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  }

  if (!existsSync(file)) {
    // Tentar fallback 404
    file = join("dist", "404.html");
  }

  if (existsSync(file)) {
    const mime = types[extname(file).toLowerCase()] || "application/octet-stream";
    res.setHeader("content-type", mime);
    res.setHeader("access-control-allow-origin", "*");
    res.end(readFileSync(file));
  } else {
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("404 Not Found");
  }
}).listen(port, () => {
  console.log(`Servidor local OMEGAIMPORTS ativo na porta ${port}:`);
  console.log(`- http://localhost:${port}/ (Site Oficial em dist)`);
  console.log(`- http://localhost:${port}/omegaimports-catalogo/ (Com prefixo do GitHub Pages)`);
  console.log(`- http://localhost:${port}/preview-v2/ (Home V2 isolada)`);
});
