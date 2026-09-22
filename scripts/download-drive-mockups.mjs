import fs from 'fs';
import path from 'path';

const list = JSON.parse(fs.readFileSync('scripts/drive-assets-list.json', 'utf8'));
const outDir = 'reference-mockups';
fs.mkdirSync(outDir, { recursive: true });

async function downloadFile(item) {
  // Strip suffix like -0-16 from the ID if present
  const cleanId = item.id.replace(/-0-16$/, '');
  const outPath = path.join(outDir, item.name);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`Already downloaded: ${item.name}`);
    return;
  }
  
  // Google Drive export / uc download url
  const urls = [
    `https://drive.google.com/uc?export=download&id=${cleanId}`,
    `https://drive.usercontent.google.com/download?id=${cleanId}&export=download&authuser=0`,
    `https://lh3.googleusercontent.com/d/${cleanId}`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 5000 && !buf.toString('utf8', 0, 100).includes('<!DOCTYPE html>')) {
          fs.writeFileSync(outPath, buf);
          console.log(`Successfully downloaded ${item.name} (${(buf.length / 1024).toFixed(1)} KB) from ${u}`);
          return;
        }
      }
    } catch (e) {
      // try next url
    }
  }
  console.error(`Failed to download ${item.name} (id: ${cleanId})`);
}

async function main() {
  for (const item of list) {
    await downloadFile(item);
  }
}

main().catch(console.error);
