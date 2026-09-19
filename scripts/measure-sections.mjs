import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-pos')
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9225/json/list', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const cur = id++;
    const handler = (e) => {
      const m = JSON.parse(e.data);
      if (m.id === cur) { ws.removeEventListener('message', handler); res(m.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });
  await new Promise(r => ws.onopen = r);
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:4180/preview-v2/' });
  await new Promise(r => setTimeout(r, 2000));
  
  const evalRes = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      hero: document.querySelector('.hero-section')?.getBoundingClientRect(),
      categories: document.querySelector('#categorias')?.getBoundingClientRect(),
      banners: document.querySelector('.categories-banners')?.getBoundingClientRect(),
      products: document.querySelector('#produtos')?.getBoundingClientRect(),
      blog: document.querySelector('#blog')?.getBoundingClientRect(),
      marcas: document.querySelector('#marcas')?.getBoundingClientRect(),
      support: document.querySelector('.support-section')?.getBoundingClientRect(),
      footer: document.querySelector('.site-footer')?.getBoundingClientRect(),
      scrollY: window.scrollY,
      docHeight: document.documentElement.scrollHeight
    })`
  });
  console.log('BOXES:', evalRes.result.value);
  ws.close();
  chrome.kill();
}
main().catch(console.error);
