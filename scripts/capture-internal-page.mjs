import { copyFileSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";

const pages = {
  "como-comprar": {
    reference: "ChatGPT Image 19_09_2026, 20_48_51 (8).png",
    referenceHeaderHeight: 47,
    referenceMainHeight: 1398,
  },
  "termos-de-uso": {
    reference: "ChatGPT Image 19_09_2026, 20_48_51 (6).png",
    referenceHeaderHeight: 49,
    referenceMainHeight: 1245,
  },
  "politica-de-privacidade": {
    reference: "ChatGPT Image 19_09_2026, 20_48_50 (4).png",
    referenceHeaderHeight: 47,
    referenceMainHeight: 1268,
  },
  "duvidas-frequentes": {
    reference: "ChatGPT Image 19_09_2026, 20_48_50 (2).png",
    referenceHeaderHeight: 48,
    referenceMainHeight: 1236,
  },
};

const slug = process.argv[2];
const cdpEndpoint = process.argv.find((argument) => argument.startsWith("http://") || argument.startsWith("ws://"));
const config = pages[slug];
if (!config || !cdpEndpoint) {
  throw new Error("Use: node scripts/capture-internal-page.mjs <slug> <CDP endpoint>");
}

const width = 935;
const viewportHeight = 1683;
const baseUrl = "http://127.0.0.1:4173/omegaimports-catalogo/";
const output = `reports/final-parity/${slug}`;
const referenceSource = `reports/reference-mockups/${config.reference}`;
const reference = `${output}/reference.png`;
mkdirSync(output, { recursive: true });
copyFileSync(referenceSource, reference);

async function difference(leftPath, rightPath, overlayPath, diffPath) {
  const leftMetadata = await sharp(leftPath).metadata();
  const rightMetadata = await sharp(rightPath).metadata();
  const compareWidth = Math.min(leftMetadata.width, rightMetadata.width);
  const compareHeight = Math.min(leftMetadata.height, rightMetadata.height);
  const left = await sharp(leftPath).extract({ left: 0, top: 0, width: compareWidth, height: compareHeight }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const right = await sharp(rightPath).extract({ left: 0, top: 0, width: compareWidth, height: compareHeight }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const overlay = Buffer.from(right.data);
  for (let index = 3; index < overlay.length; index += 4) overlay[index] = 128;
  await sharp(left.data, { raw: left.info }).composite([{ input: overlay, raw: right.info, blend: "over" }]).png().toFile(overlayPath);
  await sharp(left.data, { raw: left.info }).composite([{ input: right.data, raw: right.info, blend: "difference" }]).png().toFile(diffPath);
}

await sharp(reference)
  .extract({ left: 0, top: config.referenceHeaderHeight, width, height: config.referenceMainHeight })
  .png()
  .toFile(`${output}/content-reference.png`);

const browser = await chromium.connectOverCDP(cdpEndpoint);
try {
  const page = browser.contexts()[0].pages()[0];
  await page.setViewportSize({ width, height: viewportHeight });
  await page.goto(`${baseUrl}${slug}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; } * { animation: none !important; transition: none !important; caret-color: transparent !important; } .reveal { opacity: 1 !important; transform: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  const main = page.locator("main");
  const mainBox = await main.boundingBox();
  if (!mainBox || Math.round(mainBox.width) !== width) throw new Error(`Unexpected main bounds: ${JSON.stringify(mainBox)}`);
  await page.screenshot({ path: `${output}/current.png`, clip: { x: 0, y: 0, width, height: viewportHeight } });
  await page.screenshot({ path: `${output}/full-current.png`, fullPage: true });
  await main.screenshot({ path: `${output}/content-current.png` });
  await page.locator("header.site-header").screenshot({ path: `${output}/header-current.png` });
  await page.addStyleTag({ content: "body > :not(footer.site-footer) { display: none !important; } footer.site-footer { position: relative !important; inset: auto !important; width: 100% !important; }" });
  await page.locator("footer.site-footer").screenshot({ path: `${output}/footer-current.png` });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; } * { animation: none !important; transition: none !important; caret-color: transparent !important; } .reveal { opacity: 1 !important; transform: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("header.site-header").screenshot({ path: `${output}/header-home.png` });
  await page.addStyleTag({ content: "body > :not(footer.site-footer) { display: none !important; } footer.site-footer { position: relative !important; inset: auto !important; width: 100% !important; }" });
  await page.locator("footer.site-footer").screenshot({ path: `${output}/footer-home.png` });

  for (const responsiveWidth of [1440, 1920, 390, 375]) {
    await page.setViewportSize({ width: responsiveWidth, height: responsiveWidth <= 390 ? 844 : 1080 });
    await page.goto(`${baseUrl}${slug}/`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; } * { animation: none !important; transition: none !important; }" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/responsive-${responsiveWidth}.png`, fullPage: true });
  }

  console.log(JSON.stringify({ slug, main: { width: Math.round(mainBox.width), height: Math.round(mainBox.height) }, expectedMainHeight: config.referenceMainHeight }));
} finally {
  await browser.close();
}

await difference(reference, `${output}/current.png`, `${output}/overlay.png`, `${output}/diff.png`);
await difference(`${output}/content-reference.png`, `${output}/content-current.png`, `${output}/content-overlay.png`, `${output}/content-diff.png`);
await difference(`${output}/header-home.png`, `${output}/header-current.png`, `${output}/header-overlay.png`, `${output}/header-diff.png`);
await difference(`${output}/footer-home.png`, `${output}/footer-current.png`, `${output}/footer-overlay.png`, `${output}/footer-diff.png`);
