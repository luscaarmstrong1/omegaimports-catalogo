import { existsSync, mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const posts = JSON.parse(readFileSync("src/data/blog-posts.json", "utf8"));
mkdirSync("public/blog/covers", { recursive: true });

const stockByPost = {
  "como-escolher-sensor-corrente-monitoramento-energia": "motion-sensor-board",
  "sct-013-zmct123a-diferencas-aplicacoes": "factory-pcb-test",
  "como-utilizar-fonte-hi-link-hlk-pm01": "components-flatlay",
  "cuidados-fontes-ac-dc-compactas": "breadboard-adjustment",
  "ttgo-t-call-esp32-sim800l-conectividade-gsm": "esp32-display",
  "gps-neo-6m-alimentacao-antena-posicionamento": "motion-sensor-board",
  "como-escolher-fonte-bancada": "workbench-tools",
  "resistores-10k-100k-quando-utilizar": "arduino-breadboard",
  "varistores-protecao-surtos-circuitos": "components-flatlay",
  "contatores-supressores-protecao-bobinas-comandos": "factory-pcb-test",
  "split-bolt-prensa-cabos-organizacao-instalacoes": "electronics-assembly",
  "placa-fenolite-prototipos-eletronicos": "fpv-soldering-board",
  "interpretar-tensao-corrente-potencia-modulos-eletronicos": "arduino-breadboard",
  "como-escolher-fonte-esp32-modulos-gsm": "esp32-display",
  "erros-comuns-alimentacao-modulos-eletronicos": "breadboard-adjustment",
};

function escape(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function formatDate(value = "") {
  return String(value).slice(0, 10).split("-").reverse().join("/");
}

function wrap(text, max = 42) {
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

function overlaySvg(post, width, height, { title = true } = {}) {
  const lines = title ? wrap(post.title, width > 1300 ? 42 : 31) : [];
  const startY = height - 310;
  const titleSvg = lines.map((line, index) => `<text x="86" y="${startY + index * 62}" class="title">${escape(line)}</text>`).join("");
  const categoryY = title ? startY - 68 : height - 122;
  const summaryY = height - (lines.length ? 76 : 54);
  const leftOpacity = title ? ".94" : ".66";
  const midOpacity = title ? ".62" : ".34";
  const rightOpacity = title ? ".26" : ".08";
  const bottomOpacity = title ? ".84" : ".5";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="shade" x1="0" x2="1">
      <stop offset="0" stop-color="#030914" stop-opacity="${leftOpacity}"/>
      <stop offset=".48" stop-color="#071426" stop-opacity="${midOpacity}"/>
      <stop offset="1" stop-color="#10243D" stop-opacity="${rightOpacity}"/>
    </linearGradient>
    <linearGradient id="bottom" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#030914" stop-opacity="0"/>
      <stop offset="1" stop-color="#030914" stop-opacity="${bottomOpacity}"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0v60" fill="none" stroke="#42D7F5" stroke-opacity=".09"/>
    </pattern>
    <style>
      .eyebrow{font:850 27px Inter,Arial,sans-serif;letter-spacing:5px;fill:#42D7F5}
      .title{font:850 52px Manrope,Inter,Arial,sans-serif;fill:#fff}
      .summary{font:650 25px Inter,Arial,sans-serif;fill:#E7FAFE}
      .brand{font:900 24px Inter,Arial,sans-serif;letter-spacing:4px;fill:#fff}
      .credit{font:700 18px Inter,Arial,sans-serif;fill:#B7F3FF;opacity:.72}
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#shade)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)" opacity=".7"/>
  <rect width="${width}" height="${height}" fill="url(#bottom)"/>
  <circle cx="${width - 280}" cy="160" r="260" fill="#42D7F5" opacity=".13"/>
  <circle cx="${width - 430}" cy="${height - 60}" r="320" fill="#0878D1" opacity=".2"/>
  <path d="M${width - 440} 178h260M${width - 390} 230h180M${width - 480} ${height - 196}h360M${width - 430} ${height - 144}h260" stroke="#42D7F5" stroke-width="4" stroke-linecap="round" opacity=".52"/>
  <circle cx="${width - 440}" cy="178" r="8" fill="#FFE600"/><circle cx="${width - 180}" cy="178" r="8" fill="#42D7F5"/><circle cx="${width - 120}" cy="${height - 196}" r="8" fill="#B7F3FF"/>
  <text x="86" y="105" class="brand">OMEGAIMPORTS</text>
  <text x="86" y="${categoryY}" class="eyebrow">${escape(post.category.toUpperCase())}</text>
  ${titleSvg}
  <text x="86" y="${summaryY}" class="summary">${escape(post.readingTime)} · publicado em ${escape(formatDate(post.publishedAt))}</text>
  <text x="${width - 276}" y="${height - 42}" class="credit">Foto-base: Unsplash</text>
  </svg>`;
}

for (const [index, post] of posts.entries()) {
  const base = `public/blog/covers/${post.slug}`;
  const stockName = stockByPost[post.slug] || "components-flatlay";
  const stockPath = `public/blog/stock/${stockName}.jpg`;
  if (!existsSync(stockPath)) throw new Error(`Imagem de banco ausente: ${stockPath}`);

  const source = sharp(stockPath)
    .resize(1600, 900, { fit: "cover", position: index % 3 === 0 ? "attention" : "centre" })
    .modulate({ saturation: 0.92, brightness: 0.94 });
  const cardOverlay = Buffer.from(overlaySvg(post, 1600, 900, { title: false }));
  const heroOverlay = Buffer.from(overlaySvg(post, 1600, 900, { title: true }));
  const cardImage = source.clone().composite([{ input: cardOverlay, top: 0, left: 0 }]);
  const heroImage = source.clone().composite([{ input: heroOverlay, top: 0, left: 0 }]);
  const cardBuffer = await cardImage.clone().png().toBuffer();
  const heroBuffer = await heroImage.clone().png().toBuffer();

  await sharp(cardBuffer).avif({ quality: 62 }).toFile(`${base}.avif`);
  await sharp(cardBuffer).webp({ quality: 84 }).toFile(`${base}.webp`);
  await sharp(cardBuffer).jpeg({ quality: 88 }).toFile(`${base}.jpg`);
  await sharp(cardBuffer).resize(800, 450).webp({ quality: 84 }).toFile(`${base}-thumb.webp`);
  await sharp(heroBuffer).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 88 }).toFile(`${base}-og.jpg`);
}

console.log(`Capas com banco de imagens geradas: ${posts.length} artigos.`);
