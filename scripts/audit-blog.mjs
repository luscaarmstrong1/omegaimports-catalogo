import { existsSync, readFileSync, writeFileSync } from "node:fs";

const posts = JSON.parse(readFileSync("src/data/blog-posts.json", "utf8"));
const calendar = existsSync("src/data/editorial-calendar.json") ? JSON.parse(readFileSync("src/data/editorial-calendar.json", "utf8")) : [];
const issues = [];

for (const post of posts) {
  const words = (post.sections || []).flatMap((section) => String(section[1] || "").split(/\s+/).filter(Boolean)).length;
  if (!post.cover) issues.push([post.slug, "cover", "capa ausente"]);
  for (const ext of ["avif", "webp", "jpg"]) {
    if (!existsSync(`public/${post.cover}.${ext}`)) issues.push([post.slug, `cover.${ext}`, "arquivo ausente"]);
  }
  if ((post.sections || []).length < 8) issues.push([post.slug, "sections", "menos de 8 seções"]);
  if (words < 450) issues.push([post.slug, "depth", `conteúdo superficial (${words} palavras)`]);
  if (!post.publishedAt || !post.updatedAt) issues.push([post.slug, "dates", "datas editoriais ausentes"]);
  if (!calendar.some((entry) => entry.slug === post.slug && entry.status === "published")) issues.push([post.slug, "calendar", "calendário editorial sem entrada publicada"]);
}

writeFileSync("reports/v6-blog-audit.md", [
  "# Auditoria v6 do Blog",
  "",
  `- Artigos publicados: ${posts.length}`,
  `- Entradas no calendário editorial: ${calendar.length}`,
  `- Problemas: ${issues.length}`,
  "",
  issues.length ? issues.map((issue) => `- ${issue[0]}: ${issue[1]} - ${issue[2]}`).join("\n") : "Blog aprovado: artigos, capas e calendário editorial presentes.",
  "",
].join("\n"), "utf8");

if (posts.length < 15) issues.push(["blog", "count", "menos de 15 artigos"]);

if (issues.length) {
  console.error(`Audit blog falhou: ${issues.length} problema(s).`);
  process.exit(1);
}

console.log(`Auditoria de Blog v6 concluída: ${posts.length} artigos.`);
