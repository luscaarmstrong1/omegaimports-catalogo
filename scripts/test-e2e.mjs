import { existsSync, readFileSync } from "node:fs";

const required = [
  "dist/index.html",
  "dist/produtos/index.html",
  "dist/categorias/index.html",
  "dist/guias/index.html",
  "dist/404.html",
  "dist/sitemap.xml",
  "dist/robots.txt",
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`${file} não foi gerado`);
}
const home = readFileSync("dist/index.html", "utf8");
if (!home.includes("/omegaimports-catalogo/assets/site.css")) throw new Error("base path do CSS ausente");
if (!home.includes("logo-horizontal.webp")) throw new Error("logo ausente na Home");
console.log("Teste E2E estático concluído.");
