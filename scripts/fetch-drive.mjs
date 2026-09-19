import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9240',
    '--disable-gpu',
    '--no-sandbox',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  try {
    const list = await fetch('http://127.0.0.1:9240/json/list').then(r => r.json());
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
    await send('Page.navigate', { url: 'https://drive.google.com/drive/folders/16_S2u0XgB_OKBGyrP8p-EPE160ZsYizS' });
    await new Promise(r => setTimeout(r, 8000));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('preview-v2/screenshots/drive-folder.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved drive screenshot');

    const htmlRes = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.substring(0, 2000)'
    });
    console.log('Drive Body Text:', htmlRes.result.value);
    ws.close();
  } finally {
    chrome.kill();
  }
}
main().catch(console.error);
