import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9231;

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

    const secBoxes = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const getBox = (selector) => {
          const els = Array.from(document.querySelectorAll(selector));
          if (!els.length) return null;
          let top = Infinity, bottom = -Infinity;
          els.forEach(el => {
            const r = el.getBoundingClientRect();
            const elTop = r.top + window.scrollY;
            const elBottom = elTop + r.height;
            if (elTop < top) top = elTop;
            if (elBottom > bottom) bottom = elBottom;
          });
          return { top: Math.round(top), height: Math.round(bottom - top) };
        };

        return {
          hero: getBox('header, .hero-section, .trust-strip:first-of-type'),
          categories: getBox('#categorias'),
          products: getBox('#produtos'),
          content: getBox('#blog, #marcas'),
          footer: getBox('.support-section, .trust-strip:last-of-type, .site-footer')
        };
      })()`,
      returnByValue: true
    });

    console.log('Section boxes evaluated:', secBoxes.result.value);

    // Capture each logical section
    for (const [sec, box] of Object.entries(secBoxes.result.value)) {
      if (!box) continue;
      const shot = await sendSession('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: box.top, width: 1672, height: box.height, scale: 1 },
        captureBeyondViewport: true
      });
      const buf = Buffer.from(shot.data, 'base64');
      fs.writeFileSync(`preview-v2/_visual-tests/${sec}/logical_section.png`, buf);
      console.log(`Saved logical section ${sec}: y=${box.top}, h=${box.height}`);
    }

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
