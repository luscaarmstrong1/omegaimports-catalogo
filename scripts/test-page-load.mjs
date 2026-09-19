import { spawn } from 'node:child_process';
import path from 'node:path';

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9235',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.resolve('.chrome-temp-test3')
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const list = await fetch('http://127.0.0.1:9235/json/list').then(r => r.json());
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const cur = id++;
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.id === cur) { ws.removeEventListener('message', h); res(m.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });
  await new Promise(r => ws.onopen = r);
  
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:4180/preview-v2/' });
  
  // Wait for loadEventFired
  await new Promise(res => {
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Page.loadEventFired') {
        ws.removeEventListener('message', h);
        res();
      }
    };
    ws.addEventListener('message', h);
  });
  await new Promise(r => setTimeout(r, 1000));

  const res = await send('Runtime.evaluate', {
    expression: "(() => ({ title: document.title, url: window.location.href, support: !!document.querySelector('.support-section'), bodyChildren: document.body.children.length }))()",
    returnByValue: true
  });
  console.log('Result:', res.result.value);
  ws.close();
  chrome.kill();
}
main().catch(console.error);
