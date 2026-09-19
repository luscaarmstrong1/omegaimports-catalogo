import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function getWS(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const currentId = msgId++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === currentId) {
        ws.removeEventListener('message', handler);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: currentId, method, params }));
  });
  return { ws, send };
}

async function fixBrandsShot() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.resolve('.chrome-temp-bshot');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${userData}`
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9232/json/list', res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
    });

    const page = list.find(p => p.type === 'page') || list[0];
    const { ws, send } = getWS(page.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:4180/preview-v2/' });
    await new Promise(r => setTimeout(r, 1500));

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const evalBox = await send('Runtime.evaluate', {
      expression: `(() => {
        const header = document.querySelector('#marcas');
        const row = document.querySelector('.brands-row');
        if (!header || !row) return null;
        const hb = header.getBoundingClientRect();
        const rb = row.getBoundingClientRect();
        return {
          x: Math.floor(hb.left + window.scrollX),
          y: Math.floor(hb.top + window.scrollY),
          width: Math.ceil(hb.width),
          height: Math.ceil(rb.bottom - hb.top + 20),
          scale: 1
        };
      })()`,
      returnByValue: true
    });

    const clip = evalBox.result.value;
    const result = await send('Page.captureScreenshot', {
      format: 'png',
      clip,
      captureBeyondViewport: true
    });

    fs.writeFileSync('handoff/omegaimports-v2-approved/03-screenshots/brands-approved.png', Buffer.from(result.data, 'base64'));
    console.log('Successfully captured full brands section (header + 8 cards)!');

    ws.close();
  } finally {
    chrome.kill();
    try { fs.rmSync(userData, { recursive: true, force: true }); } catch (e) {}
  }
}

fixBrandsShot().catch(console.error);
