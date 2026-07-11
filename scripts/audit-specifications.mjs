import { mkdirSync, writeFileSync } from "node:fs";
import { loadProducts, normalizeText } from "./shared.mjs";

const products = loadProducts({ all: true });
mkdirSync("reports", { recursive: true });
const rows = ["mlbId,title,label,value,severity,issue"];
let critical = 0;

for (const product of products) {
  for (const spec of product.specifications || []) {
    const text = normalizeText(`${spec.label} ${spec.value}`);
    const issues = [];
    if (/\b130\b/.test(text)) issues.push("valor 130 suspeito");
    if (/digite o codigo|digite o código/.test(text)) issues.push("placeholder Digite o código");
    if (/outro motivo/.test(text)) issues.push("placeholder Outro motivo");
    if (/caracteristicas principais|especificacoes tecnicas|aplicacoes/.test(text)) issues.push("cabeçalho usado como valor");
    if (/110v de entrada.*220v de saida/.test(text)) issues.push("especificação elétrica incompatível");
    for (const issue of issues) {
      if (product.status === "published") critical++;
      rows.push([product.mlbId, product.title, spec.label, spec.value, product.status === "published" ? "critical" : "warning", issue].map(csv).join(","));
    }
  }
}

writeFileSync("reports/specification-issues.csv", rows.join("\n"), "utf8");
if (critical) {
  console.error(`Auditoria de especificações encontrou ${critical} problemas críticos publicados.`);
  process.exit(1);
}
console.log(`Auditoria de especificações concluída: ${rows.length - 1} achados.`);

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
