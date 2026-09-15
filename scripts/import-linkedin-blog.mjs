import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const rawPath = "tmp-linkedin-extracted.json";
const postsPath = "src/data/blog-posts.json";
const calendarPath = "src/data/editorial-calendar.json";
const reportPath = "reports/linkedin-blog-integration.md";

const months = {
  janeiro: "01",
  fevereiro: "02",
  marco: "03",
  "março": "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

const categoryByTitle = [
  [/telemetria|manuten/i, "Telemetria industrial"],
  [/ttgo|sim800l|gprs|celular/i, "Comunicação celular"],
  [/wi-fi|bluetooth|lora|gsm|sem wi-fi/i, "IoT e conectividade"],
  [/esp32/i, "Placas e microcontroladores"],
];

const tagByTitle = [
  [/sem wi-fi|lora|locais sem/i, ["IoT", "LoRaWAN", "Telemetria", "LTE-M", "NB-IoT"]],
  [/telemetria industrial/i, ["Telemetria", "Sensores", "Manutenção", "Monitoramento remoto"]],
  [/wi-fi|bluetooth|gsm|lora/i, ["Wi-Fi", "Bluetooth", "GSM", "LoRa", "IoT"]],
  [/ttgo/i, ["TTGO T-Call", "ESP32", "SIM800L", "GSM/GPRS"]],
  [/sim800l/i, ["ESP32", "SIM800L", "GSM/GPRS", "IoT"]],
  [/microcontrolador/i, ["ESP32", "IoT", "Microcontroladores", "Prototipagem"]],
];

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 88);
}

function dateIso(text) {
  const match = String(text).match(/(\d{1,2}) de ([a-zç]+) de (\d{4})/i);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${months[month.toLowerCase()] || "01"}-${day.padStart(2, "0")}`;
}

function articleCover(item) {
  return item.imgs.find((img) => img.src.includes("article-cover_image"))?.src || "";
}

function cleanParagraphs(item) {
  const title = item.title;
  return (item.paragraphs || [])
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((paragraph) => paragraph !== title)
    .filter((paragraph) => paragraph !== "Lucas Silva")
    .filter((paragraph) => !paragraph.includes("Configurações de comentários"))
    .filter((paragraph) => !paragraph.includes("Nenhum comentário ainda"))
    .filter((paragraph) => !paragraph.includes("OMEGAIMPORTS — Tecnologia e componentes para projetos que avançam."))
    .filter((paragraph) => !paragraph.includes(";"));
}

function sectionsFromParagraphs(item) {
  const paragraphs = cleanParagraphs(item);
  const intro = [];
  const sections = [];
  let current = null;

  for (const paragraph of paragraphs) {
    const heading = paragraph.match(/^(\d{1,2}\.\s.+)$/)?.[1];
    if (heading) {
      if (current) sections.push(current);
      current = [heading.replace(/^\d+\.\s*/, ""), ""];
      continue;
    }
    if (!current) intro.push(paragraph);
    else current[1] = [current[1], paragraph].filter(Boolean).join("\n\n");
  }
  if (current) sections.push(current);

  if (intro.length) {
    sections.unshift(["Contexto do projeto", intro.join("\n\n")]);
  }
  return sections
    .map(([title, text]) => [title, text.replace(/\n{3,}/g, "\n\n").trim()])
    .filter(([, text]) => text.split(/\s+/).length >= 12);
}

function categoryFor(title) {
  return categoryByTitle.find(([pattern]) => pattern.test(title))?.[1] || "IoT e conectividade";
}

function tagsFor(title) {
  return tagByTitle.find(([pattern]) => pattern.test(title))?.[1] || ["IoT", "Eletrônica", "Automação"];
}

function relatedFor(title) {
  const normalized = title.toLowerCase();
  const categories = new Set(["iot-gsm-e-comunicacao"]);
  const families = new Set();
  if (normalized.includes("esp32")) categories.add("placas-e-microcontroladores");
  if (/ttgo|sim800l|gsm|gprs|celular/.test(normalized)) families.add("ttgo-t-call");
  if (/sensor|telemetria|monitoramento|manuten/.test(normalized)) categories.add("sensores-e-medicao");
  return {
    relatedCategories: [...categories],
    relatedFamilies: [...families],
  };
}

async function downloadCover(url, slug) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`Falha ao baixar capa ${slug}: ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  const base = `public/blog/covers/${slug}`;
  await sharp(input).resize(1400, 788, { fit: "cover" }).jpeg({ quality: 88, mozjpeg: true }).toFile(`${base}.jpg`);
  await sharp(input).resize(1400, 788, { fit: "cover" }).webp({ quality: 82 }).toFile(`${base}.webp`);
  await sharp(input).resize(1400, 788, { fit: "cover" }).avif({ quality: 55 }).toFile(`${base}.avif`);
  await sharp(input).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 88, mozjpeg: true }).toFile(`${base}-og.jpg`);
}

