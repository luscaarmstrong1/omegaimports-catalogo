import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Ref 4: w: 2170, h: 725.
// In slice 390, Espressif card was at:
// y in slice was 0 (which corresponds to y=390 in ref4)
// Card top was around y=380. Card height is 108.
// Card inner logo is centered inside the white card:
// Espressif logo: x: 105, y: 395, w: 170, h: 75
// Hi-Link logo: x: 325, y: 395, w: 170, h: 75
// Arduino logo: x: 545, y: 395, w: 170, h: 75
// ST logo: x: 765, y: 395, w: 170, h: 75
// Texas Instruments logo: x: 985, y: 395, w: 185, h: 75
// Nexperia logo: x: 1205, y: 395, w: 175, h: 75
// Seeed Studio logo: x: 1425, y: 395, w: 180, h: 75
// Waveshare logo: x: 1645, y: 395, w: 175, h: 75

const brandsCrop = [
  { name: 'espressif.png', x: 105, y: 395, w: 170, h: 75 },
  { name: 'hi-link.png', x: 325, y: 395, w: 170, h: 75 },
  { name: 'arduino.png', x: 545, y: 395, w: 170, h: 75 },
  { name: 'st.png', x: 765, y: 395, w: 170, h: 75 },
  { name: 'texas-instruments.png', x: 985, y: 395, w: 185, h: 75 },
  { name: 'nexperia.png', x: 1205, y: 395, w: 175, h: 75 },
  { name: 'seeed-studio.png', x: 1425, y: 395, w: 180, h: 75 },
  { name: 'waveshare.png', x: 1645, y: 395, w: 175, h: 75 }
];

// Ref 5: w: 1823, h: 863.
// In test-footer-720, Visa was at the very top edge:
// So cards start at y = 702 and end at y = 754 (h = 52).
// Visa: x = 68, y = 702, w = 82, h = 50
// Mastercard: x = 158, y = 702, w = 82, h = 50
// Elo: x = 248, y = 702, w = 82, h = 50
// Amex: x = 338, y = 702, w = 82, h = 50
// Hipercard: x = 428, y = 702, w = 82, h = 50
// Pix: x = 520, y = 702, w = 78, h = 50
// Boleto: x = 604, y = 702, w = 78, h = 50

// Marketplaces:
// Mercado Livre: x = 830, y = 700, w = 165, h = 54
// Shopee: x = 1018, y = 700, w = 145, h = 54

const paymentsCrop = [
  { name: 'visa.png', x: 68, y: 702, w: 82, h: 50 },
  { name: 'mastercard.png', x: 158, y: 702, w: 82, h: 50 },
  { name: 'elo.png', x: 248, y: 702, w: 82, h: 50 },
  { name: 'american-express.png', x: 338, y: 702, w: 82, h: 50 },
  { name: 'hipercard.png', x: 428, y: 702, w: 82, h: 50 },
  { name: 'pix.png', x: 520, y: 702, w: 78, h: 50 },
  { name: 'boleto.png', x: 604, y: 702, w: 78, h: 50 }
];

const marketplacesCrop = [
  { name: 'mercado-livre.png', x: 830, y: 700, w: 165, h: 54 },
  { name: 'shopee.png', x: 1018, y: 700, w: 145, h: 54 }
];

async function extract() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9253',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-crop3')
  ]);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await fetch('http://127.0.0.1:9253/json/list').then(r => r.json());
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise((res) => {
      const cur = id++;
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === cur) { ws.removeEventListener('message', h); res(m.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });
    await new Promise(r => ws.onopen = r);

    await send('Page.navigate', { url: 'about:blank' });
    await new Promise(r => setTimeout(r, 400));

    const ref4Path = path.resolve('preview-v2/assets/reference-v3/ChatGPT Image 19_09_2026, 09_25_14 (4).png');
    const ref4B64 = fs.readFileSync(ref4Path).toString('base64');

    const ref5Path = path.resolve('preview-v2/assets/reference-v3/ChatGPT Image 19_09_2026, 09_25_14 (5).png');
    const ref5B64 = fs.readFileSync(ref5Path).toString('base64');

    // Extract Brands
    const brandsScript = `
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const crops = ${JSON.stringify(brandsCrop)};
          const results = {};
          crops.forEach(c => {
            const canvas = document.createElement('canvas');
            canvas.width = c.w;
            canvas.height = c.h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
            results[c.name] = canvas.toDataURL('image/png').split(',')[1];
          });
          resolve(results);
        };
        img.src = "data:image/png;base64," + "${ref4B64}";
      })
    `;

    const brandsRes = await send('Runtime.evaluate', {
      expression: brandsScript,
      awaitPromise: true,
      returnByValue: true
    });

    const bDir = 'preview-v2/assets/brands';
    if (!fs.existsSync(bDir)) fs.mkdirSync(bDir, { recursive: true });
    for (const [name, b64] of Object.entries(brandsRes.result.value)) {
      fs.writeFileSync(path.join(bDir, name), Buffer.from(b64, 'base64'));
      console.log(`Saved brand: ${name}`);
    }

    // Extract Payments & Marketplaces from Ref 5
    const footerScript = `
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const pCrops = ${JSON.stringify(paymentsCrop)};
          const mCrops = ${JSON.stringify(marketplacesCrop)};
          const pResults = {};
          const mResults = {};
          pCrops.forEach(c => {
            const canvas = document.createElement('canvas');
            canvas.width = c.w;
            canvas.height = c.h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
            pResults[c.name] = canvas.toDataURL('image/png').split(',')[1];
          });
          mCrops.forEach(c => {
            const canvas = document.createElement('canvas');
            canvas.width = c.w;
            canvas.height = c.h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
            mResults[c.name] = canvas.toDataURL('image/png').split(',')[1];
          });
          resolve({ payments: pResults, marketplaces: mResults });
        };
        img.src = "data:image/png;base64," + "${ref5B64}";
      })
    `;

    const footerRes = await send('Runtime.evaluate', {
      expression: footerScript,
      awaitPromise: true,
      returnByValue: true
    });

    const pDir = 'preview-v2/assets/payments';
    if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });
    for (const [name, b64] of Object.entries(footerRes.result.value.payments)) {
      fs.writeFileSync(path.join(pDir, name), Buffer.from(b64, 'base64'));
      console.log(`Saved payment: ${name}`);
    }

    const mDir = 'preview-v2/assets/marketplaces';
    if (!fs.existsSync(mDir)) fs.mkdirSync(mDir, { recursive: true });
    for (const [name, b64] of Object.entries(footerRes.result.value.marketplaces)) {
      fs.writeFileSync(path.join(mDir, name), Buffer.from(b64, 'base64'));
      console.log(`Saved marketplace: ${name}`);
    }

    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
    try { fs.rmSync('.chrome-temp-crop3', { recursive: true, force: true }); } catch(e){}
  }
}

extract();
