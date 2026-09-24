import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";

const output = "reports/final-parity/como-comprar";
const referenceSource = "reports/reference-mockups/ChatGPT Image 19_09_2026, 20_48_51 (8).png";
const reference = `${output}/reference.png`;
const pageUrl = "http://127.0.0.1:4173/omegaimports-catalogo/como-comprar/";
const homeUrl = "http://127.0.0.1:4173/omegaimports-catalogo/";
const width = 935;
const referenceHeight = 1683;
const referenceHeaderHeight = 47;
const referenceMainHeight = 1398;

async function difference(leftPath, rightPath, overlayPath, diffPath) {
  const leftMetadata = await sharp(leftPath).metadata();
  const rightMetadata = await sharp(rightPath).metadata();
  const width = Math.min(leftMetadata.width, rightMetadata.width);
  const height = Math.min(leftMetadata.height, rightMetadata.height);
  const left = await sharp(leftPath).extract({ left: 0, top: 0, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const right = await sharp(rightPath).extract({ left: 0, top: 0, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const overlay = Buffer.from(right.data);
  for (let index = 3; index < overlay.length; index += 4) overlay[index] = 128;
  await sharp(left.data, { raw: left.info })
    .composite([{ input: overlay, raw: right.info, blend: "over" }])
    .png()
    .toFile(overlayPath);
  await sharp(left.data, { raw: left.info })
    .composite([{ input: right.data, raw: right.info, blend: "difference" }])
    .png()
    .toFile(diffPath);
}

mkdirSync(output, { recursive: true });
copyFileSync(referenceSource, reference);
await sharp(reference)
  .extract({ left: 0, top: referenceHeaderHeight, width, height: referenceMainHeight })
  .png()
  .toFile(`${output}/content-reference.png`);

const windowsChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const executablePath = process.env.CHROME_PATH || (existsSync(windowsChrome) ? windowsChrome : undefined);
const cdpEndpoint = process.argv.find((argument) => argument.startsWith("http://") || argument.startsWith("ws://"));
const browser = cdpEndpoint
  ? await chromium.connectOverCDP(cdpEndpoint)
  : await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
  const page = cdpEndpoint
    ? browser.contexts()[0].pages()[0]
    : await browser.newPage({ viewport: { width, height: referenceHeight }, deviceScaleFactor: 1 });
  await page.setViewportSize({ width, height: referenceHeight });
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; } * { animation: none !important; transition: none !important; caret-color: transparent !important; } .reveal { opacity: 1 !important; transform: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  const main = page.locator("main");
  const mainBox = await main.boundingBox();
  if (!mainBox || Math.round(mainBox.width) !== width || Math.round(mainBox.height) !== referenceMainHeight) {
    throw new Error(`Main dimensions differ from reference: ${JSON.stringify(mainBox)}`);
  }
  await page.screenshot({ path: `${output}/current.png`, clip: { x: 0, y: 0, width, height: referenceHeight } });
  await page.screenshot({ path: `${output}/full-current.png`, fullPage: true });
  await main.screenshot({ path: `${output}/content-current.png` });
  await page.locator("header.site-header").screenshot({ path: `${output}/header-current.png` });
  await page.addStyleTag({ content: "body > :not(footer.site-footer) { display: none !important; } footer.site-footer { position: relative !important; inset: auto !important; width: 100% !important; }" });
  await page.locator("footer.site-footer").screenshot({ path: `${output}/footer-current.png` });
  const home = cdpEndpoint
    ? page
    : await browser.newPage({ viewport: { width, height: referenceHeight }, deviceScaleFactor: 1 });
  await home.goto(homeUrl, { waitUntil: "networkidle" });
  await home.addStyleTag({ content: "html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; } * { animation: none !important; transition: none !important; caret-color: transparent !important; } .reveal { opacity: 1 !important; transform: none !important; }" });
  await home.evaluate(() => document.fonts.ready);
  await home.locator("header.site-header").screenshot({ path: `${output}/header-home.png` });
  await home.addStyleTag({ content: "body > :not(footer.site-footer) { display: none !important; } footer.site-footer { position: relative !important; inset: auto !important; width: 100% !important; }" });
  await home.locator("footer.site-footer").screenshot({ path: `${output}/footer-home.png` });
  await home.close();
} finally {
  await browser.close();
}

await difference(reference, `${output}/current.png`, `${output}/overlay.png`, `${output}/diff.png`);
await difference(`${output}/content-reference.png`, `${output}/content-current.png`, `${output}/content-overlay.png`, `${output}/content-diff.png`);
await difference(`${output}/header-home.png`, `${output}/header-current.png`, `${output}/header-overlay.png`, `${output}/header-diff.png`);
await difference(`${output}/footer-home.png`, `${output}/footer-current.png`, `${output}/footer-overlay.png`, `${output}/footer-diff.png`);

console.log("Como Comprar captured at 935px with full-page, content, header and footer comparisons.");
