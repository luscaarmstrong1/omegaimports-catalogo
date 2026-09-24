import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";

const failures = [];
const rows = [["file", "title", "description", "canonical", "jsonLdCount", "issue"].join(",")];
const expectedCanonicalBase = "https://luscaarmstrong1.github.io/omegaimports-catalogo/";
mkdirSync("reports", { recursive: true });

for (const file of htmlFiles("dist")) {
  const html = readFileSync(file, "utf8");
  const title = match(html, /<title>(.*?)<\/title>/);
  const description = match(html, /<meta name="description" content="([^"]+)"/);
  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/);
  const jsonLdCount = (html.match(/application\/ld\+json/g) || []).length;
  const issues = [];
  const exactCounts = [
    ["title", /<title>/g],
    ["description", /<meta name="description"/g],
    ["canonical", /<link rel="canonical"/g],
    ["og:title", /<meta property="og:title"/g],
    ["og:description", /<meta property="og:description"/g],
    ["og:url", /<meta property="og:url"/g],
    ["og:image", /<meta property="og:image"/g],
    ["twitter:card", /<meta name="twitter:card"/g],
    ["theme-color", /<meta name="theme-color"/g],
    ["manifest", /<link rel="manifest"/g],
  ];
  for (const [name, pattern] of exactCounts) {
    if ((html.match(pattern) || []).length !== 1) issues.push(`invalid-${name}-count`);
  }
  if ((html.match(/<link rel="icon"/g) || []).length !== 1) issues.push("invalid-favicon-count");
  if (!title || title.length < 18 || title.length > 90) issues.push("invalid-title");
  if (!description || description.length < 50 || description.length > 180) issues.push("invalid-description");
  if (!canonical || !canonical.startsWith(expectedCanonicalBase)) issues.push("invalid-canonical");
  if (!html.includes('property="og:title"')) issues.push("missing-og-title");
  if (!html.includes('name="twitter:card"')) issues.push("missing-twitter-card");
  if (jsonLdCount < 2) issues.push("missing-json-ld");
  if (issues.length) failures.push(`${file}: ${issues.join(";")}`);
  rows.push([file, title, description, canonical, jsonLdCount, issues.join(";")].map(csv).join(","));
}

writeFileSync("reports/auditoria-seo-v5.md", [
  "# Auditoria SEO v5",
  "",
  `Arquivos HTML analisados: ${htmlFiles("dist").length}.`,
  `Erros críticos: ${failures.length}.`,
  "",
  ...failures.map((item) => `- ${item}`),
  "",
].join("\n"), "utf8");
writeFileSync("reports/seo-audit-v5.csv", `${rows.join("\n")}\n`, "utf8");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Auditoria SEO concluída.");

function htmlFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...htmlFiles(path));
    else if (extname(path) === ".html") files.push(path);
  }
  return files;
}

function match(text, regex) {
  return text.match(regex)?.[1] || "";
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
