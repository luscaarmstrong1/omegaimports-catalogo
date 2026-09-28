import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const logoSvg = readFileSync("public/v2/assets/brand/omegaimports-logo-horizontal.svg", "utf8");
const pathMatch = logoSvg.match(/<path d="([^"]+)" fill="#FFD400"/);
if (!pathMatch) {
  throw new Error("Could not find yellow path in logo SVG");
}
const d = pathMatch[1];

// The path has bounds: X [0, 456], Y [0, 467]. Width=456, Height=467.
// In a 512x512 box:
// We want nice padding around the detailed symbol on dark navy background (#071426) with rounded corners (rx=112)
// Scale: 0.78 => width: 355.68, height: 364.26
// dx = (512 - 355.68)/2 = 78.16
// dy = (512 - 364.26)/2 = 73.87

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="OMEGAIMPORTS">
  <rect width="512" height="512" rx="112" fill="#071426"/>
  <g transform="translate(78.16, 73.87) scale(0.78)">
    <path d="${d}" fill="#FFD400" fill-rule="evenodd"/>
  </g>
</svg>
`;

writeFileSync("public/v2/assets/brand/favicon.svg", faviconSvg, "utf8");
writeFileSync("public/brand/favicon.svg", faviconSvg, "utf8");
writeFileSync("public/favicon.svg", faviconSvg, "utf8");
writeFileSync("public/brand/logo-symbol.svg", faviconSvg, "utf8");

// Generate PNGs
const buf = Buffer.from(faviconSvg);

// 32x32 favicon
await sharp(buf).resize(32, 32).png().toFile("public/v2/assets/brand/favicon-32.png");
await sharp(buf).resize(32, 32).png().toFile("public/brand/favicon-32.png");

// 180x180 apple-touch-icon
await sharp(buf).resize(180, 180).png().toFile("public/brand/apple-touch-icon.png");

// 512x512 logo-symbol
await sharp(buf).resize(512, 512).png().toFile("public/brand/logo-symbol.png");
await sharp(buf).resize(512, 512).webp({ quality: 90 }).toFile("public/brand/logo-symbol.webp");

// Also a test screenshot to view
await sharp(buf).resize(256, 256).png().toFile("reports/favicon-preview-256.png");
await sharp(buf).resize(32, 32).png().toFile("reports/favicon-preview-32.png");

console.log("All favicons and brand symbols updated with detailed yellow logo!");
