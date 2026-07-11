import { mkdirSync, writeFileSync } from "node:fs";
import { escapeHtml, loadProducts } from "./shared.mjs";
import { validateProducts } from "./products-utils.mjs";

const products = loadProducts({ all: true });
const { issues, critical } = validateProducts(products);
mkdirSync("reports", { recursive: true });

const csv = [
  "mlbId,title,status,reviewStatus,quantity,condition,category,price,permalink,imageStatus,blockingIssues",
  ...products.map((p) =>
    [
      p.mlbId,
      p.title,
      p.status,
      p.reviewStatus,
      p.quantity,
      p.condition,
      p.internalCategory,
      p.price ?? "",
      p.permalink,
      p.imageStatus,
      (p.blockingIssues || []).join("; "),
    ]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(","),
  ),
].join("\n");
writeFileSync("reports/auditoria-produtos.csv", csv, "utf8");

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Galeria de auditoria OMEGAIMPORTS</title><style>body{font-family:Arial,sans-serif;background:#070b12;color:#f7faff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #26364d;padding:8px;vertical-align:top}img{width:96px;height:96px;object-fit:contain;background:#eef2f7}.bad{color:#ffe600}</style></head><body><h1>Galeria de auditoria dos produtos</h1><p>${products.length} produtos auditados. Pendências: ${issues.length}. Críticas: ${critical.length}.</p><table><thead><tr><th>Imagem</th><th>MLB</th><th>Título</th><th>Status</th><th>Quantidade</th><th>Condição</th><th>Categoria</th><th>Preço</th><th>URL</th><th>Imagem</th><th>Bloqueios</th></tr></thead><tbody>${products.map((p) => `<tr><td><img src="../public${p.image}" alt="${escapeHtml(p.title)}"></td><td>${p.mlbId}</td><td>${escapeHtml(p.title)}</td><td>${p.status}</td><td>${p.quantity}</td><td>${p.condition}</td><td>${escapeHtml(p.internalCategory)}</td><td>${p.price ?? ""}</td><td><a href="${p.permalink}">${p.permalink}</a></td><td class="${p.imageStatus !== "verified" ? "bad" : ""}">${p.imageStatus}</td><td>${escapeHtml((p.blockingIssues || []).join("; "))}</td></tr>`).join("")}</tbody></table></body></html>`;
writeFileSync("reports/galeria-auditoria.html", html, "utf8");

for (const issue of issues) console.log(`WARN ${issue}`);
for (const item of critical) console.error(`CRITICAL ${item}`);
if (critical.length) process.exit(1);
console.log(`Auditoria de produtos concluída: ${products.length} produtos, ${issues.length} avisos, ${critical.length} críticos.`);
