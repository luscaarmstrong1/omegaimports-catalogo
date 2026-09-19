import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

async function findCoords() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9249',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-find')
  ]);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await fetch('http://127.0.0.1:9249/json/list').then(r => r.json());
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

            // Find rows where white cards exist
            // White card has r,g,b > 240
            const rowHits = [];
            for (let y = 0; y < img.naturalHeight; y += 10) {
              let whiteCount = 0;
              const data = ctx.getImageData(0, y, img.naturalWidth, 1).data;
              for (let x = 0; x < img.naturalWidth; x++) {
                const r = data[x * 4];
                const g = data[x * 4 + 1];
                const b = data[x * 4 + 2];
                if (r > 240 && g > 240 && b > 240) whiteCount++;
              }
              if (whiteCount > 500) {
                rowHits.push({ y, whiteCount });
              }
            }
            resolve({ w: img.naturalWidth, h: img.naturalHeight, rowHits });
          };
          img.src = "data:image/png;base64," + "${ref4B64}";
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log(JSON.stringify(res.result.value, null, 2));
    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
    try { fs.rmSync('.chrome-temp-find', { recursive: true, force: true }); } catch(e){}
  }
}

findCoords();
