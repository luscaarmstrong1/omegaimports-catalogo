import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9235;

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
    '--window-size=1920,1080'
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

    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:4180/preview-v2/' });
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
        style.textContent = '* { animation: none !important; transition: none !important; } html, body { scrollbar-width: none !important; overflow-y: scroll !important; } ::-webkit-scrollbar { display: none !important; }';
        document.head.appendChild(style);
      `
    });

    const outDir = path.resolve('preview-v2/_visual-tests/v3-master');
    fs.mkdirSync(outDir, { recursive: true });

    // Viewports to test
    const viewports = [
      { name: 'desktop-1920', width: 1920, height: 1080, scale: 1, mobile: false },
      { name: 'desktop-1672', width: 1672, height: 941, scale: 1, mobile: false },
      { name: 'desktop-1440', width: 1440, height: 900, scale: 1, mobile: false },
      { name: 'mobile-390', width: 390, height: 844, scale: 2, mobile: true }
    ];

    for (const vp of viewports) {
      await sendSession('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.scale,
        mobile: vp.mobile
      });

      if (vp.mobile) {
        await sendSession('Emulation.setUserAgentOverride', {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        });
      }

      await sendSession('Page.navigate', { url: 'http://localhost:4180/preview-v2/' });
      await sleep(2500);
      await sendSession('Runtime.evaluate', { expression: 'document.fonts.ready' });

      // If desktop 1920, also capture each of the 5 visual-master sections
      if (vp.width === 1920) {
        const sections = ['hero', 'categories', 'products', 'content', 'footer'];
        for (const sec of sections) {
          const secBox = await sendSession('Runtime.evaluate', {
            expression: `(() => {
              const el = document.querySelector('[data-master-section="${sec}"]');
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return { x: 0, y: Math.round(r.top + window.scrollY), width: 1920, height: Math.round(r.height) };
            })()`,
            returnByValue: true
          });

          if (secBox.result && secBox.result.value) {
            const b = secBox.result.value;
            const shot = await sendSession('Page.captureScreenshot', {
              format: 'png',
              clip: { ...b, scale: 1 },
              captureBeyondViewport: true
            });
            const buf = Buffer.from(shot.data, 'base64');
            const secDir = path.join(outDir, `master-${sec}`);
            fs.mkdirSync(secDir, { recursive: true });
            fs.writeFileSync(path.join(secDir, 'current.png'), buf);
            console.log(`Saved master-${sec} current.png at 1920 (${b.width}x${b.height})`);
          }
        }
      }

      // Capture Full Page
      const docLayout = await sendSession('Runtime.evaluate', {
        expression: 'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
      });
      const fullHeight = Math.ceil(docLayout.result.value);

      await sendSession('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: fullHeight,
        deviceScaleFactor: vp.scale,
        mobile: vp.mobile
      });
      await sleep(800);

      const fullShot = await sendSession('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: vp.width, height: fullHeight, scale: 1 },
        captureBeyondViewport: true
      });
      const fullBuf = Buffer.from(fullShot.data, 'base64');
      fs.writeFileSync(path.join(outDir, `${vp.name}-current.png`), fullBuf);
      console.log(`Saved ${vp.name}-current.png (${vp.width}x${fullHeight})`);
    }

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
