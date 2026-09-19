import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

async function measure() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9247',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-m')
  ]);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await fetch('http://127.0.0.1:9247/json/list').then(r => r.json());
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
    const ref5B64 = fs.readFileSync('preview-v2/assets/reference-v3/ChatGPT Image 19_09_2026, 09_25_14 (5).png').toString('base64');

    const res = await send('Runtime.evaluate', {
      expression: `
        Promise.all([
          new Promise(r => { const i = new Image(); i.onload = () => r({name: 'ref4', w: i.naturalWidth, h: i.naturalHeight}); i.src = "data:image/png;base64," + "${ref4B64}"; }),
          new Promise(r => { const i = new Image(); i.onload = () => r({name: 'ref5', w: i.naturalWidth, h: i.naturalHeight}); i.src = "data:image/png;base64," + "${ref5B64}"; })
        ])
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
    try { fs.rmSync('.chrome-temp-m', { recursive: true, force: true }); } catch(e){}
  }
}

measure();