const raw = JSON.parse(readFileSync(rawPath, "utf8"));
const posts = [];
for (const item of raw) {
  const slug = slugify(item.title);
  const publishedAt = dateIso(item.allText);
  const coverUrl = articleCover(item);
  const sections = sectionsFromParagraphs(item);
  const summary = cleanParagraphs(item)[0] || item.title;
  const related = relatedFor(item.title);
  await downloadCover(coverUrl, slug);
  posts.push({
    slug,
    title: item.title,
    summary,
    category: categoryFor(item.title),
    tags: tagsFor(item.title),
    publishedAt,
    updatedAt: publishedAt,
    readingTime: item.text?.match(/(\d+\s*min)/i)?.[1] || `${Math.max(6, Math.round(sections.flatMap(([, text]) => text.split(/\s+/)).length / 220))} min de leitura`,
    author: "Omega Imports",
    source: "linkedin",
    sourceName: "LinkedIn",
    sourceUrl: item.url,
    cover: `blog/covers/${slug}`,
    coverAlt: `Imagem de capa do artigo ${item.title} publicado pela OMEGAIMPORTS no LinkedIn`,
    relatedCategories: related.relatedCategories,
    relatedFamilies: related.relatedFamilies,
    sections,
    references: [
      "Artigo original publicado pela OMEGAIMPORTS no LinkedIn.",
      "LinkedIn Page oficial da OMEGAIMPORTS.",
      "Contexto técnico de IoT, eletrônica, telemetria e automação aplicado ao catálogo OMEGAIMPORTS.",
    ],
  });
}

posts.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
writeFileSync(postsPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
writeFileSync(calendarPath, `${JSON.stringify(posts.map((post, index) => ({
  slug: post.slug,
  title: post.title,
  status: "published",
  publishedAt: post.publishedAt,
  source: "linkedin",
  sourceUrl: post.sourceUrl,
  order: index + 1,
})), null, 2)}\n`, "utf8");

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, [
  "# Integração do Blog com artigos do LinkedIn",
  "",
  `- Fonte verificada: https://www.linkedin.com/company/omegaimports/`,
  `- Artigos localizados no painel da OMEGAIMPORTS: ${posts.length}`,
  `- Artigos importados para o site: ${posts.length}`,
  `- Capas oficiais baixadas localmente: ${posts.length}`,
  `- Conteúdo importado em: ${new Date().toISOString()}`,
  "",
  "| Data original | Artigo | URL LinkedIn | Status no site |",
  "| --- | --- | --- | --- |",
  ...posts.map((post) => `| ${post.publishedAt} | ${post.title} | ${post.sourceUrl} | Importado |`),
  "",
  "Observação: a coleta foi feita em sessão autenticada manualmente pelo proprietário da conta, sem uso de API, sem credenciais e sem chamadas runtime ao LinkedIn no site publicado.",
  "",
].join("\n"), "utf8");

console.log(`Importados ${posts.length} artigos reais do LinkedIn.`);
