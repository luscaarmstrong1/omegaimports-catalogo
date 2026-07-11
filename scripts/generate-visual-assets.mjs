import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

mkdirSync("public/brand/visuals", { recursive: true });

function circuitSvg({ title, accent = "#00C8F8", bg = "#071426" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#0B203C"/></linearGradient></defs>
  <rect width="1200" height="760" fill="url(#g)"/>
  <g opacity=".23" fill="none" stroke="${accent}" stroke-width="3">
    <path d="M70 120h220v86h130v160h210v120h250"/>
    <path d="M126 590h190V452h220V270h160"/>
    <path d="M812 96v190h230v242"/>
    <path d="M920 638H710V520H510"/>
    <circle cx="70" cy="120" r="12"/><circle cx="420" cy="206" r="12"/><circle cx="630" cy="366" r="12"/><circle cx="880" cy="486" r="12"/>
    <circle cx="126" cy="590" r="12"/><circle cx="536" cy="452" r="12"/><circle cx="696" cy="270" r="12"/><circle cx="812" cy="96" r="12"/>
  </g>
  <g opacity=".14" fill="${accent}">
    ${Array.from({ length: 36 }, (_, i) => `<circle cx="${80 + (i * 97) % 1060}" cy="${80 + (i * 151) % 620}" r="${3 + (i % 4)}"/>`).join("")}
  </g>
  <title>${title}</title>
</svg>`;
}

const visuals = [
  ["hero-circuit-background.webp", circuitSvg({ title: "Fundo abstrato de circuitos para OMEGAIMPORTS", accent: "#68E3FF" }), 1200, 760],
  ["category-iot.webp", circuitSvg({ title: "Ilustração abstrata de conectividade IoT", accent: "#00C8F8", bg: "#071426" }), 900, 520],
  ["category-energy.webp", circuitSvg({ title: "Ilustração abstrata de energia", accent: "#FFE600", bg: "#0B203C" }), 900, 520],
  ["category-automation.webp", circuitSvg({ title: "Ilustração abstrata de automação", accent: "#168BFF", bg: "#071426" }), 900, 520],
  ["category-components.webp", circuitSvg({ title: "Ilustração abstrata de componentes", accent: "#68E3FF", bg: "#040914" }), 900, 520],
];

for (const [file, svg, width, height] of visuals) {
  await sharp(Buffer.from(svg)).resize(width, height).webp({ quality: 82 }).toFile(`public/brand/visuals/${file}`);
}

await sharp(Buffer.from(circuitSvg({ title: "Open Graph OMEGAIMPORTS", accent: "#68E3FF" }))).resize(1200, 630).jpeg({ quality: 86 }).toFile("public/brand/visuals/og-home.jpg");
writeFileSync(
  "public/brand/visuals/footer-pattern.svg",
  circuitSvg({ title: "Padrão abstrato de rodapé OMEGAIMPORTS", accent: "#00C8F8", bg: "#040914" }),
  "utf8",
);
console.log("Assets visuais decorativos gerados em public/brand/visuals/.");
