import fs from 'node:fs';

const html = fs.readFileSync('preview-v2/drive-raw.html', 'utf8');

// In Google Drive folder view, items inside the folder are fetched via an initial batch or API.
// Let's check DS (Data Store) callbacks in the HTML
const dsMatches = html.match(/AF_initDataCallback\(\{key: 'ds:\d+', hash: '\d+', data:([\s\S]*?)(?:, sideChannel:|\}\);)/g) || [];
console.log('DS blocks found:', dsMatches.length);

for (let i = 0; i < dsMatches.length; i++) {
  const block = dsMatches[i];
  console.log(`Block ${i} length:`, block.length);
  // find any strings ending in .png, .jpg, .svg
  const files = block.match(/[\w\-\.]+\.(?:png|svg|webp|jpg)/gi) || [];
  if (files.length > 0) {
    console.log(`Block ${i} files:`, Array.from(new Set(files)));
  }
}
