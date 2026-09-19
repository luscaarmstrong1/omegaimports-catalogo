import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

async function scanRef5() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9251',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-scan5')
  ]);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await fetch('http://127.0.0.1:9251/json/list').then(r => r.json());
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

    const ref5B64 = fs.readFileSync('preview-v2/assets/reference-v3/ChatGPT Image 19_09_2026, 09_25_14 (5).png').toString('base64');

    const res = await send('Runtime.evaluate', {
      expression: `
        new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            // Test footer strip slice: x=50, w=1200, y tests from 700 to 850
            const slices = {};
            [680, 720, 760, 800].forEach(y => {
              const c = document.createElement('canvas');
              c.width = 1200;
              c.height = 100;
              const cx = c.getContext('2d');
              cx.drawImage(img, 50, y, 1200, 100, 0, 0, 1200, 100);
              slices[y] = c.toDataURL('image/png').split(',')[1];
            });
            resolve(slices);
          };
          img.src = "data:image/png;base64," + "${ref5B64}";
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    for (const [y, b64] of Object.entries(res.result.value)) {
      fs.writeFileSync(`preview-v2/assets/payments/test-footer-${y}.png`, Buffer.from(b64, 'base64'));
      console.log(`Saved footer slice ${y}`);
    }
    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
    try { fs.rmSync('.chrome-temp-scan5', { recursive: true, force: true }); } catch(e){}
  }
}

scanRef5();
