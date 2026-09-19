import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

// In Ref 4 (w: 2170, h: 725):
// Row height is ~114px, but the logo itself is vertically centered.
// Let's crop clean bounding boxes around the actual logo graphics:
// Card width is 214, card gap is 12, start at x=86
// Logo boxes:
const brandsCrop = [
  { name: 'espressif.png', x: 100, y: 395, w: 185, h: 76 },
  { name: 'hi-link.png', x: 322, y: 395, w: 185, h: 76 },
  { name: 'arduino.png', x: 544, y: 395, w: 185, h: 76 },
  { name: 'st.png', x: 766, y: 395, w: 185, h: 76 },
  { name: 'texas-instruments.png', x: 988, y: 395, w: 185, h: 76 },
  { name: 'nexperia.png', x: 1210, y: 395, w: 185, h: 76 },
  { name: 'seeed-studio.png', x: 1432, y: 395, w: 185, h: 76 },
  { name: 'waveshare.png', x: 1654, y: 395, w: 195, h: 76 } // Give waveshare enough width for full text
];

// In Ref 5 (w: 1823, h: 863):
// Security badge is at x: 1300 to 1650, y: 700 to 760
// In test-footer-720, we can see the security badge right on the right!
// Shield icon + "COMPRA 100% SEGURA" + "Seus dados protegidos do início ao fim."
const securityCrop = [
  { name: 'security-badge.png', x: 1315, y: 698, w: 280, h: 62 }
];

async function extractAccurate() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9254',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-crop4')
  ]);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await fetch('http://127.0.0.1:9254/json/list').then(r => r.json());
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
    for (const [name, b64] of Object.entries(brandsRes.result.value)) {
      fs.writeFileSync(path.join(bDir, name), Buffer.from(b64, 'base64'));
      console.log(`Saved brand: ${name}`);
    }

    // Extract Security Badge from Ref 5
    const secScript = `
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const crops = ${JSON.stringify(securityCrop)};
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
        img.src = "data:image/png;base64," + "${ref5B64}";
      })
    `;

    const secRes = await send('Runtime.evaluate', {
      expression: secScript,
      awaitPromise: true,
      returnByValue: true
    });

    for (const [name, b64] of Object.entries(secRes.result.value)) {
      fs.writeFileSync(path.join('preview-v2/assets/brand', name), Buffer.from(b64, 'base64'));
      console.log(`Saved brand asset: ${name}`);
    }

    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
    try { fs.rmSync('.chrome-temp-crop4', { recursive: true, force: true }); } catch(e){}
  }
}

extractAccurate();
