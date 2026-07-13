import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["dist"];
const failures = [];
const warnings = [];
mkdirSync("reports", { recursive: true });

const forbidden = [
  ["Catalogo", "Catálogo sem acento"],
  ["Eletronica", "Eletrônica sem acento"],
  ["Automacao", "Automação sem acento"],
  ["Aplicacoes", "Aplicações sem acento"],
  ["Condicao", "Condição sem acento"],
  ["Alimentacao", "Alimentação sem acento"],
  ["Localizacao", "Localização sem acento"],
  ["Medicao", "Medição sem acento"],
  ["Funcao", "Função sem acento"],
  ["Descricao:", "Rótulo de descrição exposto"],
  ["Oferta OMEGAIMPORTS para", "Texto de template exposto"],
  ["Imagem verificada", "Badge interno exposto"],
  ["pending-review", "Status interno exposto"],
  ["imageStatus", "Campo interno exposto"],
  ["needs-review", "Status interno exposto"],
  ["Lorem ipsum", "Placeholder exposto"],
  ["adclean", "Código de extensão detectado"],
  ["ismanga", "Código de extensão detectado"],
];

for (const file of htmlFiles()) {
  const html = readFileSync(file, "utf8");
  const visible = stripHtml(html);
  for (const [term, issue] of forbidden) {
    if (visible.includes(term) || html.includes(term)) failures.push([file, issue, term]);
  }
  if (/[ÃÂ�]/.test(visible) || /Î©/.test(visible)) failures.push([file, "Caractere corrompido detectado", "mojibake"]);
  if (/\*\*/.test(visible)) failures.push([file, "Markdown exposto", "**"]);
  if (/\s{2,}/.test(visible.replace(/\s*\n\s*/g, " "))) warnings.push([file, "Espaço duplicado em texto visível", "whitespace"]);
  if (/\b(com|de|da|do|para|por)\./i.test(visible)) warnings.push([file, "Possível frase terminando em preposição", "preposition"]);
}

writeFileSync("reports/auditoria-copy-v5.md", [
  "# Auditoria de copy v5",
  "",
  `Arquivos HTML analisados: ${htmlFiles().length}.`,
  `Erros críticos: ${failures.length}.`,
  `Avisos: ${warnings.length}.`,
  "",
  "## Críticos",
  ...failures.map(([file, issue, term]) => `- ${file}: ${issue} (${term})`),
  "",
  "## Avisos",
  ...warnings.slice(0, 80).map(([file, issue, term]) => `- ${file}: ${issue} (${term})`),
  "",
].join("\n"), "utf8");

if (failures.length) {
  console.error(failures.map(([file, issue, term]) => `${file}: ${issue} (${term})`).join("\n"));
  process.exit(1);
}

console.log("Auditoria de copy concluída.");

function htmlFiles() {
  const files = [];
  for (const root of roots) if (existsSync(root)) walk(root, files);
  return files;
}

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, files);
    else if (extname(path) === ".html") files.push(path);
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}
