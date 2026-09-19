import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9229;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1672,941'
  ]);

  await sleep(1500);

  try {
    const vRes = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const vData = await vRes.json();
    const ws = new WebSocket(vData.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const cur = id++;
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === cur) {
            ws.removeEventListener('message', h);
            if (m.error) rej(m.error);
            else res(m.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method, params }));
      });
    }

    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:4180/' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    function sendSession(method, params = {}) {
      return new Promise((res, rej) => {
        const cur = id++;
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === cur) {
            ws.removeEventListener('message', h);
            if (m.error) rej(m.error);
            else res(m.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, sessionId, method, params }));
      });
    }

    await sendSession('Page.enable');
    await sendSession('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        const style = document.createElement('style');
        style.textContent = '* { animation: none !important; transition: none !important; } .reveal { opacity: 1 !important; transform: none !important; }';
        document.head.appendChild(style);
      `
    });

    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 1672,
      height: 941,
      deviceScaleFactor: 1,
      mobile: false
    });

    await sendSession('Page.navigate', { url: 'http://localhost:4180/' });
    await sleep(2500);
    await sendSession('Runtime.evaluate', { expression: 'document.fonts.ready' });

    const offsets = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const getTop = sel => {
          const el = document.querySelector(sel);
          return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 0;
        };
        return {
          hero: 0,
          categories: getTop('#categorias'),
          products: getTop('#produtos'),
          content: getTop('#blog'),
          footer: getTop('.support-section')
        };
      })()`,
      returnByValue: true
    });

    console.log('Offsets evaluated:', offsets.result.value);

    for (const [sec, y] of Object.entries(offsets.result.value)) {
      const shot = await sendSession('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: y, width: 1672, height: 941, scale: 1 },
        captureBeyondViewport: true
      });
      const buf = Buffer.from(shot.data, 'base64');
      const outPath = path.resolve(`preview-v2/_visual-tests/${sec}/current.png`);
      fs.writeFileSync(outPath, buf);
      const finalPath = path.resolve(`preview-v2/_visual-tests/final/${sec}-current.png`);
      fs.writeFileSync(finalPath, buf);
      console.log(`Saved ${sec} (1672x941) at y=${y}`);
    }

    // Full page desktop
    const docLayout = await sendSession('Runtime.evaluate', {
      expression: 'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
    });
    const fullHeight = Math.ceil(docLayout.result.value);
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 1672,
      height: fullHeight,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(800);

    const fullShot = await sendSession('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    const fullBuf = Buffer.from(fullShot.data, 'base64');
    fs.writeFileSync('preview-v2/_visual-tests/final/desktop-current.png', fullBuf);
    console.log(`Saved desktop-current.png (${fullBuf.length} bytes, 1672x${fullHeight})`);

    // Mobile (390x844)
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendSession('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    await sendSession('Page.navigate', { url: 'http://localhost:4180/' });
    await sleep(2000);

    const mobLayout = await sendSession('Runtime.evaluate', {
      expression: 'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
    });
    const mobHeight = Math.ceil(mobLayout.result.value);
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: mobHeight,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);

    const mobShot = await sendSession('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    const mobBuf = Buffer.from(mobShot.data, 'base64');
    fs.writeFileSync('preview-v2/_visual-tests/final/mobile-current.png', mobBuf);
    console.log(`Saved mobile-current.png (${mobBuf.length} bytes, 390x${mobHeight})`);

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
