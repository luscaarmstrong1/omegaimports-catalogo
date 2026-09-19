import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function runPipeline() {
  const tempProfile = path.resolve('./.chrome-temp-pipeline');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1672,941',
    `--user-data-dir=${tempProfile}`
  ]);

  await sleep(1500);

  try {
    const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const versionData = await targetsRes.json();
    const ws = new WebSocket(versionData.webSocketDebuggerUrl);

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    const { targetId } = await sendCDP(ws, 'Target.createTarget', { url: 'about:blank' }, msgId++);
    const { sessionId } = await sendCDP(ws, 'Target.attachToTarget', { targetId, flatten: true }, msgId++);

    async function sendSessionCDP(method, params = {}) {
      const curId = msgId++;
      return new Promise((resolve, reject) => {
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, sessionId, method, params }));
      });
    }

    await sendSessionCDP('Page.enable');
    await sendSessionCDP('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        const style = document.createElement('style');
        style.textContent = '* { animation: none !important; transition: none !important; }';
        document.head.appendChild(style);
      `
    });

    // 1. CAPTURE DESKTOP SECTIONS & FULL PAGE (1672x941)
    await sendSessionCDP('Emulation.setDeviceMetricsOverride', {
      width: 1672,
      height: 941,
      deviceScaleFactor: 1,
      mobile: false
    });

    await sendSessionCDP('Page.navigate', { url: 'http://localhost:4180/' });
    await sleep(2500);
    await sendSessionCDP('Runtime.evaluate', { expression: 'document.fonts.ready' });

    // Section selectors
    const sections = [
      { name: 'hero', selector: 'header, .hero-section, .trust-strip' },
      { name: 'categories', selector: '#categorias' },
      { name: 'products', selector: '#produtos' },
      { name: 'content', selector: '#blog, #marcas' },
      { name: 'footer', selector: '.support-section, .site-footer' }
    ];

    for (const sec of sections) {
      const box = await sendSessionCDP('Runtime.evaluate', {
        expression: `(() => {
          const els = Array.from(document.querySelectorAll('${sec.selector}'));
          if (!els.length) return null;
          let top = Infinity, bottom = -Infinity;
          els.forEach(el => {
            const r = el.getBoundingClientRect();
            const elTop = r.top + window.scrollY;
            const elBottom = elTop + r.height;
            if (elTop < top) top = elTop;
            if (elBottom > bottom) bottom = elBottom;
          });
          return { x: 0, y: top, width: 1672, height: bottom - top };
        })()`,
        returnByValue: true
      });

      if (box.result && box.result.value) {
        const val = box.result.value;
        const shot = await sendSessionCDP('Page.captureScreenshot', {
          format: 'png',
          clip: { ...val, scale: 1 },
          captureBeyondViewport: true
        });
        const buf = Buffer.from(shot.data, 'base64');
        const outPath = path.resolve(`preview-v2/_visual-tests/${sec.name}/current.png`);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, buf);
        console.log(`Saved section ${sec.name}: ${outPath} (${val.width}x${Math.round(val.height)})`);
      }
    }

    // Full page desktop
    const docLayout = await sendSessionCDP('Runtime.evaluate', {
      expression: 'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
    });
    const fullHeight = Math.ceil(docLayout.result.value);
    await sendSessionCDP('Emulation.setDeviceMetricsOverride', {
      width: 1672,
      height: fullHeight,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(800);

    const fullShot = await sendSessionCDP('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    const fullBuf = Buffer.from(fullShot.data, 'base64');
    fs.writeFileSync('preview-v2/_visual-tests/final/desktop-current.png', fullBuf);
    console.log(`Saved desktop-current.png (${fullBuf.length} bytes)`);

    // 2. MOBILE CAPTURE (390x844)
    await sendSessionCDP('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendSessionCDP('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    await sendSessionCDP('Page.navigate', { url: 'http://localhost:4180/' });
    await sleep(2000);

    const mobLayout = await sendSessionCDP('Runtime.evaluate', {
      expression: 'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
    });
    const mobHeight = Math.ceil(mobLayout.result.value);
    await sendSessionCDP('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: mobHeight,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);

    const mobShot = await sendSessionCDP('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    const mobBuf = Buffer.from(mobShot.data, 'base64');
    fs.writeFileSync('preview-v2/_visual-tests/final/mobile-current.png', mobBuf);
    console.log(`Saved mobile-current.png (${mobBuf.length} bytes)`);

    ws.close();
  } finally {
    chrome.kill();
    await sleep(500);
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {}
  }
}

runPipeline().catch(console.error);
