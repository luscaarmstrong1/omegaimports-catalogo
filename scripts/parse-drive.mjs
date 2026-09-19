import https from 'node:https';
import fs from 'node:fs';

const url = 'https://drive.google.com/drive/folders/16_S2u0XgB_OKBGyrP8p-EPE160ZsYizS';

https.get(url, (res) => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    fs.writeFileSync('preview-v2/drive-raw.html', d);
    console.log('Saved drive-raw.html, size:', d.length);

    // Look for occurrences of known words from prompt:
    const keywords = ['brand', 'brands', 'payments', 'marketplaces', 'omegaimports-logo', 'visa', 'mastercard', 'shopee', 'mercado-livre', 'espressif', 'arduino', 'st.png', 'hi-link'];
    for (const kw of keywords) {
      const idx = d.indexOf(kw);
      console.log(`Keyword "${kw}": ${idx !== -1 ? 'FOUND at ' + idx : 'NOT found'}`);
      if (idx !== -1) {
        console.log('Snippet:', d.substring(Math.max(0, idx - 50), Math.min(d.length, idx + 100)));
      }
    }
  });
}).on('error', console.error);
