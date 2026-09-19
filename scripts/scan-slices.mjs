import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

async function scanRef4() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9250',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-scan')
  ]);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await fetch('http://127.0.0.1:9250/json/list').then(r => r.json());
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

    const ref4B64 = fs.readFileSync('preview-v2/assets/reference-v3/ChatGPT Image 19_09_2026, 09_25_14 (4).png').toString('base64');

    const res = await send('Runtime.evaluate', {
      expression: `
        new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Test slices at y=390, y=410, y=440
            const slices = {};
            [360, 390, 420, 450].forEach(y => {
              const c = document.createElement('canvas');
              c.width = 300;
              c.height = 100;
              const cx = c.getContext('2d');
              cx.drawImage(img, 80, y, 300, 100, 0, 0, 300, 100);
              slices[y] = c.toDataURL('image/png').split(',')[1];
            });
            resolve(slices);
          };
          img.src = "data:image/png;base64," + "${ref4B64}";
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    for (const [y, b64] of Object.entries(res.result.value)) {
      fs.writeFileSync(`preview-v2/assets/brands/test-slice-${y}.png`, Buffer.from(b64, 'base64'));
      console.log(`Saved slice ${y}`);
    }
    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
    try { fs.rmSync('.chrome-temp-scan', { recursive: true, force: true }); } catch(e){}
  }
}

scanRef4();
