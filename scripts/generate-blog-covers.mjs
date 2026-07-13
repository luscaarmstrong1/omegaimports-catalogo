import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const posts = JSON.parse(readFileSync("src/data/blog-posts.json", "utf8"));
mkdirSync("public/blog/covers", { recursive: true });

function escape(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, max = 34) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > max) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function diagram(seed) {
  const x = 980 + (seed % 5) * 18;
  const y = 230 + (seed % 7) * 16;
  return `
    <g opacity=".92">
      <circle cx="${x}" cy="${y}" r="112" fill="none" stroke="#42D7F5" stroke-width="3"/>
      <path d="M${x - 210} ${y + 30} C ${x - 80} ${y - 120}, ${x + 60} ${y + 190}, ${x + 230} ${y + 10}" fill="none" stroke="#B7F3FF" stroke-width="5" stroke-linecap="round"/>
      <path d="M820 610h460M860 570h380M900 530h300" stroke="#42D7F5" stroke-width="3" opacity=".55"/>
      <circle cx="900" cy="530" r="9" fill="#FFE600"/><circle cx="1080" cy="570" r="9" fill="#42D7F5"/><circle cx="1240" cy="610" r="9" fill="#B7F3FF"/>
    </g>`;
}

function svg(post, index, width, height) {
  const lines = wrap(post.title, width > 1300 ? 34 : 28);
  const title = lines.map((line, i) => `<text x="92" y="${245 + i * 78}" class="title">${escape(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#030914"/><stop offset=".62" stop-color="#071426"/><stop offset="1" stop-color="#10243D"/></linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0v56" fill="none" stroke="#42D7F5" stroke-opacity=".08"/></pattern>
    <style>.eyebrow{font:800 34px Inter,Arial,sans-serif;letter-spacing:6px;fill:#42D7F5}.title{font:800 64px Manrope,Inter,Arial,sans-serif;fill:#fff}.summary{font:500 30px Inter,Arial,sans-serif;fill:#B7F3FF}.brand{font:900 30px Inter,Arial,sans-serif;letter-spacing:5px;fill:#fff}</style>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/><rect width="1600" height="900" fill="url(#grid)"/>
  <circle cx="1290" cy="210" r="270" fill="#42D7F5" opacity=".13"/><circle cx="1160" cy="760" r="260" fill="#0878D1" opacity=".18"/>
  ${diagram(index)}
  <text x="92" y="132" class="eyebrow">${escape(post.category.toUpperCase())}</text>
  ${title}
  <text x="92" y="650" class="summary">${escape(post.readingTime)} · OMEGAIMPORTS</text>
  <path d="M92 704h420" stroke="#42D7F5" stroke-width="6" stroke-linecap="round"/>
  <text x="92" y="808" class="brand">OMEGAIMPORTS</text>
  </svg>`;
}

for (const [index, post] of posts.entries()) {
  const base = `public/blog/covers/${post.slug}`;
  const image = sharp(Buffer.from(svg(post, index, 1600, 900)));
  await image.clone().resize(1600, 900).avif({ quality: 58 }).toFile(`${base}.avif`);
  await image.clone().resize(1600, 900).webp({ quality: 82 }).toFile(`${base}.webp`);
  await image.clone().resize(1600, 900).jpeg({ quality: 86 }).toFile(`${base}.jpg`);
  await image.clone().resize(800, 450).webp({ quality: 82 }).toFile(`${base}-thumb.webp`);
  await image.clone().resize(1200, 630).jpeg({ quality: 86 }).toFile(`${base}-og.jpg`);
}

console.log(`Capas v6 geradas: ${posts.length} artigos.`);
